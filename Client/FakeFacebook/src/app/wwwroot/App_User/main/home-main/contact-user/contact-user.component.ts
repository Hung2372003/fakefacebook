import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {NgFor} from '@angular/common';
import { ComeChatService } from '../../../../Service/come-chat.service';
import { HomeMainService } from '../Service/home-main.service';
import { CommonModule } from '@angular/common';
import { ConectSinglRService } from '../../../../Service/conect-singl-r.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { SelecterUserGroupChatComponent } from "./selecter-user-group-chat/selecter-user-group-chat.component";
import { ContactUserService } from './contact-user.service';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-contact-user',
    standalone: true,
    imports: [NgFor, CommonModule, MatExpansionModule, SelecterUserGroupChatComponent],
    templateUrl: './contact-user.component.html',
    styleUrl: './contact-user.component.scss'
})
export class ContactUserComponent implements OnInit,OnDestroy,AfterViewInit {
  constructor(
    private ContactUserService:ContactUserService,
    private ComeChat:ComeChatService,
    private HomeMainServices:HomeMainService,
    private ConectSinglRServices:ConectSinglRService,
    private cdr: ChangeDetectorRef,
  
  ){}
  ListUserOnline : Array<string>=[]
  ListFriends : any;
  ListGroupChats:any;
  ListUserChat:Array<{
    UserCode:number,
    Avatar:string,
  }>=[];
  displayWindowAddGroup='';
  openchat(GroupChatId:any,ListUserChat:any,GroupAvatar:string,Name:string){
    this.ComeChat.OpenChatBox(GroupChatId,ListUserChat,GroupAvatar,Name);
  }
  getListUserOnline(callback: (UserCode: any) => void) {
    return this.ConectSinglRServices.hubConnection.on("ListUserOnline", callback);  

  }

  public buttonClickSubscription!: Subscription;

  ngAfterViewInit(){
    this.getListUserOnline((ListUser)=>{
      console.log('danh sách từ SignalR:', ListUser);
      this.ListUserOnline=ListUser;
      this.cdr.detectChanges();
    })
  }

  async ngOnInit(): Promise<void> {
  
    this.buttonClickSubscription=this.ContactUserService.buttonClickedClose$.subscribe(async (): Promise<void> =>{ 
      this.displayWindowAddGroup='';
    })
    this.ListFriends= await this.HomeMainServices.GetListFriend();

    this.ContactUserService.AddGroupClicked$.subscribe(async():Promise<void>=>{
      this.ListGroupChats = (await this.ContactUserService.GetGroupChat()).object;
      this.cdr.detectChanges();
    })
    this.ListGroupChats= (await this.ContactUserService.GetGroupChat()).object;
    this.ListUserOnline=await this.ContactUserService.getListUserOnline()
    // this.getListUserOnline((ListUser)=>{
    //   console.log('danh sách từ SignalR:', ListUser);
    //   this.ListUserOnline=ListUser;
    //   this.cdr.detectChanges();
    // })
    this.ConectSinglRServices.hubConnection.onclose(error => {
      if (error) {
        console.log('Kết nối bị ngắt do lỗi:', error);
      } else {
        console.log('Kết nối bị ngắt');
      }
    });
    // this.ConectSinglRServices.startConnection();
  }
  ngOnDestroy(): void {
    // Đảm bảo dừng kết nối khi component bị hủy
    // this.ConectSinglRServices.stopConnection();
  }

  OpenWindowSelectUser(){
    this.displayWindowAddGroup='flex'
    this.ContactUserService.OpenWindowSelectUser();
  }
  selfCode=Number(localStorage.getItem('userCode'))
  CheckOnline(ListMember:any){
    var check=false
    for(let i =0;i< ListMember.length;i++){
       this.ListUserOnline.forEach((x: string)=>{
        //  console.log( Number(x))
          if(ListMember[i].userCode== Number(x) && ListMember[i].userCode!=this.selfCode){
            check= true
          }    
      })
      if(check){
        return check
      }   
    }
    return check
  }
}
