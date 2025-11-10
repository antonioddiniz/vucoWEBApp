import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import "swiper/css";
import 'swiper/swiper-bundle.css';
import { ListarProdutoService } from '../../services/listar-produtos.service';
import { AuthService } from '../../services/auth.service';
import { CarouselItem } from '../../pages/banner-carousel/banner-carousel.component';

interface ProdutoPorCategoria {
  categoria: string;
  produtos: any[];
}

@Component({
  selector: 'app-produto-lista',
  templateUrl: './produto-lista.component.html',
  styleUrls: ['./produto-lista.component.scss']
})
export class ProdutoListaComponent implements OnInit {
  produtos: any[] = [];
  produtosPorCategoria: ProdutoPorCategoria[] = [];
  loggedUserId: number | string | null = null;
  isLoading: boolean = true;

  // Array de itens do carrossel
  carouselItems: CarouselItem[] = [
    { id: 0, imageSrc: 'assets/3.png', contentDescription: 'Banner 1' },
    { id: 1, imageSrc: 'assets/2.png', contentDescription: 'Banner 2' },
    { id: 2, imageSrc: 'assets/1.png', contentDescription: 'Banner 3' },
  ];

  constructor(
    private produtoService: ListarProdutoService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getLoggedUserId();
    this.isLoading = true;
    this.produtosPorCategoria = []; // Garante que começa vazio
    
    this.produtoService.getProdutos().subscribe({
      next: (data) => {
        this.produtos = data;
        this.agruparProdutosPorCategoria();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.isLoading = false;
      }
    });
  }

  getLoggedUserId(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        // Tenta diferentes campos possíveis no token
        this.loggedUserId = decodedToken.userId || decodedToken.id || decodedToken.user_id || decodedToken.sub;
        
        // Converte para number se for string
        if (typeof this.loggedUserId === 'string') {
          this.loggedUserId = parseInt(this.loggedUserId, 10);
        }
        
        console.log('Logged User ID:', this.loggedUserId);
        console.log('Decoded Token:', decodedToken);
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        this.loggedUserId = null;
      }
    } else {
      console.log('Nenhum token encontrado');
    }
  }

  isProdutoDoUsuario(produto: any): boolean {
    // Se não há usuário logado, mostrar o botão
    if (!this.loggedUserId) {
      return false;
    }

    // Se o produto não tem usuarioId, mostrar o botão
    if (!produto.usuarioId && produto.usuarioId !== 0) {
      return false;
    }

    // Converte ambos para number para comparação
    const produtoUsuarioId = typeof produto.usuarioId === 'string' 
      ? parseInt(produto.usuarioId, 10) 
      : produto.usuarioId;
    
    const loggedId = typeof this.loggedUserId === 'string'
      ? parseInt(this.loggedUserId.toString(), 10)
      : this.loggedUserId;

    const isOwner = produtoUsuarioId === loggedId;
    
    // Debug log
    console.log('Produto:', produto.nome, '| Produto UsuarioId:', produtoUsuarioId, '| Logged UserId:', loggedId, '| É do usuário?', isOwner);
    
    return isOwner;
  }

  agruparProdutosPorCategoria(): void {
    // Agrupa os produtos por categoria
    const produtosAgrupados = new Map<string, any[]>();
    
    this.produtos.forEach(produto => {
      const categoria = produto.categoria || 'Sem categoria';
      if (!produtosAgrupados.has(categoria)) {
        produtosAgrupados.set(categoria, []);
      }
      produtosAgrupados.get(categoria)!.push(produto);
    });

    // Converte o Map para array de objetos e ordena por quantidade de produtos (decrescente)
    this.produtosPorCategoria = Array.from(produtosAgrupados.entries())
      .map(([categoria, produtos]) => ({
        categoria,
        produtos
      }))
      .sort((a, b) => b.produtos.length - a.produtos.length); // Ordena do maior para o menor
  }

  navigateToDetalhes(produtoId: number): void {
    this.router.navigate(['/detalhes-produto', produtoId]);
  }

  navigateToTroca(produtoId: number): void {
    this.router.navigate(['/troca'], { queryParams: { produtoId } });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }
}
