import { Component, OnInit } from '@angular/core';
import { TransacaoService } from '../../services/transacao.service';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-transacoes-recebidas',
  templateUrl: './transacoes-recebidas.component.html',
  styleUrls: ['./transacoes-recebidas.component.scss']
})
export class TransacoesRecebidasComponent implements OnInit {
  transacoes: any[] = [];
  statusSelecionado = 2; // Status inicial (aguardando confirmação ou outro)
  usuarioLogadoId: number | null = null; // ID do usuário logado
  // Variáveis para controle de exibição do modal de confirmação
  mostrarConfirmacao = false;
  mostrarDeletar = false;
  mostrarDetalhes = false;
  transacaoSelecionada: any = null;
  produto: any; // Produto selecionado para troca
  
  // Variáveis para swipe gesture
  private touchStartX = 0;
  private touchEndX = 0;
  private touchCurrentX = 0;
  private minSwipeDistance = 100; // Distância mínima em pixels para considerar um swipe
  modalTransform = 'translateX(0)';
  modalOpacity = 1;
  isSwipingModal = false;

  constructor(
    private transacaoService: TransacaoService,
    private produtoService: ProdutoService,
    private authService: AuthService, // Serviço de autenticação
    private modalService: ModalService, // Serviço de modal
    private chatService: ChatService, // Serviço de chat
    private router: Router // Serviço de navegação
  ) {}

  ngOnInit(): void {
    this.carregarTransacoes(this.statusSelecionado);
    this.authService.getUserInfo().subscribe({
      next: (userInfo) => {
        this.usuarioLogadoId = userInfo.id; // Supondo que o ID do usuário esteja na propriedade `id`
        this.carregarTransacoes(this.statusSelecionado); // Carrega as transações após obter o ID
      },
      error: (error) => {
        console.error('Erro ao obter informações do usuário:', error);
      }
    });
  }

  carregarTransacoes(status: number): void {
    console.log('Carregando transações com status:', status);
    console.log('ID do usuário logado:', this.usuarioLogadoId);
    
    this.transacaoService.getTransacoesByUsuarioByStatus(status).subscribe({
      next: (transacoes) => {
        // Se não houver transações, limpa o array
        if (!transacoes || transacoes.length === 0) {
          this.transacoes = [];
          return;
        }

        // As transações já vêm com transacaoProdutos do backend
        // Ordena por data mais recente primeiro
        this.transacoes = transacoes.sort((a: any, b: any) => {
          const dataA = new Date(a.dataTransacao).getTime();
          const dataB = new Date(b.dataTransacao).getTime();
          return dataB - dataA;
        });

        console.log('Transações carregadas:', this.transacoes);
      },
      error: (error) => {
        if (error.status === 404) {
          console.log('Nenhuma transação encontrada com status:', status);
          this.transacoes = [];
        } else {
          console.error('Erro ao carregar transações:', error);
          this.transacoes = [];
        }
      }
    });
  }

  // Retorna produtos do outro usuário (para exibir o que você vai receber)
  getProdutosOutroUsuario(transacao: any): any[] {
    if (!transacao.transacaoProdutos) return [];
    
    // Se eu sou Usuario1, quero ver os produtos do Usuario2 (UsuarioTipo = false)
    // Se eu sou Usuario2, quero ver os produtos do Usuario1 (UsuarioTipo = true)
    const souUsuario1 = this.usuarioLogadoId === transacao.idUsuario1;
    
    return transacao.transacaoProdutos
      .filter((tp: any) => tp.usuarioTipo === souUsuario1 ? false : true)
      .map((tp: any) => tp.produto);
  }

  // Retorna meus produtos (que estou oferecendo)
  getMeusProdutos(transacao: any): any[] {
    if (!transacao.transacaoProdutos) return [];
    
    const souUsuario1 = this.usuarioLogadoId === transacao.idUsuario1;
    
    return transacao.transacaoProdutos
      .filter((tp: any) => tp.usuarioTipo === souUsuario1 ? true : false)
      .map((tp: any) => tp.produto);
  }

  aceitarTransacao(transacao: any): void {
    const transacaoAtualizada = { ...transacao, status: 1 }; // Atualiza o status para Concluído
  
    this.transacaoService.atualizarTransacao(transacaoAtualizada).subscribe({
      next: () => {
        // Atualiza a lista após aceitar
        this.carregarTransacoes(this.statusSelecionado);
      },
      error: (error) => {
        console.error('Erro ao aceitar transação:', error);
      }
    });
  }

  selecionarStatus(status: number): void {
    this.statusSelecionado = status;
    this.carregarTransacoes(status); // Recarrega as transações ao mudar o status
  }

  oferecerTroca(transacao: any) {
    if (!this.usuarioLogadoId || !transacao) {
      console.error('Usuário ou transação não definidos.');
      return;
    }
  
    console.log('Redirecionando para troca com:', {
      idUsuario1: this.usuarioLogadoId,
      idUsuario2: transacao.idUsuario1,
      produtoId: transacao.produtoUsuario1?.id
    });
  
    this.router.navigate(['/troca'], {
      queryParams: {
        idUsuario1: this.usuarioLogadoId,
        idUsuario2: transacao.idUsuario1,
        produtoId: transacao.produtoUsuario2?.id,
        nomeProduto: transacao.produtoUsuario2?.nome
      }
    });
  }

