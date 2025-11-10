import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../app/services/auth.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  menuOpen: boolean = false;
  searchQuery: string = '';
  searchActive: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onSearchFocus(): void {
    this.searchActive = true;
  }

  onSearchBlur(): void {
    // Delay para permitir clique no botão de busca
    setTimeout(() => {
      this.searchActive = false;
    }, 200);
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      // Implemente sua lógica de busca aqui
      console.log('Buscar:', this.searchQuery);
      // Exemplo: this.router.navigate(['/busca'], { queryParams: { q: this.searchQuery } });
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchActive = false;
  }

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
    this.authService.logout();
  }

  redirectToCriarProduto() {
    this.closeMenu();
    this.router.navigate(['/criar-produto']);
  }

  redirectToTroca() {
    this.closeMenu();
    this.router.navigate(['/transacoes-recebidas']);
  }

  navigateToMyProducts(): void {
    this.closeMenu();
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

