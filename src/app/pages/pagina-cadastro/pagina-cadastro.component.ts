import { Component } from '@angular/core';
import { CadastroUsuarioService } from '../../services/cadastro-usuario.service';

@Component({
  selector: 'app-pagina-cadastro',
  templateUrl: './pagina-cadastro.component.html',
  styleUrls: ['./pagina-cadastro.component.scss']
})
export class PaginaCadastroComponent {
  nome: string = '';
  senha: string = '';
  confirmaSenha: string = '';
  email: string = '';
  dataNascimento: string = '';
  cpf: string = '';
  telefone: string = '';
  endereco: string = '';
  cep: string = '';
  cidade: string = '';
  estado: string = '';
  pais: string = '';
  foto: string = '';
  tipo: number = 1;
  status: string = '';
  dataCadastro: string = new Date(Date.now()).toISOString();
  dataAlteracao: string = new Date(Date.now()).toISOString();

  constructor(private cadastroUsuarioService: CadastroUsuarioService) {}

  verificarSenhas() {
    if (this.senha !== this.confirmaSenha) {
      alert('As senhas não correspondem. Por favor, tente novamente.');
      return false;
    }
    return true;
  }

  registerUser() {
    if (this.verificarSenhas()) {
      const usuario = {
        nome: this.nome,
        email: this.email,
        dataNascimento: this.dataNascimento,
        cpf: this.cpf,
        senha: this.senha,
        telefone: this.telefone,
        endereco: this.endereco,
        cep: this.cep,
        cidade: this.cidade,
        estado: this.estado,
        pais: this.pais,
        foto: this.foto,
        tipo: this.tipo,
        status: this.status,
        dataCadastro: this.dataCadastro,
        dataAlteracao: this.dataAlteracao
      };

      console.log('Cadastrando usuário:', usuario);

      this.cadastroUsuarioService.cadastrarUsuario(usuario).subscribe(
        response => {
          console.log('Usuário cadastrado com sucesso!');
          alert('Usuário cadastrado com sucesso!');
          // Limpar os campos do formulário após o cadastro, se necessário
          // this.clearForm();
        },
        error => {
          console.error('Erro ao cadastrar usuário:', error);
          alert('Erro ao cadastrar usuário. Tente novamente.');
        }
      );
    }
  }
}





// import { Component } from '@angular/core';
// import { CadastroUsuarioService } from '../../services/cadastro-usuario.service';


// @Component({
//   selector: 'app-pagina-cadastro',
//   templateUrl: './pagina-cadastro.component.html',
//   styleUrls: ['./pagina-cadastro.component.scss']
// })

// export class PaginaCadastroComponent {
//   nome: string = '';
//   senha: string = '';
//   email: string = '';
//   dataNascimento: string = '';
//   cpf: string = '';
//   telefone: string = '';
//   endereco: string = '';
//   cep: string = '';
//   cidade: string = '';
//   estado: string = '';
//   pais: string = '';
//   foto: string = '';
//   tipo: number = 1;
//   status: string = '';
//   dataCadastro: string = new Date(Date.now()).toISOString();
//   dataAlteracao: string = new Date(Date.now()).toISOString();
  




//   constructor(private cadastroUsuarioService: CadastroUsuarioService) {}

//   registerUser() {
//     const usuario = {
//       nome: this.nome,
//       email: this.email,
//       dataNascimento: this.dataNascimento,
//       cpf: this.cpf,
//       senha: this.senha,
//       telefone: this.telefone,
//       endereco: this.endereco,
//       cep: this.cep,
//       cidade: this.cidade,
//       estado: this.estado,
//       pais: this.pais,
//       foto: this.foto,
//       tipo: this.tipo,
//       status: this.status,
//       dataCadastro: this.dataCadastro,
//       dataAlteracao: this.dataAlteracao

//     };





//     console.log('Cadastrando usuário:', usuario);

//     this.cadastroUsuarioService.cadastrarUsuario(usuario).subscribe(
//       response => {
//         console.log('Usuário cadastrado com sucesso!');
//         // Limpar os campos do formulário após o cadastro, se necessário
//         // this.clearForm();
//       },
//       error => {
//         console.error('Erro ao cadastrar usuário:', error);
//       }
//     );
//   }




//   // // Função para limpar os campos do formulário após o cadastro
//   // clearForm() {
//   //   this.name = '';
//   //   this.password = '';
//   //   this.email = '';
//   //   this.dataNascimento = '';
//   //   this.cpf = '';
//   //   this.telefone = '';
//   //   this.endereco = '';
//   //   this.cep = '';
//   //   this.cidade = '';
//   //   this.estado = '';
//   //   this.pais = '';
//   //   this.foto = '';
//   // }
// }
