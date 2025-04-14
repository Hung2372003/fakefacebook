import { Injectable } from '@angular/core';
import { CallApiService } from '../Service/call-api.service';
import * as forge from 'node-forge';
// Kiểm tra xem đã có cặp khóa RSA chưa, nếu chưa thì tạo

@Injectable({
  providedIn: 'root'
})
export class AuthencationUserService {

  constructor(
    private CallApiServices:CallApiService,
  ) { }

  async SignIn(data:any){
    return await this.CallApiServices.CallApi('Security/userLogin','post',data)
  }
  async Register(data:any){
    return await this.CallApiServices.CallApi('Security/RegisterAcc','post',data)
  }
  decryptAESKey(encryptedAESKey: string,privateKeyPem:string) {
    if (!privateKeyPem) {
      console.error(' Private Key không tồn tại.');
      return null;
    }
  
    try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      // Kiểm tra xem dữ liệu có hợp lệ không
      if (!encryptedAESKey || encryptedAESKey.length < 128) {
        console.error(' Dữ liệu mã hóa không hợp lệ.');
        return null;
      }
  
      // Giải mã AES Key từ RSA
      const decryptedAESKey = privateKey.decrypt(
        forge.util.decode64(encryptedAESKey),
        'RSA-OAEP',
        {
          md: forge.md.sha256.create(), // Dùng SHA-256 
        }
      );
      return decryptedAESKey;
    } catch (error) {
      console.error(' Lỗi khi giải mã AES Key:', error);
      return null;
    }
  }

  encryptWithPublicKey(publicKeyPem: string, data: string): string {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encrypted = publicKey.encrypt(data, 'RSA-OAEP', { md: forge.md.sha256.create() });
    return forge.util.encode64(encrypted);
  }

  async GetAESKey(){
    let privateKeyPem = localStorage.getItem('privateKey');
    let publicKeyPem = localStorage.getItem('publicKey');

    if (!privateKeyPem || !publicKeyPem) {
      const rsa = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      privateKeyPem = forge.pki.privateKeyToPem(rsa.privateKey);
      publicKeyPem = forge.pki.publicKeyToPem(rsa.publicKey);

      localStorage.setItem('privateKey', privateKeyPem);
      localStorage.setItem('publicKey', publicKeyPem);
    }
    let key= await this.CallApiServices.CallApi('Security/GetKeyAES','post',JSON.stringify(publicKeyPem))
    return key.object
  }
  generateRandomAESKey(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    return result;
  }
  async getRSAKey(){
    let key = await this.CallApiServices.CallApi('Security/GetPublicRSAKey','get',null);
    return key.object
  }
}
