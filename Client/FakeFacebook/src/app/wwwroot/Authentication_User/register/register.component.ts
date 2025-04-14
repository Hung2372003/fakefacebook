import { Component,ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterModule,Router } from '@angular/router';
import {  FormsModule } from '@angular/forms';
import { AuthencationUserService } from '../authencation-user.service';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import { AESEncryption } from '../../../AES/AESEncryption';
import { DatePipe } from '@angular/common';
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [RouterLink, RouterModule, FormsModule,MatFormFieldModule, MatInputModule, MatDatepickerModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideNativeDateAdapter(),DatePipe],
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
    RepeatPassword:'',
    Birthday:'',
    Key:'',
  }

  constructor(
    private router: Router,
    private AuthencationUser:AuthencationUserService,
    private datePipe: DatePipe
  ){}

  formatDate(date: Date | string): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || ''; 
  }

  async submit(){
    let key =this.AuthencationUser.generateRandomAESKey(16);
    this.RegisterUser.Email= AESEncryption.encryption(this.RegisterUser.Email,key)
    this.RegisterUser.Address= AESEncryption.encryption(this.RegisterUser.Address,key)
    this.RegisterUser.PhoneNumber= AESEncryption.encryption(this.RegisterUser.PhoneNumber,key)
    this.RegisterUser.UserAccout= AESEncryption.encryption(this.RegisterUser.UserAccout,key)
    this.RegisterUser.PassWord= AESEncryption.encryption(this.RegisterUser.PassWord,key)
    this.RegisterUser.Birthday= AESEncryption.encryption(this.formatDate(this.RegisterUser.Birthday),key)
    let publicRSAKey= await this.AuthencationUser.getRSAKey()
    let AESKeyEcr= this.AuthencationUser.encryptWithPublicKey(publicRSAKey.toString(),key)
    this.RegisterUser.Key=AESKeyEcr
    const message= await this.AuthencationUser.Register(this.RegisterUser)
    if(message.error==false){
      localStorage.setItem('token', message.object)
      localStorage.setItem('userCode',message.id)
      this.router.navigate(['/admin'])
    }else{
      alert(message.title)
    }
  }
}
