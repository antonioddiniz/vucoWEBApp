import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GoogleAuth } from '@southdevs/capacitor-google-auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    GoogleAuth.initialize({
      clientId: environment.googleClientId,
      scopes: ['profile', 'email'],
      grantOfflineAccess: true
    });
  }

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
      const user = await GoogleAuth.signIn({ scopes: ['email', 'profile'] });
      
      this.authService.loginWithGoogle(user.authentication.idToken).subscribe(
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