  // Métodos para controlar o modal de confirmação de aceite
  abrirConfirmacao(transacao: any): void {
    this.transacaoSelecionada = transacao;
    this.mostrarConfirmacao = true;
  }

  abrirDeletar(transacao: any): void {
    this.transacaoSelecionada = transacao;
    this.mostrarDeletar = true;
  }

  confirmarAceite(): void {
    if (this.transacaoSelecionada) {
      const transacaoAtualizada = {
        ...this.transacaoSelecionada,
        status: 1 // status 1 = Concluída
      };

      this.transacaoService.atualizarTransacao(transacaoAtualizada).subscribe({
        next: () => {
          console.log('Transação aceita com sucesso!');
          this.mostrarConfirmacao = false;
          this.carregarTransacoes(this.statusSelecionado); // Atualiza a lista de transações
        },
        error: (error) => {
          console.error('Erro ao aceitar transação:', error);
          this.mostrarConfirmacao = false;
        }
      });
    }
  }

  confirmarDelete(): void {
    if (this.transacaoSelecionada) {
      const transacaoAtualizada = {
        ...this.transacaoSelecionada,
        status: 3 // status 3 = Cancelada
      };

      this.transacaoService.atualizarTransacao(transacaoAtualizada).subscribe({
        next: () => {
          console.log('Transação cancelada com sucesso!');
          this.mostrarDeletar = false;
          this.carregarTransacoes(this.statusSelecionado); // Atualiza a lista de transações
        },
        error: (error) => {
          console.error('Erro ao cancelar transação:', error);
          this.mostrarDeletar = false;
        }
      });
    }
  }





  cancelarConfirmacao(): void {
    this.mostrarConfirmacao = false;
    this.transacaoSelecionada = null;
  }

  cancelarDeletar(): void {
    this.mostrarDeletar = false;
    this.transacaoSelecionada = null;
  }

  abrirDetalhes(transacao: any): void {
    this.transacaoSelecionada = transacao;
    this.mostrarDetalhes = true;
    this.resetModalTransform();
  }

  fecharDetalhes(): void {
    this.mostrarDetalhes = false;
    this.transacaoSelecionada = null;
    this.resetModalTransform();
  }
  
  private resetModalTransform(): void {
    this.modalTransform = 'translateX(0)';
    this.modalOpacity = 1;
    this.isSwipingModal = false;
  }
  
  // Métodos para swipe gesture
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchCurrentX = this.touchStartX;
    this.isSwipingModal = true;
  }
  
  onTouchMove(event: TouchEvent): void {
    if (!this.isSwipingModal) return;
    
    this.touchCurrentX = event.changedTouches[0].screenX;
    const diff = this.touchCurrentX - this.touchStartX;
    
    // Apenas permite swipe para direita
    if (diff > 0) {
      // Usa toda a distância sem resistência para tornar mais perceptível
      const translateX = diff;
      
      // Calcula opacidade baseada na distância (fade out mais agressivo)
      const opacity = Math.max(0, 1 - (diff / 300));
      
      this.modalTransform = `translateX(${translateX}px)`;
      this.modalOpacity = opacity;
    }
  }
  
  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.isSwipingModal = false;
    this.handleSwipe();
  }
  
  private handleSwipe(): void {
    const swipeDistance = this.touchEndX - this.touchStartX;
    
    // Swipe da esquerda para direita (fechar modal)
    if (swipeDistance > this.minSwipeDistance) {
      // Anima para fora antes de fechar
      this.modalTransform = 'translateX(100vw)';
      this.modalOpacity = 0;
      
      setTimeout(() => {
        this.fecharDetalhes();
      }, 300);
    } else {
      // Volta para posição original com animação
      this.modalTransform = 'translateX(0)';
      this.modalOpacity = 1;
    }
  }
  
  // Abre modal de detalhes do produto
  abrirDetalhesProduto(produtoId: number, event: Event): void {
    event.stopPropagation();
    this.modalService.openDetalhesModal(produtoId);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }

  // Verifica se o usuário logado foi quem enviou a transação
  isUsuarioEnviou(transacao: any): boolean {
    return this.usuarioLogadoId === transacao.idUsuario1;
  }

  // Abre o chat de uma transação concluída
  abrirChat(transacao: any): void {
    this.chatService.obterChatPorTransacao(transacao.id).subscribe({
      next: (chat) => {
        this.fecharDetalhes();
        this.router.navigate(['/conversa', chat.id]);
      },
      error: (err) => {
        console.error('Erro ao buscar chat:', err);
        // Se o chat não existir, tentar criar
        if (err.status === 404) {
          this.chatService.criarChat(transacao.id).subscribe({
            next: (novoChat) => {
              this.fecharDetalhes();
              this.router.navigate(['/conversa', novoChat.id]);
            },
            error: (createErr) => {
              console.error('Erro ao criar chat:', createErr);
            }
          });
        }
      }
    });
  }
}
