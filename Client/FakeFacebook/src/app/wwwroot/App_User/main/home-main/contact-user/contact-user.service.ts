import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CallApiService } from '../../../../Service/call-api.service';

@Injectable({
  providedIn: 'root'
})
export class ContactUserService {

  constructor(
    public CallApiServices:CallApiService,
  ) { }
  private OpenSelectUser = new Subject<void>();
  private CloseSelectUser = new Subject<void>();
  buttonClickedOpen$ = this.OpenSelectUser.asObservable();
  buttonClickedClose$=this.CloseSelectUser.asObservable();
  OpenWindowSelectUser() {
      this.OpenSelectUser.next();
  }
  CloseWindowSelectUser(){
    this.CloseSelectUser.next();
  }
  async CreateGroupChat(data:any){
   return await this.CallApiServices.CallApi('ChatBox/CreateGroupChat','post',data);
  }

  public ListUser: Array<number>=[];
  async GetGroupChat(){
    
    return await this.CallApiServices.CallApi('ChatBox/GetGroupChat','get',null);
   }

   //------------------------------------------------------------------------
  private defaut: Subject<void> = new Subject<void>();
  AddGroupClicked$ = this.defaut.asObservable(); 
  ReloadGroup() {
    this.defaut.next();
  }

  async getListUserOnline(){
    return await this.CallApiServices.CallApi('ChatBox/GetListUserOnline','get',null)
  }
}
