import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  // Modal de Detalhes
  private detalhesModalOpen = new BehaviorSubject<boolean>(false);
  private produtoIdSubject = new BehaviorSubject<number | null>(null);

  detalhesModalOpen$ = this.detalhesModalOpen.asObservable();
  produtoId$ = this.produtoIdSubject.asObservable();

  // Modal de Troca
  private trocaModalOpen = new BehaviorSubject<boolean>(false);
  private produtoTrocaIdSubject = new BehaviorSubject<number | null>(null);

  trocaModalOpen$ = this.trocaModalOpen.asObservable();
  produtoTrocaId$ = this.produtoTrocaIdSubject.asObservable();

  constructor() { }

  openDetalhesModal(produtoId: number): void {
    this.produtoIdSubject.next(produtoId);
    this.detalhesModalOpen.next(true);
    // Previne scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';
  }

  closeDetalhesModal(): void {
    this.detalhesModalOpen.next(false);
    this.produtoIdSubject.next(null);
    // Restaura scroll do body
    document.body.style.overflow = 'auto';
  }

  isDetalhesModalOpen(): boolean {
    return this.detalhesModalOpen.value;
  }

  getCurrentProdutoId(): number | null {
    return this.produtoIdSubject.value;
  }

  // Métodos para Modal de Troca
  openTrocaModal(produtoId: number): void {
    console.log('🐛 [ModalService] openTrocaModal chamado para produto:', produtoId);
    this.produtoTrocaIdSubject.next(produtoId);
    console.log('🐛 [ModalService] produtoTrocaIdSubject.next executado');
    this.trocaModalOpen.next(true);
    console.log('🐛 [ModalService] trocaModalOpen.next(true) executado');
    document.body.style.overflow = 'hidden';
    console.log('🐛 [ModalService] body.overflow = hidden');
  }

  closeTrocaModal(): void {
    this.trocaModalOpen.next(false);
    this.produtoTrocaIdSubject.next(null);
    document.body.style.overflow = 'auto';
  }

  isTrocaModalOpen(): boolean {
    return this.trocaModalOpen.value;
  }

  getCurrentProdutoTrocaId(): number | null {
    return this.produtoTrocaIdSubject.value;
  }
}
