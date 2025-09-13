import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadastroProdutoComponent } from './pages/cadastro-produto/cadastro-produto.component';
import { DetalhesProdutoComponent } from './pages/detalhes-produto/detalhes-produto.component';
import { ListarProdutosUsuarioComponent } from './pages/listar-produtos-usuario/listar-produtos-usuario.component';
import { LoginComponent } from './pages/login/login.component';
import { PaginaCadastroComponent } from './pages/pagina-cadastro/pagina-cadastro.component';
import { ProdutoListaComponent } from './pages/produto-lista/produto-lista.component';


const routes: Routes = [
  { path: 'cadastro', component: PaginaCadastroComponent},
  { path: 'login', component: LoginComponent },
  { path: 'criar-produto', component: CadastroProdutoComponent },
  { path: 'lista-produto', component: ProdutoListaComponent },
  { path: 'detalhes-produto/:id', component: DetalhesProdutoComponent },
  { path: 'produtos/usuario/:usuarioId', component: ListarProdutosUsuarioComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
