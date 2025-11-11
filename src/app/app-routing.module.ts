import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadastroProdutoComponent } from './pages/cadastro-produto/cadastro-produto.component';
import { DetalhesProdutoComponent } from './pages/detalhes-produto/detalhes-produto.component';
import { ListarProdutosUsuarioComponent } from './pages/listar-produtos-usuario/listar-produtos-usuario.component';
import { LoginComponent } from './pages/login/login.component';
import { PaginaCadastroComponent } from './pages/pagina-cadastro/pagina-cadastro.component';
import { ProdutoListaComponent } from './pages/produto-lista/produto-lista.component';
import { TrocaComponent } from './pages/troca/troca.component';
import { TransacoesRecebidasComponent } from './pages/transacoes-recebidas/transacoes-recebidas.component';
import { BuscaProdutosComponent } from './pages/busca-produtos/busca-produtos.component';
import { FeedProdutosComponent } from './pages/feed-produtos/feed-produtos.component';
// import { ContraPropostaComponent } from './pages/contra-proposta/contra-proposta.component';


const routes: Routes = [
  { path: '', redirectTo: '/lista-produto', pathMatch: 'full' },
  { path: 'cadastro', component: PaginaCadastroComponent},
  { path: 'login', component: LoginComponent },
  { path: 'criar-produto', component: CadastroProdutoComponent },
  { path: 'lista-produto', component: ProdutoListaComponent },
  { path: 'feed', component: FeedProdutosComponent },
  { path: 'detalhes-produto/:id', component: DetalhesProdutoComponent },
  { path: 'produtos/usuario/:usuarioId', component: ListarProdutosUsuarioComponent },
  { path: 'troca', component: TrocaComponent},
  { path: 'transacoes-recebidas', component: TransacoesRecebidasComponent},
  { path: 'busca', component: BuscaProdutosComponent},
  // { path: 'contra-proposta', component: ContraPropostaComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'disabled', // Desabilita scroll automático do Angular
    anchorScrolling: 'disabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
