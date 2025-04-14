import { Component, OnInit,HostListener,ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef   } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ConectSinglRService } from '../../Service/conect-singl-r.service';
import { ChatHistoryComponent } from "./chat-history/chat-history.component";
import { CommonModule } from '@angular/common';
import { SettingAccoutComponent } from "./setting-accout/setting-accout.component";
import { HeaderService } from './header.service';
import { PersionalInformationComponent } from "./persional-information/persional-information.component";
import {MatBadgeModule} from '@angular/material/badge';
import { ChatBoxService } from '../chat-box/chat-box.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        ChatHistoryComponent,
        CommonModule,
        SettingAccoutComponent,
        PersionalInformationComponent,
        MatBadgeModule
      ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit ,AfterViewInit,OnDestroy{
  constructor(
    private ConectSinglRService:ConectSinglRService,
    private HeaderService:HeaderService,
    private ChatBoxService:ChatBoxService,
    private cdr:ChangeDetectorRef,
    private getRoute: ActivatedRoute
    
  ){}
 
  @ViewChild(ChatHistoryComponent) chatHistory!: ChatHistoryComponent;
  @ViewChild(SettingAccoutComponent) settingAccount!: SettingAccoutComponent;

  @ViewChild('settingAccount', { static: false }) buttonOpenSettingAccount!: ElementRef;
  @ViewChild('chatHistory', { static: false }) buttonOpenChatHistory!: ElementRef;

  action_1:any;
  action_2:any;
  action_3:any;
  action_4:any;

 displayChatHistory='none';
 displaySettingAcction='none';
 displayPersionalInformation='none';
 PersionalInformation :any = {};
 active=false;

 messageHistoryChat:number=0;
  async Logout() {
    localStorage.clear();
   await this.ConectSinglRService.stopConnection()
  }


  displayMessager='';
   ngOnInit(): void {
    let userCode= localStorage.getItem('userCode')
    this.HeaderService.getPersionalInformation(userCode)
    this.action_1 = this.HeaderService.PersionalInformation$.subscribe(data => {
      this.PersionalInformation = data;
    }); 

    this.HeaderService.ListMessageHistory$.subscribe(data=>{
      let cout = 0
      for(let i=0;i<data.length;i++){
        if(data[i].status==false){
          cout =cout + 1;
        }
      }
      this.messageHistoryChat=cout
      this.cdr.detectChanges()
    })

    this.ChatBoxService.onMessageReceived( async (GroupChatId, Contents,UserCode,ListFile) => {
      let data = await this.HeaderService.getHistoryChatApi()
      let cout=0
      for(let i=0;i<data.length;i++){
        if(data[i].status==false){
          cout = cout +1;
        }
      }
      this.messageHistoryChat=cout;
    })

    let currentRoute = this.getRoute.snapshot.url.map(seg => seg.path).join('/');
    console.log('Current Route:', currentRoute);

    if (currentRoute === 'messages') {
      this.displayMessager = 'none';
      this.cdr.detectChanges();
    }
  }

  async ngAfterViewInit()  {

    // Các phần tử đã được khởi tạo ở đây
    this.HeaderService.getHistoryChat()
    this.action_2 = this.HeaderService.ActionCloseHistoryMessage$.subscribe(()=>{
      this.closeChatHistory();
      
    })

    this.action_3 = this.HeaderService.ActionOpenPersionalInformation$.subscribe(()=>{
      this.openPersionalInformation();
      this.closeSettingAccount();
    })

    this.action_4 = this.HeaderService.ActionClosePersionalInformation$.subscribe(()=>{
      this.displayPersionalInformation='none'
    })
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    if (this.chatHistory && !this.chatHistory.contains(clickedElement) && !this.buttonOpenChatHistory.nativeElement.contains(clickedElement) ) {
      this.closeChatHistory()
    }
    if (this.settingAccount && !this.settingAccount.contains(clickedElement) && !this.buttonOpenSettingAccount.nativeElement.contains(clickedElement) ) {
      this.displaySettingAcction = 'none';
    }
  }


  closeChatHistory(){
      this.displayChatHistory='none';
      this.active=false
  }
  openChatHistory(){
    if( this.displayChatHistory=='none'){
      this.displayChatHistory='';
      this.HeaderService.getHistoryChat();
      this.active=true
    
    }
    else{
      this.displayChatHistory='none';
      this.active=false
    } 
  }
  openSettingAccount(){
    this.displaySettingAcction= this.displaySettingAcction === 'none' ? '' : 'none';
  }
  closeSettingAccount(){
    this.displaySettingAcction='none';
  }
  openPersionalInformation(){
    // this.displayPersionalInformation='';
    this.displayPersionalInformation= this.displayPersionalInformation === 'none' ? '' : 'none';
  }
  ngOnDestroy(): void {
    if (this.action_1) {
      this.action_1.unsubscribe();
    }
    if (this.action_2) {
      this.action_2.unsubscribe();
    }
    if (this.action_3) {
      this.action_3.unsubscribe();
    }
    if (this.action_4) {
      this.action_4.unsubscribe();
    }
  }
}
