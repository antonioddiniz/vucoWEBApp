import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ListarProdutosUsuarioService } from '../../services/listar-produtos-usuario.service';

@Component({
  selector: 'app-listar-produtos-usuario',
  templateUrl: './listar-produtos-usuario.component.html',
  styleUrls: ['./listar-produtos-usuario.component.scss']
})
export class ListarProdutosUsuarioComponent implements OnInit {
  produtos: any[] = [];

  constructor(
    private produtoService: ListarProdutosUsuarioService,
    private authService: AuthService
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
}
