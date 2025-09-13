import { Component, OnInit } from '@angular/core';
import "swiper/css";
import 'swiper/swiper-bundle.css';
import { ListarProdutoService } from '../../services/listar-produtos.service';



@Component({
  selector: 'app-produto-lista',
  templateUrl: './produto-lista.component.html',
  styleUrls: ['./produto-lista.component.scss']
})
export class ProdutoListaComponent implements OnInit {
  produtos: any[] = [];

  constructor(private produtoService: ListarProdutoService) { }

  ngOnInit(): void {
    this.produtoService.getProdutos().subscribe(data => {
      this.produtos = data;
    });
  }
}
