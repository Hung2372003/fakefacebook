import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CallApiService } from '../wwwroot/Service/call-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AESEncryption } from '../AES/AESEncryption';
import { AESDecryption } from '../AES/AESDecryption';
import { AuthencationUserService } from '../wwwroot/Authentication_User/authencation-user.service';
import * as forge from 'node-forge';
@Component({
  selector: 'app-app-admin',
  imports: [CommonModule,FormsModule],
  templateUrl: './app-admin.component.html',
  styleUrl: './app-admin.component.scss'
})
export class AppAdminComponent implements OnInit {
  constructor(
    private CallApiService:CallApiService,
    private Auth:AuthencationUserService,
      private cdr: ChangeDetectorRef,
  ){}

  dataIfnor:Array<any>=[]
  async getAllInforAcc(){
    const data = await this.CallApiService.CallApi('TestController/InforAllAccount','get',null)
    return data
  }

  ok(){
    for(let i=1;i<this.dataIfnor.length;i++){
        if( this.dataIfnor[i].Status==null){
          this.dataIfnor[i].userName=AESDecryption.Decryption(this.dataIfnor[i].userName,this.AESKey)
          this.dataIfnor[i].userPassword=AESDecryption.Decryption(this.dataIfnor[i].userPassword,this.AESKey)
          this.dataIfnor[i].address=AESDecryption.Decryption(this.dataIfnor[i].address,this.AESKey)
          this.dataIfnor[i].phoneNumber=AESDecryption.Decryption(this.dataIfnor[i].phoneNumber,this.AESKey)
          this.dataIfnor[i].email=AESDecryption.Decryption(this.dataIfnor[i].email,this.AESKey)
          this.dataIfnor[i].birthday=AESDecryption.Decryption(this.dataIfnor[i].birthday,this.AESKey)
        }
     }
     this.cdr.detectChanges()
  }
  AESKeySv=''
  async ngOnInit(): Promise<void> {
      const rsa = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      let  privateKeyPem = forge.pki.privateKeyToPem(rsa.privateKey);
      let data = await this.CallApiService.CallApi('TestController/InforAllAccount','post',JSON.stringify(forge.pki.publicKeyToPem(rsa.publicKey)));
      for(let i=0;i<data.object.length;i++){
        if(data.object[i].status!=null && data.object[i].status!='')
        {
          data.object[i].status = this.Auth.decryptAESKey(data.object[i].status,privateKeyPem)
          data.object[i].userPassword=AESDecryption.Decryption(data.object[i].userPassword,data.object[i].status)
          data.object[i].userName=AESDecryption.Decryption(data.object[i].userName,data.object[i].status)
          data.object[i].address=AESDecryption.Decryption(data.object[i].address,data.object[i].status)
          data.object[i].phoneNumber=AESDecryption.Decryption(data.object[i].phoneNumber,data.object[i].status)
          data.object[i].email=AESDecryption.Decryption(data.object[i].email,data.object[i].status)
          data.object[i].birthday=AESDecryption.Decryption(data.object[i].birthday,data.object[i].status)
        }     
      this.dataIfnor = data.object
  }
  }

  tooltipContent: string = '';
  tooltipStyle: any = {};
  isTooltipVisible: boolean = false;

  showTooltip(event: MouseEvent, content: string) {
    this.tooltipContent = content;
    this.isTooltipVisible = true;
    this.tooltipStyle = {
      top: event.clientY + 7 + 'px',
      left: event.clientX + 7 + 'px'
    };
  }

  displayClick='';
  hideTooltip() {
    this.isTooltipVisible = false;
    this.displayClick='';
  }
  copyToClipboard(content: string) {
    navigator.clipboard.writeText(content).then(() => {
      this.tooltipContent = "Đã copy!";
      this.displayClick='none';

      setTimeout(() => {
        this.hideTooltip();
      }, 1000);
    });
  }

  AESEncryptionString=''
  AESDecryptionString=''
  AESKey=''
  CoverString=''
  encryptData(){
    this.CoverString= AESEncryption.encryption(this.AESEncryptionString,this.AESKey)
  }
  decryptData(){
    this.CoverString=AESDecryption.Decryption(this.AESDecryptionString,this.AESKey)
  }

}
