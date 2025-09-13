import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5074/v1/registrarProduto'; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  registerProduct(productData: any): Observable<any> {
    return this.http.post(this.apiUrl, productData);
  }
}


// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProductService {

//   private apiUrl = 'http://localhost:5074/v1/registrarProduto';

//   constructor(private http: HttpClient) { }

//   registerProduct(productData: any): Observable<any> {
//     return this.http.post(this.apiUrl, productData);
//   }
// }
