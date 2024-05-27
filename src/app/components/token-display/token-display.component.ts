import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';




@Component({
  selector: 'app-token-display',
  templateUrl: './token-display.component.html',
  styleUrls: ['./token-display.component.scss']
})
export class TokenDisplayComponent implements OnInit {
  token: string | null = null;
  userInfo: any; 

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.authService.getUserInfo().subscribe(
      user => {
        this.userInfo = user; // Atribui os dados do usuário à propriedade userInfo
      },
      error => {
        console.error('Error fetching user information:', error);
      }
    );
  
    
  }
}
