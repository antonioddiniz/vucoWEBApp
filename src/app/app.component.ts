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
    this.router.navigate(['/lista-produto']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout(); // Chama o método logout do serviço de autenticação
  }

  redirectToCriarProduto() {
    console.log('Botão clicado, redirecionando para criar-produto');
    this.router.navigate(['/criar-produto']);
  }

  navigateToMyProducts(): void {
    this.authService.getUserInfo().subscribe(
      userInfo => {
        const userId = userInfo.id;
        this.router.navigate([`/produtos/usuario/${userId}`]);
      },
      error => {
        console.error('Erro ao obter informações do usuário:', error);
      }
    );
  }
  
  
  title = 'vucoAPPWeb2';
}

