import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Transacao } from './transacao.service';

export interface Chat {
  id: number;
  transacaoId: number;
  usuario1Id: number;
  usuario2Id: number;
  dataCriacao: string;
  ultimaAtualizacao?: string;
  outroUsuarioId?: number;
  ultimaMensagem?: Mensagem;
  mensagensNaoLidas?: number;
  transacao?: Transacao;
}

export interface Mensagem {
  id: number;
  chatId: number;
  usuarioId: number;
  texto: string;
  dataEnvio: string;
  lida: boolean;
}

export interface EnviarMensagemDto {
  chatId: number;
  usuarioId: number;
  texto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/v1/chat`;
  private chatsSubject = new BehaviorSubject<Chat[]>([]);
  public chats$ = this.chatsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Obter todos os chats do usuário
  obterChatsPorUsuario(usuarioId: number): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.apiUrl}/usuario/${usuarioId}`).pipe(
      tap(chats => this.chatsSubject.next(chats))
    );
  }

  // Obter mensagens de um chat específico
  obterMensagensDoChat(chatId: number): Observable<Mensagem[]> {
    return this.http.get<Mensagem[]>(`${this.apiUrl}/${chatId}/mensagens`);
  }

  // Obter chat por transação
  obterChatPorTransacao(transacaoId: number): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}/transacao/${transacaoId}`);
  }

  // Criar novo chat
  criarChat(transacaoId: number): Observable<Chat> {
    return this.http.post<Chat>(this.apiUrl, transacaoId);
  }

  // Enviar mensagem
  enviarMensagem(dto: EnviarMensagemDto): Observable<Mensagem> {
    return this.http.post<Mensagem>(`${this.apiUrl}/mensagem`, dto);
  }

  // Marcar mensagem como lida
  marcarMensagemComoLida(mensagemId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/mensagem/${mensagemId}/marcar-lida`, {});
  }

  // Marcar todas as mensagens de um chat como lidas
  marcarTodasMensagensComoLidas(chatId: number, usuarioId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${chatId}/marcar-todas-lidas/${usuarioId}`, {});
  }

  // Limpar cache de chats
  limparChats(): void {
    this.chatsSubject.next([]);
  }
}
