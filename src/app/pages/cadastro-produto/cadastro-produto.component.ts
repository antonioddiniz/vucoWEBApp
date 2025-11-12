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
  base64Images: string[] = []; // Array de imagens
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
    const files = event.target.files;
    if (files && files.length > 0) {
      // Limita a 5 imagens
      const maxImages = 5;
      const filesToProcess = Array.from(files).slice(0, maxImages);
      
      filesToProcess.forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          this.base64Images.push(base64);
          
          // Define primeira imagem como principal (retrocompatibilidade)
          if (this.base64Images.length === 1) {
            this.base64Image = base64;
          }
          
          this.productForm.patchValue({ imagem: 'image.jpg' });
          this.productForm.get('imagem')?.updateValueAndValidity();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index?: number): void {
    if (index !== undefined) {
      // Remove imagem específica
      this.base64Images.splice(index, 1);
      
      // Atualiza imagem principal
      if (this.base64Images.length > 0) {
        this.base64Image = this.base64Images[0];
      } else {
        this.base64Image = null;
        this.productForm.patchValue({ imagem: null });
        this.productForm.get('imagem')?.setErrors({ required: true });
      }
    } else {
      // Remove todas as imagens
      this.base64Image = null;
      this.base64Images = [];
      this.productForm.patchValue({ imagem: null });
      this.productForm.get('imagem')?.setErrors({ required: true });
    }
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

    if (this.userInfo && this.userInfo.id !== null && this.base64Images.length > 0) {
      this.isSubmitting = true;
      
      const productData = {
        ...this.productForm.value,
        usuarioId: this.userInfo.id,
        imagem: this.base64Images[0], // Primeira imagem como principal
        imagens: this.base64Images // Array de todas as imagens
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
