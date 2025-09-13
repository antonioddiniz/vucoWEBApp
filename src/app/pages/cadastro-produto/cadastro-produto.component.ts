import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/cadastro-produto.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './cadastro-produto.component.html',
  styleUrls: ['./cadastro-produto.component.scss']
})
export class CadastroProdutoComponent implements OnInit {
  productForm: FormGroup;
  token: string | null = null;
  userInfo: any;
  base64Image: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['', Validators.required],
      categoria: ['', Validators.required],
      imagem: ['', Validators.required],
      status: [1, Validators.required], // valor padrão
      dataDeCriacao: [new Date(), Validators.required], // valor padrão
      dataDeAlteracao: [new Date(), Validators.required] // valor padrão
    });
  }

  ngOnInit(): void {
    this.token = this.authService.getToken();
    console.log('token', this.token);
    this.authService.getUserInfo().subscribe(
      userInfo => {
        this.userInfo = userInfo;
      },
      error => {
        console.error('Erro ao buscar informações do usuário', error);
      }
    );
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.base64Image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.userInfo && this.userInfo.id !== null && this.base64Image) {
      const productData = {
        ...this.productForm.value,
        usuarioId: this.userInfo.id,
        imagem: this.base64Image
      };
      
      console.log('productData', productData);

      this.productService.registerProduct(productData).subscribe(response => {
        console.log('Produto cadastrado com sucesso!', response);
      }, error => {
        console.error('Erro ao cadastrar produto', error);
      });
    } else {
      console.error('Usuário não autenticado ou imagem não carregada');
    }
  }
}





// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AuthService } from '../../services/auth.service';
// import { ProductService } from '../../services/cadastro-produto.service';

// @Component({
//   selector: 'app-product-form',
//   templateUrl: './cadastro-produto.component.html',
//   styleUrls: ['./cadastro-produto.component.scss']
// })
// export class CadastroProdutoComponent implements OnInit {
//   productForm: FormGroup;
//   token: string | null = null;
//   userInfo: any;

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private productService: ProductService
//   ) {
//     this.productForm = this.fb.group({
//       nome: ['', Validators.required],
//       descricao: ['', Validators.required],
//       categoria: ['', Validators.required],
//       imagem: ['', Validators.required],
//       status: [1, Validators.required], // valor padrão
//       dataDeCriacao: [new Date(), Validators.required], // valor padrão
//       dataDeAlteracao: [new Date(), Validators.required] // valor padrão

//     });
//   }

//   ngOnInit(): void {
//     this.token = this.authService.getToken();
//     console.log('token', this.token);
//     this.authService.getUserInfo().subscribe(
//       userInfo => {
//         console.log('userInfo', userInfo);
//         this.userInfo = userInfo;
//       },
//       error => {
//         console.error('Erro ao buscar informações do usuário', error);
//       }
//     );
//   }



//   onSubmit(): void {
//     if (this.userInfo && this.userInfo.id !== null) {
//       const productData = {
//         ...this.productForm.value,
//         usuarioId: this.userInfo.id
//       };
      
//       console.log('productData', productData);

//       this.productService.registerProduct(productData).subscribe(response => {
//         console.log('Produto cadastrado com sucesso!', response);
//       }, error => {
//         console.error('Erro ao cadastrar produto', error);
//       });
//     } else {
//       console.error('Usuário não autenticado');
//     }
//   }
// }
