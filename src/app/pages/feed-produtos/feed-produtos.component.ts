import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ListarProdutoService } from '../../services/listar-produtos.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-feed-produtos',
  templateUrl: './feed-produtos.component.html',
  styleUrls: ['./feed-produtos.component.scss']
})
export class FeedProdutosComponent implements OnInit, OnDestroy {
  produtos: any[] = [];
  loggedUserId: number | string | null = null;
  isLoading: boolean = false;
  isLoadingMore: boolean = false;
  
  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  temMais: boolean = true;
  totalItens: number = 0;

  constructor(
    private produtoService: ListarProdutoService,
    private router: Router,
    private authService: AuthService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.getLoggedUserId();
    this.carregarProdutos();
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
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

  carregarProdutos(): void {
    this.isLoading = true;
    this.produtos = [];
    this.paginaAtual = 1;

    this.produtoService.getFeedProdutos(this.paginaAtual, this.itensPorPagina).subscribe({
      next: (response) => {
        this.produtos = response.produtos;
        this.atualizarPaginacao(response.paginacao);
        this.isLoading = false;
        // Scroll restaurado automaticamente pelo app.component
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.isLoading = false;
      }
    });
  }

  carregarMais(): void {
    if (!this.temMais || this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;
    this.paginaAtual++;

    this.produtoService.getFeedProdutos(this.paginaAtual, this.itensPorPagina).subscribe({
      next: (response) => {
        this.produtos = [...this.produtos, ...response.produtos];
        this.atualizarPaginacao(response.paginacao);
        this.isLoadingMore = false;
      },
      error: (error) => {
        console.error('Erro ao carregar mais produtos:', error);
        this.paginaAtual--;
        this.isLoadingMore = false;
      }
    });
  }

  atualizarPaginacao(paginacao: any): void {
    this.temMais = paginacao.temMais;
    this.totalItens = paginacao.totalItens;
  }

  isProdutoDoUsuario(produto: any): boolean {
    console.log('🐛 [Feed] isProdutoDoUsuario - produto:', produto.id, 'usuarioId:', produto.usuarioId, 'loggedUserId:', this.loggedUserId);
    if (!this.loggedUserId) {
      console.log('🐛 [Feed] Não há usuário logado - retornando false');
      return false;
    }

    if (!produto.usuarioId && produto.usuarioId !== 0) {
      console.log('🐛 [Feed] Produto sem usuarioId - retornando false');
      return false;
    }

    const produtoUsuarioId = typeof produto.usuarioId === 'string' 
      ? parseInt(produto.usuarioId, 10) 
      : produto.usuarioId;
    
    const loggedId = typeof this.loggedUserId === 'string'
      ? parseInt(this.loggedUserId.toString(), 10)
      : this.loggedUserId;

    const resultado = produtoUsuarioId === loggedId;
    console.log('🐛 [Feed] Comparação:', produtoUsuarioId, '===', loggedId, '=', resultado);
    return resultado;
  }

  navigateToDetalhes(produtoId: number): void {
    // Abre modal em vez de navegar
    this.modalService.openDetalhesModal(produtoId);
  }

  navigateToTroca(produtoId: number): void {
    console.log('🔄 Tentando abrir modal de troca para produto:', produtoId);
    console.log('📱 User logado:', this.loggedUserId);
    
    // Verifica se o usuário está logado
    if (!this.authService.isAuthenticated()) {
      alert('Você precisa estar logado para oferecer uma troca.');
      this.router.navigate(['/login']);
      return;
    }
    
    // Abre modal em vez de navegar
    this.modalService.openTrocaModal(produtoId);
    console.log('✅ Modal de troca chamado');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }

  formatarData(data: string): string {
    const dataObj = new Date(data);
    const agora = new Date();
    const diffMs = agora.getTime() - dataObj.getTime();
    const diffMinutos = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMinutos < 1) {
      return 'Agora';
    } else if (diffMinutos < 60) {
      return `${diffMinutos} min atrás`;
    } else if (diffHoras < 24) {
      return `${diffHoras}h atrás`;
    } else if (diffDias < 7) {
      return `${diffDias}d atrás`;
    } else {
      return dataObj.toLocaleDateString('pt-BR');
    }
  }
}
