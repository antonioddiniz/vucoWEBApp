import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface TransacaoProduto {
  id: number;
  transacaoId: number;
  produtoId: number;
  usuarioTipo: boolean; // true = Usuario1, false = Usuario2
  produto: {
    id: number;
    nome: string;
    descricao?: string;
    imagem?: string;
  };
}

// Interface para criar nova transação
export interface CriarTransacaoDto {
  idUsuario1: number;
  idUsuario2: number;
  produtosUsuario1: number[];  // Array de IDs dos produtos
  produtosUsuario2: number[];  // Array de IDs dos produtos
  transacaoOriginalId?: number | null;
}

// Interface para transação completa retornada do backend
export interface Transacao {
  id: number;
  idUsuario1: number;
  idUsuario2: number;
  status: number;
  dataTransacao?: string;
  produtosUsuario1?: number[];  // Array de IDs dos produtos
  produtosUsuario2?: number[];  // Array de IDs dos produtos
  transacaoOriginalId?: number | null;
  transacaoProdutos?: TransacaoProduto[]; // Dados completos que vêm do backend
}

@Injectable({
  providedIn: 'root'
})
export class TransacaoService {
  private apiUrl = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient,
              private authService: AuthService
  ) {}

  registrarTransacao(transacao: CriarTransacaoDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrarTransacao`, transacao);
  }

  atualizarTransacao(transacao: any) {
    return this.http.put(`${this.apiUrl}/atualizarTransacao/${transacao.id}`, transacao);
  }

  getTransacoesByUsuarioByStatus(status: number): Observable<Transacao[]> {
    return this.authService.getUserInfo().pipe(
      switchMap(userInfo => {
        const userId = userInfo.id;
        if (!userId) {
          throw new Error('ID do usuário não encontrado nas informações do usuário.');
        }
        return this.http.get<Transacao[]>(`${this.apiUrl}/transacoes/usuario/${userId}/${status}`);
      })
    );
  }

  getTransacoesByUsuario(): Observable<Transacao[]> {
    return this.authService.getUserInfo().pipe(
      switchMap(userInfo => {
        const userId = userInfo.id;
        if (!userId) {
          throw new Error('ID do usuário não encontrado nas informações do usuário.');
        }
        return this.http.get<Transacao[]>(`${this.apiUrl}/transacoes/usuario/${userId}`);
      })
    );
  }



}