import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ComeChatService {

  constructor(
  ) { }
  private OpenChat = new Subject<{
    GroupChatId:any,
    ListUser:Array<{
      userCode: any,
      name:string,
      avatar: string,
      // status:string
    }>
    GroupAvatar:string
    Name:string 
  
  }>();
  buttonClicked$ = this.OpenChat.asObservable();
  OpenChatBox(GroupChatId:any,ListUser:Array<{userCode: any,name:string, avatar: string}>,GroupAvatar:string,Name:string) {
    this.OpenChat.next({GroupChatId,ListUser,GroupAvatar,Name });
  }
}
