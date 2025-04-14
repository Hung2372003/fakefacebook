import { AfterViewInit, Component } from '@angular/core';
import { HeaderComponent } from "../wwwroot/App_User/header/header.component";
import { ChatHistoryComponent } from "../wwwroot/App_User/header/chat-history/chat-history.component";
import { ChatBoxComponent } from "../wwwroot/App_User/chat-box/chat-box.component";
import { ViewImageComponent } from "../wwwroot/App_User/view-image/view-image.component";
import { CommonModule } from '@angular/common';
import { HomeMainService } from '../wwwroot/App_User/main/home-main/Service/home-main.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-app-messages',
  imports: [HeaderComponent, ChatHistoryComponent, ChatBoxComponent, ViewImageComponent, CommonModule],
  templateUrl: './app-messages.component.html',
  styleUrl: './app-messages.component.scss'
})
export class AppMessagesComponent implements AfterViewInit {

  constructor(
    private HomeManiService: HomeMainService,
     private getRoute: ActivatedRoute
  ){}
  ngAfterViewInit(): void {
    this.HomeManiService.fIleData$.subscribe(data=>{
      if(data.listFile.length>0){
        this.displayViewImage=''
      } 
    })
    this.HomeManiService.closeViewFileButton$.subscribe(()=>{
      this.displayViewImage='none'
    })
  }
  
  displayViewImage='none'
}
