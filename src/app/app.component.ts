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
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;

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
      this.router.navigate(['/busca'], { queryParams: { q: this.searchQuery } });
      this.searchActive = false;
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
    if (confirm('Tem certeza que deseja sair?')) {
      this.authService.logout();
      this.closeMenu();
    }
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

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndY = event.changedTouches[0].screenY;
    this.handleSwipe();
  }

  handleSwipe(): void {
    const diffX = this.touchStartX - this.touchEndX;
    const diffY = Math.abs(this.touchStartY - this.touchEndY);
    
    // Swipe para a direita (fechar menu) - deve ter movimento horizontal > 50px e movimento vertical < 100px
    if (diffX < -50 && diffY < 100) {
      this.closeMenu();
    }
  }
  
  title = 'vucoAPPWeb2';
}

