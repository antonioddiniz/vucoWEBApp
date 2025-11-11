import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CadastroUsuarioService } from '../../services/cadastro-usuario.service';
import { AuthService } from '../../services/auth.service';
import { GoogleAuthService } from '../../services/google-auth.service';

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
  
  // Flags para validação visual
  cpfInvalido: boolean = false;
  idadeInvalida: boolean = false;

  constructor(
    private cadastroUsuarioService: CadastroUsuarioService,
    private authService: AuthService,
    private router: Router,
    private googleAuthService: GoogleAuthService
  ) {}

  verificarSenhas() {
    if (this.senha !== this.confirmaSenha) {
      alert('As senhas não correspondem. Por favor, tente novamente.');
      return false;
    }
    return true;
  }

  validarCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Valida os dígitos verificadores
    let soma = 0;
    let resto;

    // Valida primeiro dígito
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    // Valida segundo dígito
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  validarIdade(): boolean {
    if (!this.dataNascimento) {
      return false;
    }

    const hoje = new Date();
    const nascimento = new Date(this.dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();

    // Ajusta a idade se ainda não fez aniversário este ano
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade >= 18;
  }

  // Validação em tempo real do CPF
  validarCPFInput() {
    if (this.cpf && this.cpf.trim() !== '') {
      this.cpfInvalido = !this.validarCPF(this.cpf);
    } else {
      this.cpfInvalido = false;
    }
  }

  // Validação em tempo real da idade
  validarIdadeInput() {
    if (this.dataNascimento && this.dataNascimento.trim() !== '') {
      this.idadeInvalida = !this.validarIdade();
    } else {
      this.idadeInvalida = false;
    }
  }

  // Máscara para CPF
  formatarCPF(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.cpf = valor;
    }
    
    // Valida apenas se o CPF estiver completo (11 dígitos)
    const apenasNumeros = this.cpf.replace(/\D/g, '');
    if (apenasNumeros.length === 11) {
      this.validarCPFInput();
    } else if (apenasNumeros.length > 0) {
      // Se estiver digitando, não mostra erro ainda
      this.cpfInvalido = false;
    }
  }

  registerUser() {
    // Valida campos obrigatórios
    if (!this.nome || !this.nome.trim()) {
      alert('Por favor, preencha o nome completo.');
      return;
    }

    if (!this.cpf || !this.cpf.trim()) {
      alert('Por favor, preencha o CPF.');
      return;
    }

    // Valida CPF
    if (!this.validarCPF(this.cpf)) {
      alert('CPF inválido. Por favor, verifique o número informado.');
      return;
    }

    if (!this.dataNascimento || !this.dataNascimento.trim()) {
      alert('Por favor, preencha a data de nascimento.');
      return;
    }

    // Valida idade
    if (!this.validarIdade()) {
      alert('É necessário ter 18 anos ou mais para se cadastrar.');
      return;
    }

    if (!this.email || !this.email.trim()) {
      alert('Por favor, preencha o email.');
      return;
    }

    if (!this.telefone || !this.telefone.trim()) {
      alert('Por favor, preencha o telefone.');
      return;
    }

    if (!this.endereco || !this.endereco.trim()) {
      alert('Por favor, preencha o endereço.');
      return;
    }

    if (!this.cep || !this.cep.trim()) {
      alert('Por favor, preencha o CEP.');
      return;
    }

    if (!this.cidade || !this.cidade.trim()) {
      alert('Por favor, preencha a cidade.');
      return;
    }

    if (!this.estado || !this.estado.trim()) {
      alert('Por favor, selecione o estado.');
      return;
    }

    if (!this.pais || !this.pais.trim()) {
      alert('Por favor, preencha o país.');
      return;
    }

    if (!this.senha || !this.senha.trim()) {
      alert('Por favor, preencha a senha.');
      return;
    }

    if (!this.confirmaSenha || !this.confirmaSenha.trim()) {
      alert('Por favor, confirme a senha.');
      return;
    }

    // Valida senhas
    if (!this.verificarSenhas()) {
      return;
    }

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
          this.router.navigate(['/login']);
        },
        error => {
          console.error('Erro ao cadastrar usuário:', error);
          // Verifica se é erro de email duplicado
          if (error.error && error.error.message) {
            alert(error.error.message);
          } else {
            alert('Erro ao cadastrar usuário. Tente novamente.');
          }
        }
      );
  }

  async signUpWithGoogle(): Promise<void> {
    try {
      const result = await this.googleAuthService.signIn();
      
      this.authService.loginWithGoogle(result.idToken).subscribe(
        response => {
          console.log('Cadastro/Login com Google bem-sucedido');
          this.router.navigate(['/lista-produto']);
        },
        error => {
          console.error('Erro no cadastro/login com Google:', error);
          alert('Erro ao fazer cadastro com Google. Tente novamente.');
        }
      );
    } catch (error) {
      console.error('Erro ao fazer sign in com Google:', error);
      alert('Erro ao conectar com Google. Tente novamente.');
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
