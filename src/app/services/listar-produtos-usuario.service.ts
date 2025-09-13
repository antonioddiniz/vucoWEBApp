import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  imagem: string;
  status: number;
  dataDeCriacao: string;
  dataDeAlteracao: string;
  usuarioId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ListarProdutosUsuarioService {
  private apiUrl = 'http://localhost:5074/v1/produtos/usuario';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getProdutosByUsuario(): Observable<Produto[]> {
    return this.authService.getUserInfo().pipe(
      switchMap(userInfo => {
        const userId = userInfo.id;
        if (!userId) {
          throw new Error('ID do usuário não encontrado nas informações do usuário.');
        }
        return this.http.get<Produto[]>(`${this.apiUrl}/${userId}`);
      })
    );
  }
}
