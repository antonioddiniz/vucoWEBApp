import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@southdevs/capacitor-google-auth';
import { environment } from '../../environments/environment';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  
  constructor() {
    if (Capacitor.isNativePlatform()) {
      // Inicializa para plataformas nativas (Android/iOS)
      GoogleAuth.initialize({
        clientId: environment.googleClientId,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true
      });
    }
  }

  async signIn(): Promise<any> {
    if (Capacitor.isNativePlatform()) {
      // Usa Capacitor plugin para Android/iOS
      return await this.nativeSignIn();
    } else {
      // Usa Google Identity Services para Web
      return await this.webSignIn();
    }
  }

  private async nativeSignIn(): Promise<any> {
    try {
      const user = await GoogleAuth.signIn({ scopes: ['email', 'profile'] });
      return {
        idToken: user.authentication.idToken,
        user: {
          email: user.email,
          name: user.name,
          imageUrl: user.imageUrl
        }
      };
    } catch (error) {
      throw error;
    }
  }

  private async webSignIn(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined') {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          resolve({
            idToken: response.credential,
            user: this.parseJwt(response.credential)
          });
        }
      });

      // Mostra o One Tap
      google.accounts.id.prompt();
    });
  }

  private renderButton() {
    const buttonDiv = document.createElement('div');
    buttonDiv.id = 'g_id_signin';
    document.body.appendChild(buttonDiv);

    google.accounts.id.renderButton(
      buttonDiv,
      { theme: 'outline', size: 'large' }
    );
  }

  private parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}
