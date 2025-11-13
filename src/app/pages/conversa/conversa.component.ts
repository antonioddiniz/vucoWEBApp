import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, Chat, Mensagem, EnviarMensagemDto } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { TransacaoService, Transacao } from '../../services/transacao.service';
import { CryptoService } from '../../services/crypto.service';
import { jwtDecode } from 'jwt-decode';
import { interval, Subscription, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-conversa',
  templateUrl: './conversa.component.html',
  styleUrl: './conversa.component.scss'
})
export class ConversaComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensagensContainer') mensagensContainer!: ElementRef;
  
  chatId: number = 0;
  chat: Chat | null = null;
  mensagens: Mensagem[] = []; // Começa vazio
  usuarioId: number = 0;
  novoTexto: string = '';
  carregando = true; // Mantém true até terminar de carregar
  enviando = false;
  carregandoChat = false;
  descriptografando = false;
  
  private pollingSubscription?: Subscription;
  private shouldScroll = false;
  
  // Variáveis para swipe gesture
  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchCurrentX = 0;
  private minSwipeDistance = 100;
  containerTransform = 'translateX(0)';
  isSwipingBack = false;
  private swipeDetected = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private transacaoService: TransacaoService,
    private cryptoService: CryptoService
  ) {}

  async ngOnInit(): Promise<void> {
    this.obterUsuarioId();
    this.chatId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Carrega chat e mensagens em sequência antes de iniciar polling
    await this.carregarChat();
    await this.carregarMensagens();
    
    // Só inicia polling depois que tudo estiver carregado
    this.iniciarPolling();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollParaBaixo();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  obterUsuarioId(): void {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.usuarioId = Number(decodedToken.userId);
    }
  }

  async carregarChat(): Promise<void> {
    this.carregandoChat = true;
    
    try {
      const { chats, transacoes } = await forkJoin({
        chats: this.chatService.obterChatsPorUsuario(this.usuarioId),
        transacoes: this.transacaoService.getTransacoesByUsuario()
      }).toPromise() as any;
      
      const chatEncontrado = chats.find((c: Chat) => c.id === this.chatId);
      
      if (chatEncontrado) {
        const transacao: Transacao | undefined = transacoes.find((t: Transacao) => t.id === chatEncontrado.transacaoId);
        this.chat = {
          ...chatEncontrado,
          transacao
        } as Chat;
        console.log('Chat carregado com transação:', this.chat);
      } else {
        this.chat = null;
      }
    } catch (err) {
      console.error('Erro ao carregar chat:', err);
    } finally {
      this.carregandoChat = false;
    }
  }

  async carregarMensagens(): Promise<void> {
    this.carregando = true;
    this.descriptografando = true;
    
    // Limpa mensagens imediatamente para evitar mostrar mensagens antigas criptografadas
    this.mensagens = [];
    
    try {
      const mensagens = await this.chatService.obterMensagensDoChat(this.chatId).toPromise();
      
      if (mensagens) {
        // Descriptografa as mensagens antes de exibir
        const mensagensDescriptografadas = await this.descriptografarMensagens(mensagens);
        
        // Só atualiza a interface após descriptografar
        this.mensagens = mensagensDescriptografadas;
        this.shouldScroll = true;
        this.marcarMensagensComoLidas();
      }
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    } finally {
      this.descriptografando = false;
      this.carregando = false;
    }
  }

  iniciarPolling(): void {
    // Atualizar mensagens a cada 3 segundos
    this.pollingSubscription = interval(3000)
      .pipe(
        switchMap(() => this.chatService.obterMensagensDoChat(this.chatId))
      )
      .subscribe({
        next: async (mensagens) => {
          const quantidadeAnterior = this.mensagens.length;
          
          // Descriptografa as mensagens ANTES de atualizar o array
          const mensagensDescriptografadas = await this.descriptografarMensagens(mensagens);
          
          // Só atualiza depois de descriptografar
          this.mensagens = mensagensDescriptografadas;
          
          if (mensagens.length > quantidadeAnterior) {
            this.shouldScroll = true;
            this.marcarMensagensComoLidas();
          }
        },
        error: (err) => console.error('Erro no polling:', err)
      });
  }

  async enviarMensagem(): Promise<void> {
    if (!this.novoTexto.trim() || this.enviando || !this.chat) return;

    this.enviando = true;
    
    try {
      // Criptografa a mensagem antes de enviar
      const textoCriptografado = await this.cryptoService.encrypt(
        this.novoTexto.trim(),
        this.chat.usuario1Id,
        this.chat.usuario2Id
      );
      
      const dto: EnviarMensagemDto = {
        chatId: this.chatId,
        usuarioId: this.usuarioId,
        texto: textoCriptografado
      };

      this.chatService.enviarMensagem(dto).subscribe({
        next: async (mensagem) => {
          // Descriptografa a mensagem recebida antes de adicionar à lista
          const mensagemDescriptografada = await this.descriptografarMensagem(mensagem);
          this.mensagens.push(mensagemDescriptografada);
          this.novoTexto = '';
          this.enviando = false;
          this.shouldScroll = true;
        },
        error: (err) => {
          console.error('Erro ao enviar mensagem:', err);
          this.enviando = false;
        }
      });
    } catch (error) {
      console.error('Erro ao criptografar mensagem:', error);
      this.enviando = false;
    }
  }

  marcarMensagensComoLidas(): void {
    this.chatService.marcarTodasMensagensComoLidas(this.chatId, this.usuarioId).subscribe();
  }

  scrollParaBaixo(): void {
    try {
      const container = this.mensagensContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      // Ignorar erro se o elemento ainda não estiver disponível
    }
  }

  voltar(): void {
    this.router.navigate(['/chats']);
  }

  ehMinhaMsg(mensagem: Mensagem): boolean {
    const isMyMessage = mensagem.usuarioId === this.usuarioId;
    console.log('Comparando mensagem:', {
      mensagemUsuarioId: mensagem.usuarioId,
      usuarioLogadoId: this.usuarioId,
      isMyMessage: isMyMessage
    });
    return isMyMessage;
  }

  formatarHora(data: string): string {
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  getProdutosUsuario(): any[] {
    if (!this.chat?.transacao?.transacaoProdutos) return [];
    
    const souUsuario1 = this.chat.usuario1Id === this.usuarioId;
    
    return this.chat.transacao.transacaoProdutos
      .filter((tp: any) => tp.usuarioTipo === souUsuario1)
      .map((tp: any) => tp.produto);
  }

  getProdutosOutroUsuario(): any[] {
    if (!this.chat?.transacao?.transacaoProdutos) return [];
    
    const souUsuario1 = this.chat.usuario1Id === this.usuarioId;
    
    return this.chat.transacao.transacaoProdutos
      .filter((tp: any) => tp.usuarioTipo !== souUsuario1)
      .map((tp: any) => tp.produto);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }
  
  /**
   * Descriptografa uma única mensagem
   */
  private async descriptografarMensagem(mensagem: Mensagem): Promise<Mensagem> {
    if (!this.chat) return mensagem;
    
    // Verifica se a mensagem está criptografada
    if (!this.cryptoService.isEncrypted(mensagem.texto)) {
      // Mensagem não está criptografada (provavelmente mensagem antiga)
      return mensagem;
    }
    
    try {
      const textoDescriptografado = await this.cryptoService.decrypt(
        mensagem.texto,
        this.chat.usuario1Id,
        this.chat.usuario2Id
      );
      
      return {
        ...mensagem,
        texto: textoDescriptografado
      };
    } catch (error) {
      console.error('Erro ao descriptografar mensagem:', error);
      return mensagem;
    }
  }
  
  /**
   * Descriptografa um array de mensagens
   */
  private async descriptografarMensagens(mensagens: Mensagem[]): Promise<Mensagem[]> {
    if (!this.chat) return mensagens;
    
    console.log(`Descriptografando ${mensagens.length} mensagens...`);
    
    const mensagensDescriptografadas = await Promise.all(
      mensagens.map(msg => this.descriptografarMensagem(msg))
    );
    
    console.log('Descriptografia concluída!');
    
    return mensagensDescriptografadas;
  }
  
  // Métodos para swipe gesture
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
    this.touchCurrentX = this.touchStartX;
    this.swipeDetected = false;
    
    // Apenas inicia swipe se começar da borda esquerda (primeiros 50px)
    if (this.touchStartX < 50) {
      this.isSwipingBack = true;
    }
  }
  
  onTouchMove(event: TouchEvent): void {
    if (!this.isSwipingBack) return;
    
    this.touchCurrentX = event.changedTouches[0].screenX;
    const diffX = this.touchCurrentX - this.touchStartX;
    const diffY = Math.abs(event.changedTouches[0].screenY - this.touchStartY);
    
    // Apenas permite swipe se movimento horizontal > vertical
    if (!this.swipeDetected && diffX > 10) {
      if (diffX > diffY) {
        this.swipeDetected = true;
      } else {
        // É um scroll vertical, cancela o swipe
        this.isSwipingBack = false;
        return;
      }
    }
    
    // Apenas permite swipe para direita (voltar)
    if (this.swipeDetected && diffX > 0) {
      event.preventDefault(); // Previne scroll enquanto faz swipe
      const translateX = Math.min(diffX, window.innerWidth); // Limita ao tamanho da tela
      this.containerTransform = `translateX(${translateX}px)`;
    }
  }
  
  onTouchEnd(event: TouchEvent): void {
    if (!this.isSwipingBack) return;
    
    this.touchEndX = event.changedTouches[0].screenX;
    this.isSwipingBack = false;
    this.handleSwipe();
  }
  
  private handleSwipe(): void {
    const swipeDistance = this.touchEndX - this.touchStartX;
    
    // Swipe da esquerda para direita (voltar)
    if (this.swipeDetected && swipeDistance > this.minSwipeDistance) {
      // Anima para fora antes de voltar
      this.containerTransform = 'translateX(100vw)';
      
      setTimeout(() => {
        this.voltar();
      }, 200);
    } else {
      // Volta para posição original com animação
      this.containerTransform = 'translateX(0)';
    }
    
    this.swipeDetected = false;
  }
}
