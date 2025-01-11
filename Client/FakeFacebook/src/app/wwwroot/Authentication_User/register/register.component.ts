import { Component } from '@angular/core';
import { RouterLink,RouterLinkActive, RouterModule,Router } from '@angular/router';
import {  FormsModule } from '@angular/forms';
import { AuthencationUserService } from '../authencation-user.service';
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [RouterLink, RouterModule, FormsModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {

  public  RegisterUser={
    FirstName:'',
    LastName:'',
    Email:'',
    Address:'',
    PhoneNumber:'',
    UserAccout:'',
    PassWord:'',
    RepeatPassword:''
  }

  constructor(
    private router: Router,
    private AuthencationUser:AuthencationUserService
  ) {}

  async submit(){
   const message= await this.AuthencationUser.Register(this.RegisterUser)
   if(message.error==false){
    localStorage.setItem('token', message.object)
    localStorage.setItem('userCode',message.id)
    this.router.navigate(['/app-user'])
   }else{
    alert(message.title)
   }
  }
}
