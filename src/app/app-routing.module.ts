import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { PaginaCadastroComponent } from './pages/pagina-cadastro/pagina-cadastro.component';

const routes: Routes = [
  { path: 'cadastro', component: PaginaCadastroComponent},
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
