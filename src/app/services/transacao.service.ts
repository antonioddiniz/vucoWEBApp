import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

interface Produto {
  id: number;
  nome: string;
}

interface Transacao {
  idUsuario1: number;
  idUsuario2: number;
  produtosUsuario1: Produto[];
  produtosUsuario2: Produto[];
  dataTransacao: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransacaoService {
  private apiUrl = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient,
              private authService: AuthService
  ) {}

  registrarTransacao(transacao: Transacao): Observable<any> {
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