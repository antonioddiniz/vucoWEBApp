import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
export class ListarProdutoService {
  private apiUrl = `${environment.apiUrl}/v1/produtos`;

  constructor(private http: HttpClient) { }

  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }
}
