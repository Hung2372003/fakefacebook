import { CommonModule } from '@angular/common';
import { Component, OnInit,ElementRef } from '@angular/core';
import { ConectSinglRService } from '../../../Service/conect-singl-r.service';
import { Router } from '@angular/router';
import { HeaderService } from '../header.service';


@Component({
    selector: 'app-setting-accout',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './setting-accout.component.html',
    styleUrl: './setting-accout.component.scss'
})
export class SettingAccoutComponent implements OnInit{
  constructor(
    private ConectSinglRService:ConectSinglRService,
    private router:Router,
    private HeaderService: HeaderService,
    private el: ElementRef
  ){}
   contains(target: HTMLElement): boolean {
      return this.el.nativeElement.contains(target);
    }
    
  PersionalInformation:any={};


  ngOnInit(): void {
    let userCode=localStorage.getItem('userCode');
    this.HeaderService.getPersionalInformation(userCode)
    this.HeaderService.PersionalInformation$.subscribe(data => {
      this.PersionalInformation = data;
    });
  }

  openPersionalInformation(){
    this.HeaderService.openPersionalInformation(this.PersionalInformation.id);
  }
  async Logout() {
    localStorage.clear();
    await this.ConectSinglRService.stopConnection()
    this.router.navigate(['']);
   }
}
