import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, Chat, Mensagem, EnviarMensagemDto } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { interval, Subscription } from 'rxjs';
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
  mensagens: Mensagem[] = [];
  usuarioId: number = 0;
  novoTexto: string = '';
  carregando = true;
  enviando = false;
  
  private pollingSubscription?: Subscription;
  private shouldScroll = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obterUsuarioId();
    this.chatId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregarMensagens();
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
      this.usuarioId = decodedToken.userId;
    }
  }

  carregarMensagens(): void {
    this.carregando = true;
    this.chatService.obterMensagensDoChat(this.chatId).subscribe({
      next: (mensagens) => {
        this.mensagens = mensagens;
        this.carregando = false;
        this.shouldScroll = true;
        this.marcarMensagensComoLidas();
      },
      error: (err) => {
        console.error('Erro ao carregar mensagens:', err);
        this.carregando = false;
      }
    });
  }

  iniciarPolling(): void {
    // Atualizar mensagens a cada 3 segundos
    this.pollingSubscription = interval(3000)
      .pipe(switchMap(() => this.chatService.obterMensagensDoChat(this.chatId)))
      .subscribe({
        next: (mensagens) => {
          const quantidadeAnterior = this.mensagens.length;
          this.mensagens = mensagens;
          if (mensagens.length > quantidadeAnterior) {
            this.shouldScroll = true;
            this.marcarMensagensComoLidas();
          }
        },
        error: (err) => console.error('Erro no polling:', err)
      });
  }

  enviarMensagem(): void {
    if (!this.novoTexto.trim() || this.enviando) return;

    this.enviando = true;
    const dto: EnviarMensagemDto = {
      chatId: this.chatId,
      usuarioId: this.usuarioId,
      texto: this.novoTexto.trim()
    };

    this.chatService.enviarMensagem(dto).subscribe({
      next: (mensagem) => {
        this.mensagens.push(mensagem);
        this.novoTexto = '';
        this.enviando = false;
        this.shouldScroll = true;
      },
      error: (err) => {
        console.error('Erro ao enviar mensagem:', err);
        this.enviando = false;
      }
    });
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
    return mensagem.usuarioId === this.usuarioId;
  }

  formatarHora(data: string): string {
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
