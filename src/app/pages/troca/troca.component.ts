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
}

@Component({
  selector: 'app-troca',
  templateUrl: './troca.component.html',
  styleUrls: ['./troca.component.scss']
})
export class TrocaComponent implements OnInit, OnDestroy {
  produtoDesejado: Produto | null = null;
  meusItens: Produto[] = [];
  meuItemSelecionado: Produto | null = null;
  loggedUserId: number | null = null;
  previousUrl: string = '/lista-produto';
  previousQueryParams: any = {};
  isModalOpen: boolean = false;
  private subscriptions: Subscription = new Subscription();

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
        this.isModalOpen = isOpen;
      })
    );
    
    // Observa mudanças no produtoTrocaId
    this.subscriptions.add(
      this.modalService.produtoTrocaId$.subscribe(produtoId => {
        if (produtoId) {
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
    this.produtoService.getProdutoById(produtoId).subscribe(
      (produto) => {
        this.produtoDesejado = produto;
      },
      (error) => {
        console.error('Erro ao carregar o produto desejado:', error);
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
    this.meuItemSelecionado = item;
  }

  submeterProposta() {
    if (!this.meuItemSelecionado || !this.produtoDesejado || !this.loggedUserId) {
      alert('Por favor, selecione um item para oferecer na troca.');
      return;
    }

    // Verifica se o produto desejado tem usuarioId
    if (!this.produtoDesejado.usuarioId) {
      alert('Erro: Produto sem informação do dono.');
      return;
    }

    const transacao = {
      idUsuario1: this.loggedUserId,
      idUsuario2: this.produtoDesejado.usuarioId,
      produtoUsuario1Id: this.meuItemSelecionado.id,
      produtoUsuario2Id: this.produtoDesejado.id,
      dataTransacao: new Date().toISOString(),
      status: 2, // Status da transação (2 para proposta pendente)
      produtosUsuario1: [this.meuItemSelecionado],
      produtosUsuario2: [this.produtoDesejado]
    };

    this.transacaoService.registrarTransacao(transacao).subscribe(
      (response) => {
        alert('Proposta enviada com sucesso!');
        if (this.isModalOpen) {
          this.closeModal();
        } else {
          this.goBack();
        }
      },
      (error) => {
        console.error('Erro ao registrar transação:', error);
        alert('Houve um erro ao enviar a proposta.');
      }
    );
  }
  
  closeModal(): void {
    this.modalService.closeTrocaModal();
    // Limpa seleção
    this.meuItemSelecionado = null;
    this.produtoDesejado = null;
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
}
