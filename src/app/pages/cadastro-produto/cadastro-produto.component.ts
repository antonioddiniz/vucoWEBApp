import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['', Validators.required],
      categoria: ['', Validators.required],
      imagem: ['', Validators.required],
      status: [1, Validators.required],
      dataDeCriacao: [new Date(), Validators.required],
      dataDeAlteracao: [new Date(), Validators.required]
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
        this.productForm.patchValue({ imagem: file.name });
        this.productForm.get('imagem')?.updateValueAndValidity();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.base64Image = null;
    this.productForm.patchValue({ imagem: null });
    this.productForm.get('imagem')?.setErrors({ required: true });
  }

  cancel(): void {
    if (confirm('Tem certeza que deseja cancelar? As alterações não serão salvas.')) {
      this.router.navigate(['/lista-produto']);
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    if (this.userInfo && this.userInfo.id !== null && this.base64Image) {
      this.isSubmitting = true;
      
      const productData = {
        ...this.productForm.value,
        usuarioId: this.userInfo.id,
        imagem: this.base64Image
      };
      
      console.log('productData', productData);

      this.productService.registerProduct(productData).subscribe(
        response => {
          this.isSubmitting = false;
          console.log('Produto cadastrado com sucesso!', response);
          alert('Produto cadastrado com sucesso!');
          this.router.navigate(['/lista-produto']);
        }, 
        error => {
          this.isSubmitting = false;
          console.error('Erro ao cadastrar produto', error);
          alert('Erro ao cadastrar produto. Tente novamente.');
        }
      );
    } else {
      console.error('Usuário não autenticado ou imagem não carregada');
      alert('Por favor, preencha todos os campos e selecione uma imagem.');
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
