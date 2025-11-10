import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransacoesRecebidasComponent } from './transacoes-recebidas.component';

describe('TransacoesRecebidasComponent', () => {
  let component: TransacoesRecebidasComponent;
  let fixture: ComponentFixture<TransacoesRecebidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransacoesRecebidasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransacoesRecebidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
