import { Component, OnInit } from '@angular/core';
import { CallApiService } from '../../../../Service/call-api.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HeaderService } from '../../../header/header.service';

@Component({
    selector: 'app-list-friend',
    standalone: true,
    imports: [CommonModule, NgFor, NgIf],
    templateUrl: './list-friend.component.html',
    styleUrl: './list-friend.component.scss'
})
export class ListFriendComponent implements OnInit{
  constructor(
    private CallApiService: CallApiService,
    private HeaderService:HeaderService
  ){}
  listFriend:any;
  async ngOnInit(): Promise<void> {
    await this.getListFriend();

  }
  async openInfor(id:any){
    this.HeaderService.openPersionalInformation(id);
    await this.getListFriend();
  }
  async getListFriend(){
    this.listFriend= await this.CallApiService.CallApi('ContactUser/ListFrends','get',null);
  }
 
}
