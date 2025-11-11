import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ListarProdutosUsuarioService } from '../../services/listar-produtos-usuario.service';
import { ProdutoService } from '../../services/produto.service';

@Component({
  selector: 'app-listar-produtos-usuario',
  templateUrl: './listar-produtos-usuario.component.html',
  styleUrls: ['./listar-produtos-usuario.component.scss']
})
export class ListarProdutosUsuarioComponent implements OnInit {
  produtos: any[] = [];
  mostrarConfirmacaoDelete = false;
  produtoParaDeletar: any = null;

  constructor(
    private produtoService: ListarProdutosUsuarioService,
    private produtoServiceGeral: ProdutoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.getProdutosByUsuario().subscribe(
      produtos => {
        this.produtos = produtos;
      },
      error => {
        console.error('Erro ao carregar produtos', error);
      }
    );
  }

  navigateToDetalhes(produtoId: number): void {
    this.router.navigate(['/detalhes-produto', produtoId], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  navigateToCreateProduct(): void {
    this.router.navigate(['/criar-produto']);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }

  abrirConfirmacaoDelete(produto: any, event: Event): void {
    event.stopPropagation();
    this.produtoParaDeletar = produto;
    this.mostrarConfirmacaoDelete = true;
  }

  cancelarDelete(): void {
    this.mostrarConfirmacaoDelete = false;
    this.produtoParaDeletar = null;
  }

  confirmarDelete(): void {
    if (this.produtoParaDeletar) {
      this.produtoServiceGeral.deleteProduto(this.produtoParaDeletar.id).subscribe({
        next: () => {
          console.log('Produto deletado com sucesso!');
          this.mostrarConfirmacaoDelete = false;
          this.carregarProdutos(); // Recarrega a lista de produtos
        },
        error: (error) => {
          console.error('Erro ao deletar produto:', error);
          this.mostrarConfirmacaoDelete = false;
        }
      });
    }
  }
}
