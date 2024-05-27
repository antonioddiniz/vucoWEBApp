import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';






@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5074/api/auth';

  constructor(private http: HttpClient) { }


  login(email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, senha })
      .pipe(
        map(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
          }
          return response;
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    window.location.reload();
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return this.getToken() !== null;
  }

  getUserInfo(): Observable<any> {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token); 
      const userId = decodedToken.userId;
      console.log(userId)
      // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(`http://localhost:5074/v1/usuarios/${userId}`);
    } else {
      throw new Error('No token found');
    }
  }


}