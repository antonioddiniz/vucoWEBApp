import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CadastroUsuarioService {

  private apiUrl = `${environment.apiUrl}/v1/registrarUsuario`;

  constructor(private http: HttpClient) { }

  cadastrarUsuario(usuario: any) {
    return this.http.post(this.apiUrl, usuario);
  }
}
