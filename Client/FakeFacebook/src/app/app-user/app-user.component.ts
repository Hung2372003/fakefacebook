import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../wwwroot/App_User/header/header.component";
import { MainComponent } from "../wwwroot/App_User/main/main.component";
import { ChatBoxComponent } from "../wwwroot/App_User/chat-box/chat-box.component";
import { CommonModule } from '@angular/common';
import { Inject,PLATFORM_ID } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { ViewImageComponent } from "../wwwroot/App_User/view-image/view-image.component";
import { HomeMainService } from '../wwwroot/App_User/main/home-main/Service/home-main.service';

@Component({
    selector: 'app-app-user',
    standalone: true,
    imports: [HeaderComponent, MainComponent, ChatBoxComponent, CommonModule, ViewImageComponent],
    templateUrl: './app-user.component.html',
    styleUrl: './app-user.component.scss'
})
export class AppUserComponent implements OnInit,AfterViewInit{
constructor(
  @Inject(PLATFORM_ID) private platformId: Object,
  private HomeManiService:HomeMainService
){}
displayViewImage='none'
  ngOnInit(): void {
   
  }
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
  
   addLoadBody() {
    const div = document.createElement('div');
    div.id = 'preloader'; 
    document.body.appendChild(div);
  }
}
