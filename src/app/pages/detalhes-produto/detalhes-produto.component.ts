import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { jwtDecode } from 'jwt-decode';


@Component({
  selector: 'app-detalhes-produto',
  templateUrl: './detalhes-produto.component.html',
  styleUrls: ['./detalhes-produto.component.scss']
})
export class DetalhesProdutoComponent implements OnInit, OnDestroy {
  produto: any;
  loggedUserId: number | null = null;
  nomeUsuario: string = 'Carregando...';
  previousUrl: string = '/lista-produto';
  previousQueryParams: any = {};
  isModalOpen: boolean = false;
  private subscriptions: Subscription = new Subscription();
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;
  private touchCurrentX: number = 0;
  modalTransform = 'translateX(0)';
  modalOpacity = 1;
  isSwipingModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private produtoService: ProdutoService,
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.getLoggedUserId();
    
    // Obtém a URL anterior dos query params ou do histórico de navegação
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.previousUrl = returnUrl;
    }
    
    // Preserva query params (como termo de busca)
    const queryParams = this.route.snapshot.queryParams;
    Object.keys(queryParams).forEach(key => {
      if (key !== 'returnUrl') {
        this.previousQueryParams[key] = queryParams[key];
      }
    });
    
    // Obtém os detalhes do produto
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarProduto(Number(id));
    }
    
    // Observa abertura do modal via serviço
    this.subscriptions.add(
      this.modalService.detalhesModalOpen$.subscribe(isOpen => {
        this.isModalOpen = isOpen;
      })
    );
    
    // Observa mudanças no produtoId
    this.subscriptions.add(
      this.modalService.produtoId$.subscribe(produtoId => {
        if (produtoId) {
          this.carregarProduto(produtoId);
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  carregarProduto(id: number): void {
    this.produtoService.getProdutoById(id).subscribe(
      (produto) => {
        this.produto = produto;
        console.log('Produto carregado:', this.produto);
        
        // Buscar nome do usuário pelo ID
        if (this.produto.usuarioId) {
          this.produtoService.getUsuarioById(this.produto.usuarioId).subscribe(
            (usuario) => {
              this.nomeUsuario = usuario?.nome || `Usuário ${this.produto.usuarioId}`;
            },
            (error) => {
              console.error('Erro ao buscar usuário:', error);
              this.nomeUsuario = `Usuário ${this.produto.usuarioId}`;
            }
          );
        }
      },
      (error) => {
        console.error('Erro ao buscar detalhes do produto', error);
      }
    );
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
    } else {
      this.loggedUserId = null;
    }
  }

  isProdutoDoUsuario(produto: any): boolean {
    if (!this.loggedUserId || !produto) {
      return false;
    }

    if (!produto.usuarioId && produto.usuarioId !== 0) {
      return false;
    }

    const produtoUsuarioId = typeof produto.usuarioId === 'string' 
      ? parseInt(produto.usuarioId, 10) 
      : produto.usuarioId;
    
    const loggedId = typeof this.loggedUserId === 'string'
      ? parseInt((this.loggedUserId as string), 10)
      : this.loggedUserId;

    return produtoUsuarioId === loggedId;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }

  oferecerTroca() {
    if (!this.produto) {
      console.error('Produto não definido.');
      return;
    }

    // Verifica se o usuário está logado
    if (!this.authService.isAuthenticated()) {
      alert('Você precisa estar logado para oferecer uma troca.');
      this.router.navigate(['/login']);
      return;
    }

    // Abre modal de troca em vez de navegar
    if (this.isModalOpen) {
      this.modalService.openTrocaModal(this.produto.id);
    } else {
      this.router.navigate(['/troca'], {
        queryParams: {
          produtoId: this.produto.id,
          nomeProduto: this.produto.nome,
          returnUrl: this.previousUrl,
          ...this.previousQueryParams
        }
      });
    }
  }

  closeModal(): void {
    this.modalService.closeDetalhesModal();
    this.resetModalTransform();
  }
  
  private resetModalTransform(): void {
    this.modalTransform = 'translateX(0)';
    this.modalOpacity = 1;
    this.isSwipingModal = false;
  }
  
  goBack(): void {
    // Se está em modo modal, apenas fecha
    if (this.isModalOpen) {
      this.closeModal();
      return;
    }
    
    // Caso contrário, navegação tradicional
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate([this.previousUrl], {
        queryParams: this.previousQueryParams
      });
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
    this.touchCurrentX = this.touchStartX;
    this.isSwipingModal = true;
  }
  
  onTouchMove(event: TouchEvent): void {
    if (!this.isSwipingModal) return;
    
    this.touchCurrentX = event.changedTouches[0].screenX;
    const diffX = this.touchCurrentX - this.touchStartX;
    const diffY = Math.abs(event.changedTouches[0].screenY - this.touchStartY);
    
    // Apenas permite swipe para direita e se movimento horizontal > vertical
    if (diffX > 0 && diffX > diffY) {
      const translateX = diffX;
      const opacity = Math.max(0, 1 - (diffX / 300));
      
      this.modalTransform = `translateX(${translateX}px)`;
      this.modalOpacity = opacity;
    }
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndY = event.changedTouches[0].screenY;
    this.isSwipingModal = false;
    this.handleSwipe();
  }

  handleSwipe(): void {
    const diffX = this.touchStartX - this.touchEndX;
    const absDiffY = Math.abs(this.touchStartY - this.touchEndY);
    
    // Swipe para a direita (fechar modal) - movimento horizontal > 100px e vertical < 50px
    if (diffX < -100 && absDiffY < 50) {
      // Anima para fora antes de fechar
      this.modalTransform = 'translateX(100vw)';
      this.modalOpacity = 0;
      
      setTimeout(() => {
        this.closeModal();
      }, 300);
    } else {
      // Volta para posição original com animação
      this.modalTransform = 'translateX(0)';
      this.modalOpacity = 1;
    }
  }
}
