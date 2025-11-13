import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  
  constructor() {}

  /**
   * Gera uma chave de criptografia baseada nos IDs dos usuários do chat
   * Usa PBKDF2 para derivar uma chave forte a partir dos IDs
   */
  private async generateKey(usuario1Id: number, usuario2Id: number): Promise<CryptoKey> {
    // Ordena os IDs para garantir que a chave seja a mesma independente da ordem
    const ids = [usuario1Id, usuario2Id].sort((a, b) => a - b);
    const keyMaterial = `vuco-chat-${ids[0]}-${ids[1]}`;
    
    // Converte a string em bytes
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyMaterial);
    
    // Importa o material da chave
    const importedKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Deriva uma chave AES-GCM forte
    const salt = encoder.encode('vuco-salt-2025'); // Salt fixo baseado nos IDs
    
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      importedKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Criptografa uma mensagem de texto
   */
  async encrypt(texto: string, usuario1Id: number, usuario2Id: number): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(texto);
      
      // Gera a chave
      const key = await this.generateKey(usuario1Id, usuario2Id);
      
      // Gera um IV (Initialization Vector) aleatório
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Criptografa
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        data
      );
      
      // Combina IV + dados criptografados
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      // Converte para base64
      return this.arrayBufferToBase64(combined);
    } catch (error) {
      console.error('Erro ao criptografar:', error);
      throw error;
    }
  }

  /**
   * Descriptografa uma mensagem
   */
  async decrypt(textoCriptografado: string, usuario1Id: number, usuario2Id: number): Promise<string> {
    try {
      // Converte de base64
      const combined = this.base64ToArrayBuffer(textoCriptografado);
      
      // Extrai IV e dados criptografados
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);
      
      // Gera a chave
      const key = await this.generateKey(usuario1Id, usuario2Id);
      
      // Descriptografa
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        data
      );
      
      // Converte de volta para texto
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Erro ao descriptografar:', error);
      // Retorna uma mensagem indicando que não foi possível descriptografar
      return '[Mensagem criptografada - não foi possível descriptografar]';
    }
  }

  /**
   * Converte ArrayBuffer para Base64
   */
  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  /**
   * Converte Base64 para ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Verifica se uma string está criptografada (é base64 válido)
   */
  isEncrypted(texto: string): boolean {
    try {
      // Tenta decodificar como base64
      const decoded = atob(texto);
      // Se conseguir e tiver tamanho razoável, provavelmente está criptografado
      return decoded.length > 12; // IV tem 12 bytes mínimo
    } catch {
      return false;
    }
  }
}
