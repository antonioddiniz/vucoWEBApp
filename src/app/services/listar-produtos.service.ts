import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ProdutoImagem {
  id: number;
  produtoId: number;
  url: string;
  ordem: number;
  dataCriacao: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  imagem: string;
  imagens?: ProdutoImagem[];
  status: number;
  dataDeCriacao: string;
  dataDeAlteracao: string;
  usuarioId: number;
  ativo: boolean;
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

  buscarProdutos(termo: string, pagina: number = 1, itensPorPagina: number = 20): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/v1/produtos/buscar`, {
      params: {
        q: termo,
        pagina: pagina.toString(),
        itensPorPagina: itensPorPagina.toString()
      }
    });
  }

  getFeedProdutos(pagina: number = 1, itensPorPagina: number = 10): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/v1/produtos/feed`, {
      params: {
        pagina: pagina.toString(),
        itensPorPagina: itensPorPagina.toString()
      }
    });
  }
}
