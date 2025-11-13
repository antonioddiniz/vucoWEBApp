import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService, Chat } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { TransacaoService, Transacao } from '../../services/transacao.service';
import { CryptoService } from '../../services/crypto.service';
import { jwtDecode } from 'jwt-decode';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss'
})
export class ChatsComponent implements OnInit {
  chats: Chat[] = [];
  usuarioId: number = 0;
  carregando = true;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private transacaoService: TransacaoService,
    private cryptoService: CryptoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obterUsuarioId();
    this.carregarChats();
  }

  obterUsuarioId(): void {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.usuarioId = Number(decodedToken.userId);
    }
  }

  async carregarChats(): Promise<void> {
    this.carregando = true;
    
    try {
      // Busca chats primeiro
      const chats = await this.chatService.obterChatsPorUsuario(this.usuarioId).toPromise() || [];
      
      // Tenta buscar transações, mas não falha se não encontrar
      let transacoes: any[] = [];
      try {
        transacoes = await this.transacaoService.getTransacoesByUsuario().toPromise() || [];
      } catch (transacaoError: any) {
        console.warn('Não foi possível carregar transações:', transacaoError.status);
        // Continua sem transações - apenas com chats
      }
      
      console.log('Chats carregados:', chats);
      console.log('Transações carregadas:', transacoes);
      
      // Enriquece chats com dados das transações e descriptografa última mensagem
      this.chats = await Promise.all(
        chats.map(async (chat: any) => {
          const transacao: Transacao | undefined = transacoes.find((t: Transacao) => t.id === chat.transacaoId);
          
          // Descriptografa a última mensagem se existir
          let ultimaMensagem = chat.ultimaMensagem;
          if (ultimaMensagem && this.cryptoService.isEncrypted(ultimaMensagem.texto)) {
            try {
              const textoDescriptografado = await this.cryptoService.decrypt(
                ultimaMensagem.texto,
                chat.usuario1Id,
                chat.usuario2Id
              );
              ultimaMensagem = {
                ...ultimaMensagem,
                texto: textoDescriptografado
              };
            } catch (error) {
              console.error('Erro ao descriptografar última mensagem:', error);
            }
          }
          
          return {
            ...chat,
            transacao,
            ultimaMensagem
          } as Chat;
        })
      );
      
      console.log('Chats enriquecidos:', this.chats);
    } catch (err) {
      console.error('Erro ao carregar chats:', err);
    } finally {
      this.carregando = false;
    }
  }

  abrirConversa(chat: Chat): void {
    this.router.navigate(['/conversa', chat.id]);
  }

  formatarData(data: string): string {
    // Garante que a data seja interpretada corretamente
    const dataObj = new Date(data + 'Z'); // Adiciona Z para tratar como UTC
    const agora = new Date();
    
    // Calcula diferença em dias considerando timezone
    const dataObjBrasil = new Date(dataObj.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const agoraBrasil = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    
    // Zera horas para comparar apenas datas
    dataObjBrasil.setHours(0, 0, 0, 0);
    agoraBrasil.setHours(0, 0, 0, 0);
    
    const diff = agoraBrasil.getTime() - dataObjBrasil.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dias === 0) {
      return dataObj.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      });
    } else if (dias === 1) {
      return 'Ontem';
    } else if (dias < 7) {
      return `${dias} dias atrás`;
    } else {
      return dataObj.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    }
  }

  getProdutosUsuario(chat: Chat): any[] {
    if (!chat.transacao?.transacaoProdutos) return [];
    
    // Se eu sou Usuario1, quero ver meus produtos (UsuarioTipo = true)
    // Se eu sou Usuario2, quero ver meus produtos (UsuarioTipo = false)
    const souUsuario1 = chat.usuario1Id === this.usuarioId;
    
    return chat.transacao.transacaoProdutos
      .filter((tp: any) => tp.usuarioTipo === souUsuario1)
      .map((tp: any) => tp.produto);
  }

  getProdutosOutroUsuario(chat: Chat): any[] {
    if (!chat.transacao?.transacaoProdutos) return [];
    
    // Se eu sou Usuario1, quero ver os produtos do Usuario2 (UsuarioTipo = false)
    // Se eu sou Usuario2, quero ver os produtos do Usuario1 (UsuarioTipo = true)
    const souUsuario1 = chat.usuario1Id === this.usuarioId;
    
    return chat.transacao.transacaoProdutos
      .filter((tp: any) => tp.usuarioTipo !== souUsuario1)
      .map((tp: any) => tp.produto);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }
}
