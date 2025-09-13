import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:5074/v1/produtos';

  constructor(private http: HttpClient) { }

  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }
}
