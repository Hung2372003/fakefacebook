import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import {  FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthencationUserService } from '../authencation-user.service';
import { AESEncryption } from '../../../AES/AESEncryption';
// Kiểm tra xem đã có cặp khóa RSA chưa, nếu chưa thì tạo
@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [RouterLink, RouterModule, FormsModule, CommonModule],
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})

export class SignInComponent {
  constructor(
    private router:Router,
    private AuthencationServices:AuthencationUserService,

  ){}

  //  UserAccout: SignInModel={UserName:'',Password:''}
   public UserAccout={
    UserName:'',
    Password:'',
    Key:''
   }
   responseData: any;
   ErrorPassword=false;
   ErrorUserName=false;
   ErrorStUserName=''
   ErrorStPassword=''
   HidenStatus(){
    this.ErrorPassword=false
    this.ErrorUserName=false
    this.ErrorStUserName=''
    this.ErrorStPassword=''
   }
   
   async submit(){ 
      let key =this.AuthencationServices.generateRandomAESKey(16);
      let publicRSAKey= await this.AuthencationServices.getRSAKey()
      this.UserAccout.Password=AESEncryption.encryption( this.UserAccout.Password,key)
      this.UserAccout.UserName=AESEncryption.encryption( this.UserAccout.UserName,key)
      this.UserAccout.Key = this.AuthencationServices.encryptWithPublicKey(publicRSAKey.toString(),key)
      const message=await this.AuthencationServices.SignIn(this.UserAccout);
      this.UserAccout==null;
      if(message.error==false){
        localStorage.setItem('token', message.object)
        localStorage.setItem('userCode',message.id)
        this.router.navigate(['/admin'])
        // this.router.navigate(['/messages'])
      }
      else{
        if(message.title=='PassFalse') {
          this.ErrorPassword=true
          this.ErrorStPassword='block'
        }
        if(message.title=='UserFalse') {
          this.ErrorUserName=true
          this. ErrorStUserName='block'
        }
      }            
    // }
   }

}
