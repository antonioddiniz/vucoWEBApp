import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarProdutosUsuarioComponent } from './listar-produtos-usuario.component';

describe('ListarProdutosUsuarioComponent', () => {
  let component: ListarProdutosUsuarioComponent;
  let fixture: ComponentFixture<ListarProdutosUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarProdutosUsuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListarProdutosUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
