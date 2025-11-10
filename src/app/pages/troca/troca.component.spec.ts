import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrocaComponent } from './troca.component';

describe('TrocaComponent', () => {
  let component: TrocaComponent;
  let fixture: ComponentFixture<TrocaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrocaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrocaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
