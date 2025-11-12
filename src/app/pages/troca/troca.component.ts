import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { TransacaoService } from '../../services/transacao.service';
import { ListarProdutosUsuarioService } from '../../services/listar-produtos-usuario.service';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

interface Produto {
  id: number;
  nome: string;
  imagem: string;
  usuarioId?: number;
  descricao?: string;
}

@Component({
  selector: 'app-troca',
  templateUrl: './troca.component.html',
  styleUrls: ['./troca.component.scss']
})
export class TrocaComponent implements OnInit, OnDestroy {
  produtoDesejado: Produto | null = null;
  produtosOutroUsuario: Produto[] = [];  // NOVO: todos os produtos do outro usuário
  meusItens: Produto[] = [];
  meuItemSelecionado: Produto | null = null;  // Mantido para compatibilidade
  meusItensSelecionados: number[] = [];  // NOVO: IDs dos meus produtos selecionados
  produtosOutroUsuarioSelecionados: number[] = [];  // NOVO: IDs dos produtos do outro usuário selecionados
  loggedUserId: number | null = null;
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
    private transacaoService: TransacaoService,
    private listarProdutosUsuarioService: ListarProdutosUsuarioService,
    private produtoService: ProdutoService,
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.getLoggedUserId();
    this.carregarMeusProdutos();
    
    // Observa abertura do modal via serviço
    this.subscriptions.add(
      this.modalService.trocaModalOpen$.subscribe(isOpen => {
        console.log('🐛 [TrocaComponent] trocaModalOpen$ recebeu:', isOpen);
        this.isModalOpen = isOpen;
        console.log('🐛 [TrocaComponent] isModalOpen agora é:', this.isModalOpen);
      })
    );
    
    // Observa mudanças no produtoTrocaId
    this.subscriptions.add(
      this.modalService.produtoTrocaId$.subscribe(produtoId => {
        console.log('🐛 [TrocaComponent] produtoTrocaId$ recebeu:', produtoId);
        if (produtoId) {
          console.log('🐛 [TrocaComponent] carregando produto desejado:', produtoId);
          this.carregarProdutoDesejado(produtoId);
        }
      })
    );
    
    // Também suporta navegação via rota (modo tradicional)
    this.route.queryParams.subscribe(params => {
      const produtoId = Number(params['produtoId']);

      if (produtoId && !this.isModalOpen) {
        this.carregarProdutoDesejado(produtoId);
      }
      
      const returnUrl = params['returnUrl'];
      if (returnUrl) {
        this.previousUrl = returnUrl;
      }
      
      Object.keys(params).forEach(key => {
        if (key !== 'produtoId' && key !== 'nomeProduto' && key !== 'returnUrl') {
          this.previousQueryParams[key] = params[key];
        }
      });
    });
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  carregarProdutoDesejado(produtoId: number) {
    console.log('🐛 [TrocaComponent] carregarProdutoDesejado iniciado para ID:', produtoId);
    this.produtoService.getProdutoById(produtoId).subscribe(
      (produto) => {
        console.log('🐛 [TrocaComponent] Produto carregado:', produto);
        this.produtoDesejado = produto;
        // Pré-seleciona o produto desejado
        this.produtosOutroUsuarioSelecionados = [produto.id];
        
        // Carrega todos os produtos do outro usuário
        if (produto.usuarioId) {
          this.carregarProdutosOutroUsuario(produto.usuarioId);
        }
      },
      (error) => {
        console.error('❌ [TrocaComponent] Erro ao carregar o produto desejado:', error);
      }
    );
  }

  carregarProdutosOutroUsuario(usuarioId: number) {
    this.produtoService.getProdutosByUsuarioId(usuarioId).subscribe(
      (produtos) => {
        this.produtosOutroUsuario = produtos.map(p => ({
          id: p.id,
          nome: p.nome,
          imagem: p.imagem,
          usuarioId: p.usuarioId,
          descricao: p.descricao
        }));
      },
      (error) => {
        console.error('Erro ao carregar produtos do outro usuário:', error);
      }
    );
  }

  carregarMeusProdutos() {
    this.listarProdutosUsuarioService.getProdutosByUsuario().subscribe(
      (produtos) => {
        this.meusItens = produtos.map(p => ({
          id: p.id,
          nome: p.nome,
          imagem: p.imagem,
          usuarioId: p.usuarioId
        }));
      },
      (error) => {
        console.error('Erro ao carregar produtos do usuário:', error);
      }
    );
  }

  selecionarMeuItem(item: Produto) {
    this.meuItemSelecionado = item;  // Mantido para compatibilidade
  }

  toggleMeuItem(produtoId: number) {
    const index = this.meusItensSelecionados.indexOf(produtoId);
    if (index > -1) {
      this.meusItensSelecionados.splice(index, 1);
    } else {
      this.meusItensSelecionados.push(produtoId);
    }
  }

  toggleProdutoOutroUsuario(produtoId: number) {
    const index = this.produtosOutroUsuarioSelecionados.indexOf(produtoId);
    if (index > -1) {
      this.produtosOutroUsuarioSelecionados.splice(index, 1);
    } else {
      this.produtosOutroUsuarioSelecionados.push(produtoId);
    }
  }

  isProdutoSelecionado(produtoId: number, lista: number[]): boolean {
    return lista.includes(produtoId);
  }

  submeterProposta() {
    // Validações
    if (!this.loggedUserId) {
      alert('Erro: Usuário não identificado.');
      return;
    }

    if (this.meusItensSelecionados.length === 0) {
      alert('Por favor, selecione pelo menos um dos seus produtos para oferecer.');
      return;
    }

    if (this.produtosOutroUsuarioSelecionados.length === 0) {
      alert('Por favor, selecione pelo menos um produto do outro usuário.');
      return;
    }

    if (!this.produtoDesejado || !this.produtoDesejado.usuarioId) {
      alert('Erro: Produto sem informação do dono.');
      return;
    }

    const transacao = {
      idUsuario1: this.loggedUserId,
      idUsuario2: this.produtoDesejado.usuarioId,
      produtosUsuario1: this.meusItensSelecionados,  // Array de IDs
      produtosUsuario2: this.produtosOutroUsuarioSelecionados,  // Array de IDs
      transacaoOriginalId: null
    };

    console.log('📤 Enviando transação:', transacao);

    this.transacaoService.registrarTransacao(transacao).subscribe(
      (response) => {
        console.log('✅ Transação registrada:', response);
        alert(`Proposta enviada com sucesso!\n${this.meusItensSelecionados.length} produto(s) seus por ${this.produtosOutroUsuarioSelecionados.length} produto(s) do outro usuário.`);
        if (this.isModalOpen) {
          this.closeModal();
        } else {
          this.goBack();
        }
      },
      (error) => {
        console.error('❌ Erro ao registrar transação:', error);
        alert('Houve um erro ao enviar a proposta. Tente novamente.');
      }
    );
  }
  
  closeModal(): void {
    this.modalService.closeTrocaModal();
    // Limpa seleções
    this.meuItemSelecionado = null;
    this.produtoDesejado = null;
    this.meusItensSelecionados = [];
    this.produtosOutroUsuarioSelecionados = [];
    this.produtosOutroUsuario = [];
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
    
    // Navegação tradicional
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
