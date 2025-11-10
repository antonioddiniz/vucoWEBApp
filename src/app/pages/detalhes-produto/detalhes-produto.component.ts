import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';


@Component({
  selector: 'app-detalhes-produto',
  templateUrl: './detalhes-produto.component.html',
  styleUrls: ['./detalhes-produto.component.scss']
})
export class DetalhesProdutoComponent implements OnInit {
  produto: any;
  loggedUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtoService: ProdutoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getLoggedUserId();
    
    // Obtém os detalhes do produto
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.produtoService.getProdutoById(Number(id)).subscribe(
        (produto) => {
          this.produto = produto;
          console.log('Produto carregado:', this.produto);
        },
        (error) => {
          console.error('Erro ao buscar detalhes do produto', error);
        }
      );
    }
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

    this.router.navigate(['/troca'], {
      queryParams: {
        produtoId: this.produto.id,
        nomeProduto: this.produto.nome
      }
    });
  }
}