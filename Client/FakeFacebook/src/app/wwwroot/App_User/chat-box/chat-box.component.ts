import { Component, ElementRef, HostListener, ViewChild,OnInit, OnDestroy,ViewChildren,QueryList, AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';
import { ComeChatService } from '../../Service/come-chat.service';
import { Subscription } from 'rxjs';
import { ChatBoxService } from './chat-box.service';
import { FormsModule } from '@angular/forms';
import { ConectSinglRService } from '../../Service/conect-singl-r.service';
import { Renderer2 } from '@angular/core';
import { HeaderService } from '../header/header.service';
import { ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-chat-box',
    standalone: true,
    imports: [CommonModule, FormsModule, NgFor, NgIf],
    templateUrl: './chat-box.component.html',
    styleUrl: './chat-box.component.scss',
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0 }), // Khi vào
                animate('0.3s ease', style({ opacity: 1 })) // Hiện mượt mà
            ]),
            transition(':leave', [
                animate('0.3s ease', style({ opacity: 0 })) // Ẩn mượt mà
            ])
        ])
    ]
})
export class ChatBoxComponent  implements  AfterViewInit, OnInit  {
  constructor(
    private OpenChat:ComeChatService,
    private ChatBoxService : ChatBoxService,
    private cdr: ChangeDetectorRef,
    private ConectSinglRServices:ConectSinglRService,
    private renderer: Renderer2,
    private HeaderService:HeaderService,
    private getRoute: ActivatedRoute
 
  ){}

  @ViewChild('avatar') avartarframe!: ElementRef;
  @ViewChildren('frameChat') framechat!: QueryList<ElementRef>;
  @ViewChild('frameChat') frameChangeModColor!: ElementRef;
  @ViewChild('actioninputmess') actioninputmess!: ElementRef;
  @ViewChild('actioninputmesslist') actioninputmesslist!: ElementRef;
    //------------------------------------------------
  public selfCode:number = 0
  //danh sách nhóm chat/user chat hiện có
  ListFrame: Array<{
    GroupChatId: any,
    Name: string,
    Avatar:string ,
    UserChat:Array<any>,
    GroupDouble:boolean,
  }> =[]

  //tin nhắn
  public messages ={
    GroupChatId:'',
    Contents:'',
    UserCode:'',
    ListFile:[],
  }

  listMessages: Array<{
    GroupChatId:string,
    CreatedTime:any,
    Contents:string,
    UserCode:number,
    ListFile:any
  }> =[]
  ListUserOnline : Array<string>=[]
  ListUserChat:Array<{
    UserCode:any,
    Name:string,
    Avatar:string,
  }>=[]

  isHome=true

  ngOnInit() {
    if(this.getRoute.snapshot.url.join('/')=='messages'){
      this.isHome=false

    } 
    this.selfCode=Number(localStorage.getItem('userCode'))
    //nhận tin nhắn
    this.ChatBoxService.onMessageReceived((GroupChatId, Contents,UserCode,ListFile) => {
        // this.messages.push({ GroupChatId, message });
        this.listMessages.push({
          GroupChatId: GroupChatId,
          CreatedTime: new Date(),
          Contents:Contents,
          UserCode:Number(UserCode),
          ListFile:ListFile.object,
        })
        this.cdr.detectChanges();
        this.scrollToBottom(GroupChatId);
        this.HeaderService.getHistoryChat()
    });
    

    this.getListUserOnline((ListUser)=>{
      console.log('danh sách từ SignalR:', ListUser);
      this.ListUserOnline=ListUser;
    })
  }

