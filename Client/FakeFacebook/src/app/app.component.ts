import { Component, OnInit,Inject,PLATFORM_ID, AfterViewInit,OnDestroy  } from '@angular/core';
import {Router, RouterModule, RouterOutlet, NavigationEnd,NavigationStart } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';



declare var $: any;
// declare var initSwiper: () => void;

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterModule, CommonModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent implements  OnInit, AfterViewInit {
  title = 'FackFacebook';
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        localStorage.setItem('lastRoute', event.url);
      }
    });
  }


 isLoading: boolean = false;
 const =this.load()
 private load(){
  if (isPlatformBrowser(this.platformId)) {
    this.router.events.subscribe(event => {     
      if (event instanceof NavigationStart ) {
        this.addLoadBody();
      }
    })}
    return true
  };
  
 ListUserOnline : Array<string>=[]
  ngOnInit(): void {
  
    if (isPlatformBrowser(this.platformId)) {
      var element=document.querySelector('#preloader')
      this.router.events.subscribe(event => {   
        if (event instanceof NavigationStart && !element) {
          this.isLoading=true;
          this.addLoadBody();
          element=document.querySelector('#preloader')
        } 
        if (event instanceof NavigationEnd && element) {
          this.isLoading=false;
          this.cdr.detectChanges();
          element.remove();
        } 
      });
    }

   
  }

  private addLoadBody(): void {
    const div = document.createElement('div');
    div.id = 'preloader'; 
    document.body.appendChild(div);
  }

  ngAfterViewInit(): void {
    this.router.events.subscribe(event => {   
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          if (isPlatformBrowser(this.platformId)) {
          }
        });
        
      } 
    });
 
  }
  openModal(): void {
    $('#exampleModal').modal('show'); // Hiển thị modal
  }
  private removeScritp(url:string):void{
    document.querySelector(`script[src="${url}"]`)?.remove();
  }
   private AddScritp(url:string):void {
    document.querySelector(`script[src="${url}"]`)?.remove();
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    document.body.appendChild(script);
  }
}