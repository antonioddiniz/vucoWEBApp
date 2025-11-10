import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GoogleAuthService } from '../../services/google-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private googleAuthService: GoogleAuthService
  ) { }

  login(): void {
    this.authService.login(this.email, this.password).subscribe(
      response => {
        this.router.navigate(['/']); // Redireciona para a página inicial ou outra página protegida
      },
      error => {
        this.errorMessage = 'Invalid email or password';
      }
    );
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const result = await this.googleAuthService.signIn();
      
      this.authService.loginWithGoogle(result.idToken).subscribe(
        response => {
          this.router.navigate(['/']);
        },
        error => {
          this.errorMessage = 'Google login failed';
          console.error('Google login error:', error);
        }
      );
    } catch (error) {
      this.errorMessage = 'Google login failed';
      console.error('Google sign in error:', error);
    }
  }
}
