import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService, Chat } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';

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
      this.usuarioId = decodedToken.userId;
    }
  }

  carregarChats(): void {
    this.carregando = true;
    this.chatService.obterChatsPorUsuario(this.usuarioId).subscribe({
      next: (chats) => {
        this.chats = chats;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar chats:', err);
        this.carregando = false;
      }
    });
  }

  abrirConversa(chat: Chat): void {
    this.router.navigate(['/conversa', chat.id]);
  }

  formatarData(data: string): string {
    const dataObj = new Date(data);
    const agora = new Date();
    const diff = agora.getTime() - dataObj.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dias === 0) {
      return dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (dias === 1) {
      return 'Ontem';
    } else if (dias < 7) {
      return `${dias} dias atrás`;
    } else {
      return dataObj.toLocaleDateString('pt-BR');
    }
  }
}
