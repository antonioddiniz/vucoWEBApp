import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private apiUrl = `${environment.apiUrl}/v1/produtos`;
  private usuariosUrl = `${environment.apiUrl}/v1/usuarios`;

  constructor(private http: HttpClient) {}

  getProdutoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getUsuarioById(id: number): Observable<any> {
    return this.http.get<any>(`${this.usuariosUrl}/${id}`);
  }

  getProdutosByUsuarioId(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/v1/produtos/usuario/${usuarioId}`);
  }

  deleteProduto(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/v1/deletarProduto/${id}`);
  }
}
