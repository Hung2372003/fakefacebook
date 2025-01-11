import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit,ChangeDetectionStrategy } from '@angular/core';
import { HeaderService } from '../header.service';
import { CallApiService } from '../../../Service/call-api.service';
import { Router } from '@angular/router';
import { ComeChatService } from '../../../Service/come-chat.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-persional-information',
    standalone: true,
    imports: [CommonModule,FormsModule],
    templateUrl: './persional-information.component.html',
    styleUrl: './persional-information.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersionalInformationComponent implements AfterViewInit , OnInit{
  constructor(
    private HeaderService:HeaderService,
    private CallApiService:CallApiService,
    private cdr: ChangeDetectorRef,
    private router:Router,
    private ComeChatService:ComeChatService
  ){}


  avatarUrl:string="url('/assets/img/cta-bg.jpg') center/cover";
  backgroundUrl:string="url('/assets/img/cta-bg.jpg') center/cover";
  public persionalInfor:any
  selfCode:any

  displayProfile=false
  displayUpdateInfor='none'

  updateName=''
  updateAddress=''
  ngOnInit(): void {
      this.selfCode=localStorage.getItem('userCode')
  }
  ngAfterViewInit():void {
      this.HeaderService.ActionOpenPersionalInformation$.subscribe( async (data)=>{
        this.persionalInfor=await this.getInfor(data);
        this.updateName=this.persionalInfor.name;
        this.updateAddress=this.persionalInfor.address;
        this.backInofor();
        this.cdr.detectChanges();
        console.log(this.persionalInfor?.avatar);
      })
  }
  close(){
    this.HeaderService.closePersionalInformation();

  }

  async getInfor(userCode:number){
    const data = await this.CallApiService.CallApi('PersonalAction/GetPersonalInformation','post',JSON.stringify(userCode))
    return data.object
  }

  decode(a:string){
    return decodeURIComponent(a)
  }

  unRequestFriend(){
    this.CallApiService.CallApi('PersonalAction/Unfriend','post',JSON.stringify( this.persionalInfor.id));
    this.close()
  }

  openChat(GroupChatId:any,ListUserChat:any,GroupAvatar:string,Name:string){
    this.ComeChatService.OpenChatBox(GroupChatId,ListUserChat,GroupAvatar,Name);
    this.close()
  }
  openUpdateInfor(){
    this.displayProfile=true;
    this.displayUpdateInfor=''
  }

  backInofor(){
    this.displayProfile=false;
    this.displayUpdateInfor='none'
  }

  public previewUrl: string | ArrayBuffer | null=null ;
  selectedFile: File | null = null;
  onAvatarGroupChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = null;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        console.log('FileReader onload triggered:', e);
        this.previewUrl = reader.result as string; // Lưu URL của ảnh
        console.log('Preview URL:', this.previewUrl);
        this.cdr.detectChanges();
        if (input) {
          input.value = ''; // Reset nội dung input file
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  async updateInfor(){
    const data=new FormData()
    data.append('Name',this.updateName)
    data.append('Avatar',this.updateAddress)
    if(this.selectedFile){
      data.append('Avatar',this.selectedFile)
    }

   this.persionalInfor= await (await this.CallApiService.CallApi('PersonalAction/UpdatePersonalInfor','post',data)).object;
    this.HeaderService._PersionalInformation.next(this.persionalInfor);
    this.close();
  }
  encodeURIImg(img:string){
    return encodeURI(img)
  }
}
