import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../app/services/auth.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private router: Router,
    private authService: AuthService
  ) { }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  redirectToCadastro() {
    this.router.navigate(['/cadastro']);
  }

  redirectToHome() {
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout(); // Chama o método logout do serviço de autenticação
  }
  
  title = 'vucoAPPWeb2';
}

