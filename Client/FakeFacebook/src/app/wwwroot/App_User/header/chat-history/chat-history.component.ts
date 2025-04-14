import { ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { HeaderService } from '../header.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ConectSinglRService } from '../../../Service/conect-singl-r.service';
import { ComeChatService } from '../../../Service/come-chat.service';
import { ChatBoxService } from '../../chat-box/chat-box.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({
    selector: 'app-chat-history',
    standalone: true,
    imports: [CommonModule, NgFor, NgIf,RouterLink],
    templateUrl: './chat-history.component.html',
    styleUrl: './chat-history.component.scss'
})
export class ChatHistoryComponent implements OnInit {
 constructor(
  private el:ElementRef,
  private HeaderService:HeaderService,
  private ConectSinglRService:ConectSinglRService,
  private cdr: ChangeDetectorRef,
  private ComeChatService:ComeChatService,
  private ChatBoxService:ChatBoxService,
    private getRoute: ActivatedRoute

 ){}
  contains(target: HTMLElement): boolean {
    return this.el.nativeElement.contains(target);
  }

  displayOpenMessages='';
  listUserOnline:any;
  ListNewMessage:any;
  ngOnInit(): void {
      this.HeaderService.ListMessageHistory$.subscribe(data=>{
        this.ListNewMessage=data;
        console.log(data)
        this.cdr.detectChanges();
      })
      this.ConectSinglRService.getListUserOnline(listUserOnline=>{
        this.listUserOnline=listUserOnline;
        this.cdr.detectChanges();
      })
      if(this.getRoute.snapshot.url.join('/')=='messages'){
        this.displayOpenMessages='none'
  
      } 
  }

  openChat(data:any){
    this.ComeChatService.OpenChatBox(data.groupChatId,data.listUser,data.groupAvatar,data.groupName);
    this.ChatBoxService.setStatusMess(Number(data.groupChatId))
    this.HeaderService.closeHistory();
  }
  checkOnline(data:any){
    let check=false
    if(this.listUserOnline){
      for (const item of data) {  
          if(this.listUserOnline.includes(item.userCode.toString())){
            check= true
            break;
          }   
      }
    }
    return check;
  }
  setDate(timeData:string){
    let time =new Date(timeData);
    let timeNow=new Date();

    let differenceInMilliseconds = Math.abs(time.getTime() - timeNow.getTime());
    let differenceInSeconds = differenceInMilliseconds / 1000;
    let differenceInMinutes = Math.round(differenceInSeconds / 60);
    let differenceInHour = Math.round(differenceInMinutes / 60);
    let differenceInDay =Math.round(differenceInHour / 24);

    if(differenceInSeconds<10){
      return "vừa xong"
    }
    else if(differenceInMinutes < 60){
      return differenceInMinutes.toString()+" phút"
    }
    else if(differenceInHour<24){
      return differenceInHour.toString()+" giờ"
    }
    else return differenceInDay.toString() +" Ngày"
  }
}
