import { Component } from '@angular/core';
import { MenuComponent } from "../friend/menu/menu.component";
import { RouterOutlet } from '@angular/router';
import { HeaderService } from '../../header/header.service';

@Component({
    selector: 'app-friend',
    standalone:true,
    imports: [MenuComponent, RouterOutlet],
    templateUrl: './friend.component.html',
    styleUrl: './friend.component.scss'
})
export class FriendComponent {
  constructor(
    private HeaderService:HeaderService
  ){}
  OpenInfor(id:any){
    this.HeaderService.openPersionalInformation(id);
  }
}