   // bát sự kiện mở chát tại người liên hệ : component {home-main/ContactUser -> ComeChatService}
   private buttonClickSubscription!: Subscription;
   ngAfterViewInit(){
     this.buttonClickSubscription =  this.OpenChat.buttonClicked$.subscribe( async (data): Promise<void> =>{ 
       for(let i=0;i<data.ListUser.length;i++){
         if(!this.ListUserChat.find(user => user.UserCode.toString() == data.ListUser[i].userCode.toString())||this.ListUserChat.length==0){
           this.ListUserChat.push({UserCode:data.ListUser[i].userCode,Name:data.ListUser[i].name,Avatar:data.ListUser[i].avatar})
         }
       }
      
  
       for (const frame of this.ListFrame) {
         if(frame.GroupChatId==data.GroupChatId){             
           this.joinGroup(frame.GroupChatId.toString());   
           return this.showFrame(frame.GroupChatId);                    
         }
 
         if(frame.UserChat[0].userCode==data.ListUser[0].userCode && data.ListUser.length==1){             
           this.joinGroup(frame.GroupChatId.toString());   
           return this.showFrame(frame.GroupChatId);                    
         }
       };
       var ReponsData:any
       if(data.ListUser.length==1){
         ReponsData = await this.ChatBoxService.Create_WindowChat({userCode :data.ListUser[0].userCode,GroupChatId:data.GroupChatId})
       }else{
         ReponsData = await this.ChatBoxService.Create_WindowChat({userCode :null,GroupChatId:data.GroupChatId})
       }
      
       // ReponsData.object.
       if(ReponsData.title=='NotMess'){
 
         this.ListFrame.push({ GroupChatId: ReponsData.object.groupChatId,
                               Name: data.Name,
                               Avatar: data.GroupAvatar,
                               UserChat: data.ListUser ,
                               GroupDouble:ReponsData.object.groupDouble
                             });
         
         // this.ListUserChat.push()
         this.cdr.detectChanges();
         this.joinGroup(ReponsData.object.groupChatId.toString());   
         return this.showFrame(ReponsData.object.groupChatId); 
       }
       else if(ReponsData.title=='MessOk'){
         this.ListFrame.push({ GroupChatId: ReponsData.preventiveObject.groupChatId,
                               Name: data.Name, Avatar: data.GroupAvatar,
                               UserChat:data.ListUser,
                               GroupDouble:ReponsData.preventiveObject.groupDouble
                             });
 
         for(let i=0; i<ReponsData.object.length; i++){
           this.listMessages.push({
             GroupChatId:ReponsData.preventiveObject.groupChatId,
             CreatedTime:ReponsData.object[i].createdTime,
             Contents:ReponsData.object[i].content,
             UserCode:ReponsData.object[i].createdBy,
             ListFile:ReponsData.object[i].listFile,
           })
           this.cdr.detectChanges();
         }       
        
         this.scrollToBottom(ReponsData.preventiveObject.groupChatId)
         this.joinGroup(ReponsData.preventiveObject.groupChatId.toString());  
         return this.showFrame(ReponsData.preventiveObject.groupChatId);

       } 
       else{
         alert(ReponsData.title)
       }  
     });
     
   }
  // chọn khung chat : thay đổi views
  selecterFrame(GroupChatId:any){
    this.ChatBoxService.setStatusMess(Number(GroupChatId))
    const targetFrame = this.frameChangeModColor.nativeElement.querySelector(`[data-frame-groupchatid="${GroupChatId}"]`);
    const targetFrameI= targetFrame.querySelectorAll('i')  as NodeListOf<HTMLElement>;
    const targetFrameSetContent=targetFrame?.querySelectorAll('.setup-contents') as NodeListOf<HTMLElement>;
    for(let i=0 ; i < targetFrameI.length ; i++){
      targetFrameI[i].style.color='#0866ff'
    }
    for(let i=0 ; i < targetFrameSetContent.length ; i++){
      targetFrameSetContent[i].querySelectorAll('i').forEach(a =>{
        a.style.color='';
      })
    }
    (targetFrame as HTMLElement).classList.add('activeFrame')
  }

