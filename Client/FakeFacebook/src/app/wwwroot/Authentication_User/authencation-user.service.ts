import { Injectable } from '@angular/core';
import { CallApiService } from '../Service/call-api.service';

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
}
