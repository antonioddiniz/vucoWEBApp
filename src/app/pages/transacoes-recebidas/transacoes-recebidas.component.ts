import { Component, OnInit } from '@angular/core';
import { TransacaoService } from '../../services/transacao.service';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
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
  transacaoSelecionada: any = null;
  produto: any; // Produto selecionado para troca

  constructor(
    private transacaoService: TransacaoService,
    private produtoService: ProdutoService,
    private authService: AuthService, // Serviço de autenticação
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
        const transacoesComProdutos = transacoes.map(async (transacao: any) => {
          const [produto1, produto2] = await Promise.all([
            this.produtoService.getProdutoById(transacao.produtoUsuario1Id).toPromise(),
            this.produtoService.getProdutoById(transacao.produtoUsuario2Id).toPromise()
          ]);

          return {
            ...transacao,
            produtoUsuario1: produto1,
            produtoUsuario2: produto2
          };
        });

        Promise.all(transacoesComProdutos).then((completas) => {
          this.transacoes = completas;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar transações:', error);
      }
    });
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
        status: 3 // status 1 = Concluída
      };

      this.transacaoService.atualizarTransacao(transacaoAtualizada).subscribe({
        next: () => {
          console.log('Transação aceita com sucesso!');
          this.mostrarDeletar = false;
          this.carregarTransacoes(this.statusSelecionado); // Atualiza a lista de transações
        },
        error: (error) => {
          console.error('Erro ao aceitar transação:', error);
          this.mostrarConfirmacao = false;
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }
}