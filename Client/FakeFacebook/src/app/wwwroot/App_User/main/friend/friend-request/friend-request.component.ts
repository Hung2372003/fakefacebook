import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CallApiService } from '../../../../Service/call-api.service';
import { HeaderService } from '../../../header/header.service';

@Component({
    selector: 'app-friend-request',
    standalone: true,
    imports: [NgFor, NgIf, CommonModule],
    templateUrl: './friend-request.component.html',
    styleUrl: './friend-request.component.scss'
})
export class FriendRequestComponent implements OnInit{

  constructor(
    private CallApiService:CallApiService,
    private cdr:ChangeDetectorRef,
    private HeaderService:HeaderService
  ){}
  listRequestFriend:any
  async ngOnInit(): Promise<void> {
    await this.getListRequestFriend();
      
  }
  async getListRequestFriend(){
    this.listRequestFriend=await this.CallApiService.CallApi('PersonalAction/ListFrendRequest','get',null);
    this.cdr.detectChanges();
  }
  async FriendAccept(id:number){
    await this.CallApiService.CallApi('PersonalAction/FriendAccept','post',JSON.stringify(id))
    await this.getListRequestFriend();
   
  }
  async unFriend(id:number){
    await this.CallApiService.CallApi('PersonalAction/Unfriend','post',JSON.stringify(id))
    await this.getListRequestFriend()
    this.cdr.detectChanges();
  }

  OpenInfor(userCode:any){
    this.HeaderService.openPersionalInformation(userCode);
  }
}