  //click ra ngoài khung chat : thay đổi views
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInsideAll = this.frameChangeModColor.nativeElement.querySelectorAll(`[id^='frame-']`)  as NodeListOf<HTMLElement>;
    const clickedInsideInputMessCheck=  this.frameChangeModColor.nativeElement.querySelectorAll('.action-inputmess-div')  as NodeListOf<HTMLElement>;
    clickedInsideInputMessCheck.forEach(x=>{
      const check=x.querySelector(`[id^='action-inputmess-']`) as HTMLElement
      const af=(event.target as HTMLElement)
      if(check.classList.contains('action-inputmess-hover') && !x.contains(af)){
        check.classList.remove('action-inputmess-hover');
        check.classList.add('action-inputmess');
      }

    })

    if(clickedInsideAll.length>0){
      clickedInsideAll.forEach(x=>{
        if(!x.contains(event.target as HTMLElement)){
          x.querySelectorAll('i').forEach(y=>{
            y.style.color='';
          })
          x.classList.remove('activeFrame')
        }
      })
    }
  }
  public mess='';
  // Nhận biết sự thay đổi của input : thay đổi views
  onInputChange(event: Event,GroupChatId:any): void {
    const inputElement = event.target as HTMLInputElement;
    const lineHeight = parseInt(window.getComputedStyle(inputElement).lineHeight, 10);
    const targetFrame = this.frameChangeModColor.nativeElement.querySelector('#frame-' + GroupChatId) as HTMLElement
    if(inputElement.value!=''){
      this.mess=inputElement.value;
      (targetFrame.querySelector('.action-inputmess-div') as HTMLElement).style.width='36px';    
      (targetFrame.querySelector('.action-inputmess-list') as HTMLElement).style.display='flex';
      if( Math.floor(inputElement.scrollHeight / lineHeight)<2){ 
        inputElement.style.height = 'auto';
        inputElement.style.height='36px';
        return
      }
      inputElement.style.height = 'auto';
      inputElement.style.height=`${inputElement.scrollHeight}px`
    }else{
        inputElement.style.height = 'auto'; 
        inputElement.style.height='';
        if(this.ListFile.length!=0){
          return
        }
        (targetFrame.querySelector('.action-inputmess-list') as HTMLElement).style.display='none';
        (targetFrame.querySelector('.action-inputmess-div') as HTMLElement).style.width='90%';
    }
  }

  // nhấn phím anter
  simulateEnter(GroupChatId:any): void {
    var inputElement= document.querySelector('textarea#input-'+GroupChatId.toString())
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13, // Mã phím Enter
      bubbles: true,
      cancelable: true,
    });
    inputElement?.dispatchEvent(event)
  }

  //Hiển thị các thao tác mở rộng của tin nhắn : thay đổi views
  openInputMessList(GroupChatId:any){
    const targetFrame = this.frameChangeModColor.nativeElement.querySelector('#frame-' + GroupChatId) as HTMLElement
    const actionInputMess=targetFrame.querySelector('#action-inputmess-'+GroupChatId) as HTMLElement;
    (targetFrame.querySelector('.send-mess') as HTMLElement).style.overflow='visible'
    actionInputMess.classList.remove('action-inputmess');
    actionInputMess.classList.add('action-inputmess-hover')
    actionInputMess.style.display='flex';
  } 

  //---------------------------------------

  //mở chat : thay đổi views
  showFrame(GroupChatId:string){
    const targetFrame = this.frameChangeModColor.nativeElement.querySelector('#frame-'+GroupChatId ) as HTMLElement
    targetFrame.style.display='flex';
    const targetAvatar= this.avartarframe.nativeElement.querySelector('#avatar-'+GroupChatId) as HTMLElement
    targetAvatar.style.display='none';
  }
  //ẩn chát : thay đổi views
  hideFrame(GroupChatId:string){
    const targetFrame = this.frameChangeModColor.nativeElement.querySelector('#frame-'+GroupChatId ) as HTMLElement
    targetFrame.style.display='none';
    const targetAvatar= this.avartarframe.nativeElement.querySelector('#avatar-'+GroupChatId) as HTMLElement
    targetAvatar.style.display='block';
  }
  //đóng chat : thay đổi views
  closeFrame(GroupChatId:any){
    
    this.ListFrame = this.ListFrame.filter(
      frame => frame.GroupChatId.toString() != GroupChatId.toString()
    );
    this.listMessages = this.listMessages.filter(
      message => message.GroupChatId.toString() != GroupChatId.toString()
    );

    this.leaveGroup(GroupChatId.toString());
    }
    //ẩn hiện nút đóng chat avatar : thay đổi views
    isHovered = false;
    onHover(state:boolean){
      this.isHovered = state;
  }
  //-------------------------------------------------

 
  checkAvatar(userCode:number){
    var Avatar=''
    this.ListUserChat.forEach(x=>{
      if(x.UserCode==userCode){
        Avatar= x.Avatar;
      }
    })
    return Avatar
  }

  checkName(userCode:number){
    var name='Người dùng'
    this.ListUserChat.forEach(x=>{
      if(x.UserCode==userCode){
        name= x.Name;
      }
    })
    return name

  }

  checkOnline(listUserOnline:Array<any>,ListFrame:Array<any>){
    var check=false
    listUserOnline.forEach(x=>{
      ListFrame.forEach(y=>{
        if(x==y.userCode && x!=this.selfCode){
           check=true;
        }
      })
    })
    return check

  }
  //-----------------------------------------------------

   scrollToBottom(groupChatId: string): void {
    const mainBox = document.querySelector('#main-box-' + groupChatId);
    if (mainBox) {
      mainBox.scrollTop = mainBox.scrollHeight;
    }
  }

  //lấy dah sách useronline
  getListUserOnline(callback: (UserCode: any) => void) {
    return this.ConectSinglRServices.hubConnection.on("ListUserOnline", callback);  
  }
  //kết nối groupchat
  async joinGroup(GroupChatId:string) {
      return await this.ChatBoxService.joinGroup(GroupChatId);
  }

  //thoát groupchat
  leaveGroup(GroupChatId:string) {
    return  this.ChatBoxService.leaveGroup(GroupChatId);
  }
  //---------------------------------------------------

  // cái đặt gửi tin nhắn
  onKeyDown(event: KeyboardEvent,GroupChatId:any): void {
    //  Shift + Enter xuống dòng
    const targetFrame = this.frameChangeModColor.nativeElement.querySelector('#frame-' + GroupChatId) as HTMLElement
    const textarea = event.target as HTMLTextAreaElement;
    if (event.shiftKey && event.key === 'Enter') {
      event.preventDefault();
      textarea.value += '\n'; // Thêm dòng mới vào nội dung
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`; 
    }

    // Enter  gửi nội dung
    else if (event.key === 'Enter') { 
      event.preventDefault();
      const inputElement = event.target as HTMLInputElement;
      if((textarea.value==''  || textarea.value==null) && this.ListFile.length<1){return console.log('tin nhắn rỗng')}
     
      //-----------------------------------------------------------------
      var listfile:Array<File>=[];
      this.ListFile.forEach(x=>{
        listfile.push(x.file)
      })

      // gửi tin nhắn
      this.ChatBoxService.UpdateMessage({GroupChatId:GroupChatId,Contents:textarea.value?textarea.value:''},listfile)    
      //------------------------------------------------------------------
      inputElement.style.height = 'auto'; 
      inputElement.style.height='';
      (targetFrame.querySelector('.action-inputmess-list') as HTMLElement).style.display='none';
      (targetFrame.querySelector('.action-inputmess-div') as HTMLElement).style.width='90%';
      this.ListFile=[];
      (targetFrame.querySelector('#demofile-'+GroupChatId) as HTMLElement).style.display='none';
      textarea.value='';
      this.ListFile=[];
      this.cdr.detectChanges()
    }
  }
 
  //DEMO FILE
  ListFile: { id:number ;file: File; previewUrl: string | ArrayBuffer | null }[] = [];

  //tải file lên
  onFileSelected(event: Event,GroupChatId:any): void {
    const targetFrame = this.frameChangeModColor.nativeElement.querySelector('#frame-' + GroupChatId) as HTMLElement
    this.ListFile=[];
    const input = event.target as HTMLInputElement;
    if (input.files) {
      (targetFrame.querySelector('#demofile-'+GroupChatId) as HTMLElement).style.display='';
      (targetFrame.querySelector('.action-inputmess-div') as HTMLElement).style.width='36px';    
      (targetFrame.querySelector('.action-inputmess-list') as HTMLElement).style.display='flex';
      const selectedFiles = Array.from(input.files);
      for(let i=0;i<selectedFiles.length;i++){
          const  file=selectedFiles[i];
          const reader = new FileReader();
          reader.onload = () => {
            this.ListFile.push({
              id:i,
              file,
              previewUrl: reader.result
            });
          };
          reader.readAsDataURL(file); // Tạo URL tạm thời cho ảnh
       };
       console.log( this.ListFile)
    } 
    else if(this.ListFile.length<1){
  
      (targetFrame.querySelector('#demofile-'+GroupChatId) as HTMLElement).style.display='none';
      (targetFrame.querySelector('.action-inputmess-list') as HTMLElement).style.display='none';
      (targetFrame.querySelector('.action-inputmess-div') as HTMLElement).style.width='90%';
    }
    input.value='';
    
  }

  // tải thêm file lên
  onAddFileSelected(event:Event,GroupChatId:any){
    const input = event.target as HTMLInputElement;
    const targetFrame = this.frameChangeModColor.nativeElement.querySelector('#frame-' + GroupChatId) as HTMLElement
    if (input.files) {
      const selectedFiles = Array.from(input.files);
      for(let i=0;i<selectedFiles.length;i++){
          var file=selectedFiles[i];
          const reader = new FileReader();
          reader.onload = () => {
            this.ListFile.push({
              id:i,
              file,
              previewUrl: reader.result
            });
          };
          reader.readAsDataURL(file); // Tạo URL tạm thời cho ảnh
      };
      input.value=''
    }
    else{
    }
  }

  //xóa file
  removeFile(id:number,GroupChatId:any){
    for(let i=0;i<this.ListFile.length;i++){
      if(this.ListFile[i].id==id){
        this.ListFile.splice(i,1);
        if(this.ListFile.length==0){
          const targetFrame = this.frameChangeModColor.nativeElement.querySelector('#frame-' + GroupChatId) as HTMLElement;
          (targetFrame.querySelector('#demofile-'+GroupChatId) as HTMLElement).style.display='none';
          if(this.mess!=''){return}
          (targetFrame.querySelector('.action-inputmess-list') as HTMLElement).style.display='none';
          (targetFrame.querySelector('.action-inputmess-div') as HTMLElement).style.width='90%';
          this.cdr.detectChanges()
        }
        return;
      }
    }
  }

  //khoảng thời gian hai tin nhắn 
  setDateMessage(time1:string,time2:string){
    if(!time1&&!time2){
      return false
    }
    let now=new Date();
    let settime1= new Date(time1)
    let settime2=new Date(time2)
    if(!time2){
       settime2=new Date();
    }

   //điều kiện chỉ thêm giờ
   let differenceInMilliseconds = Math.abs(settime1.getTime() - settime2.getTime());
   let differenceInSeconds = differenceInMilliseconds / 1000;
   let differenceInMinutes = Math.round(differenceInSeconds / 60);

   //Điều kiện thêm ngày
   let differenceInDayAddDay = Math.abs(settime1.getDate() - now.getDate());
   let differenceInMonthAddDay =  Math.abs(settime1.getMonth() - now.getMonth());
   let differenceInYearAddDay =  Math.abs(settime1.getFullYear() - now.getFullYear());
    if((differenceInDayAddDay>0 || differenceInMonthAddDay>0 || differenceInYearAddDay>0) && differenceInMinutes>30){
      return 'addDay'
    }else if(differenceInMinutes>30){
      return true
    }
    else {
      return false
    }
  }
  async openViewFile(fileId:number,groupChatId:number){
   this.ChatBoxService.openViewFileChat(fileId,groupChatId)
  }
}
  //------------------------------------------------------

