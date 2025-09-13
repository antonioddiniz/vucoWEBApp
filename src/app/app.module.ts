import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { register } from 'swiper/element/bundle';
register();


import { AuthInterceptor } from './Interceptors/auth';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TokenDisplayComponent } from './components/token-display/token-display.component';
import { CadastroProdutoComponent } from './pages/cadastro-produto/cadastro-produto.component';
import { DetalhesProdutoComponent } from './pages/detalhes-produto/detalhes-produto.component';
import { ListarProdutosUsuarioComponent } from './pages/listar-produtos-usuario/listar-produtos-usuario.component';
import { ListarUsuariosComponent } from './pages/listar-usuarios/listar-usuarios.component';
import { LoginComponent } from './pages/login/login.component';
import { PaginaCadastroComponent } from './pages/pagina-cadastro/pagina-cadastro.component';
import { ProdutoListaComponent } from './pages/produto-lista/produto-lista.component';
import { AuthService } from './services/auth.service';




@NgModule({
  declarations: [
    AppComponent,
    PaginaCadastroComponent,
    LoginComponent,
    ListarUsuariosComponent,
    TokenDisplayComponent,
    CadastroProdutoComponent,
    ProdutoListaComponent,
    DetalhesProdutoComponent,
    ListarProdutosUsuarioComponent, 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatGridListModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule
    
    
  ],
  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule { }
