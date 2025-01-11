import { ChangeDetectorRef, Component } from '@angular/core';
import { CallApiService } from '../../../../Service/call-api.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ComeChatService } from '../../../../Service/come-chat.service';
import { FormsModule } from '@angular/forms';
import { HeaderService } from '../../../header/header.service';

@Component({
    selector: 'app-list-search-friend',
    standalone: true,
    imports: [NgFor, NgIf, CommonModule, FormsModule],
    templateUrl: './list-search-friend.component.html',
    styleUrl: './list-search-friend.component.scss'
})
export class ListSearchFriendComponent {
  constructor(
    private CallApiService:CallApiService,
    private ComeChatService:ComeChatService,
    private cdr:ChangeDetectorRef,
    private HeaderService:HeaderService
  ){}


  input:string=''
  listSearchUser:any
  async changeInput(event: Event){
    const input = event.target as HTMLInputElement
    if(input.value!=''){
      await this.getListSearchUser(input.value)
    }
   
  }

  async getListSearchUser(text:string){
    this.listSearchUser = await this.CallApiService.CallApi('PersonalAction/SeachPeople','post',JSON.stringify(text))
  }
  sendRequestFriend(id:number){
    this.CallApiService.CallApi('PersonalAction/FriendRequest','post',JSON.stringify(id))
    this.reloadSearch()
   
  }
  unRequestFriend(id:number){
    this.CallApiService.CallApi('PersonalAction/Unfriend','post',JSON.stringify(id))
    this.reloadSearch()
  }
  openChat(GroupChatId:any,ListUserChat:any,GroupAvatar:string,Name:string){
    this.ComeChatService.OpenChatBox(GroupChatId,ListUserChat,GroupAvatar,Name);
  }
  OpenInfor(id:any){
    this.HeaderService.openPersionalInformation(id)
  }
  reloadSearch(){
   
    if(this.input!=null && this.input!=''){
      this.getListSearchUser(this.input)
    }
    this.cdr.detectChanges();
  }

}
