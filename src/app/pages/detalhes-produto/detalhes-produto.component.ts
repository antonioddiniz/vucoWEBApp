import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';

@Component({
  selector: 'app-detalhes-produto',
  templateUrl: './detalhes-produto.component.html',
  styleUrls: ['./detalhes-produto.component.scss']
})
export class DetalhesProdutoComponent implements OnInit {
  produto: any;

  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.produtoService.getProdutoById(Number(id)).subscribe(
        (produto) => {
          this.produto = produto;
        },
        (error) => {
          console.error('Erro ao buscar detalhes do produto', error);
        }
      );
    }
  }
}
