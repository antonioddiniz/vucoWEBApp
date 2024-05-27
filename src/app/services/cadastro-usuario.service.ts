import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CadastroUsuarioService {

  private apiUrl = 'http://localhost:5074/v1/registrarUsuario';

  constructor(private http: HttpClient) { }

  cadastrarUsuario(usuario: any) {
    return this.http.post(this.apiUrl, usuario);
  }
}
