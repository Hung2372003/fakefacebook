import { Component,Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink,RouterLinkActive, RouterModule } from '@angular/router';
import {  FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthencationUserService } from '../authencation-user.service';
import { ConectSinglRService } from '../../Service/conect-singl-r.service';
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
    private ConectSinglRService:ConectSinglRService

  ){}

  //  UserAccout: SignInModel={UserName:'',Password:''}
   public UserAccout={
    UserName:'',
    Password:''
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
      const message=await  this.AuthencationServices.SignIn(this.UserAccout);
      if(message.error==false){
        localStorage.setItem('token', message.object)
        localStorage.setItem('userCode',message.id)
  
        // this.ConectSinglRService.startConnection();
        this.router.navigate(['/app-user'])
        // window.location.href='/app-user';
        // window.open('/app-user')
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
   
   }

}
