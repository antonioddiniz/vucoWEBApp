import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListarProdutoService } from '../../services/listar-produtos.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-busca-produtos',
  templateUrl: './busca-produtos.component.html',
  styleUrls: ['./busca-produtos.component.scss']
})
export class BuscaProdutosComponent implements OnInit, OnDestroy {
  produtos: any[] = [];
  termoBusca: string = '';
  isLoading: boolean = false;
  loggedUserId: number | string | null = null;
  
  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 20;
  totalItens: number = 0;
  totalPaginas: number = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private produtoService: ListarProdutoService,
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.getLoggedUserId();
    
    // Observa mudanças nos parâmetros da query string
    this.route.queryParams.subscribe(params => {
      this.termoBusca = params['q'] || '';
      if (this.termoBusca) {
        this.buscarProdutos();
      }
    });
  }

  getLoggedUserId(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.loggedUserId = decodedToken.userId || decodedToken.id || decodedToken.user_id || decodedToken.sub;
        
        if (typeof this.loggedUserId === 'string') {
          this.loggedUserId = parseInt(this.loggedUserId, 10);
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        this.loggedUserId = null;
      }
    }
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
  }

  buscarProdutos(): void {
    this.isLoading = true;
    
    this.produtoService.buscarProdutos(this.termoBusca, this.paginaAtual, this.itensPorPagina).subscribe({
      next: (response) => {
        this.produtos = response.produtos;
        this.totalItens = response.paginacao.totalItens;
        this.totalPaginas = response.paginacao.totalPaginas;
        this.paginaAtual = response.paginacao.paginaAtual;
        this.isLoading = false;
        // Scroll restaurado automaticamente pelo app.component
      },
      error: (error) => {
        console.error('Erro ao buscar produtos:', error);
        this.produtos = [];
        this.isLoading = false;
      }
    });
  }

  isProdutoDoUsuario(produto: any): boolean {
    if (!this.loggedUserId) {
      return false;
    }

    if (!produto.usuarioId && produto.usuarioId !== 0) {
      return false;
    }

    const produtoUsuarioId = typeof produto.usuarioId === 'string' 
      ? parseInt(produto.usuarioId, 10) 
      : produto.usuarioId;
    
    const loggedId = typeof this.loggedUserId === 'string'
      ? parseInt(this.loggedUserId.toString(), 10)
      : this.loggedUserId;

    return produtoUsuarioId === loggedId;
  }

  navigateToDetalhes(produtoId: number): void {
    // Abre modal em vez de navegar
    this.modalService.openDetalhesModal(produtoId);
  }

  navigateToTroca(produtoId: number): void {
    // Verifica se o usuário está logado
    if (!this.authService.isAuthenticated()) {
      alert('Você precisa estar logado para oferecer uma troca.');
      this.router.navigate(['/login']);
      return;
    }
    
    // Abre modal em vez de navegar
    this.modalService.openTrocaModal(produtoId);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }

  novaBusca(novoTermo: string): void {
    if (novoTermo.trim()) {
      this.router.navigate(['/busca'], { queryParams: { q: novoTermo } });
    }
  }

  mudarPagina(novaPagina: number): void {
    if (novaPagina >= 1 && novaPagina <= this.totalPaginas) {
      this.paginaAtual = novaPagina;
      this.buscarProdutos();
      // Scroll para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPaginas(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5; // Máximo de números de página a mostrar
    
    let inicio = Math.max(1, this.paginaAtual - Math.floor(maxPaginas / 2));
    let fim = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    
    if (fim - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fim - maxPaginas + 1);
    }
    
    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }
}
