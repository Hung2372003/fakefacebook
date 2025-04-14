import { AfterViewInit, ChangeDetectorRef, Component ,ViewChild,ElementRef,ChangeDetectionStrategy } from '@angular/core';
import { NgbCarouselConfig, NgbCarouselModule ,NgbCarousel,NgbSlideEvent} from '@ng-bootstrap/ng-bootstrap';
import { HomeMainService } from '../main/home-main/Service/home-main.service';
import { CommonModule, NgFor} from '@angular/common';
@Component({
  selector: 'app-view-image',
  standalone: true,
  imports: [NgbCarouselModule,NgFor,CommonModule],
  templateUrl: './view-image.component.html',
  styleUrl: './view-image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewImageComponent implements AfterViewInit{

  constructor(
    config: NgbCarouselConfig,
    private HomeMainService :HomeMainService ,
    private cdr:ChangeDetectorRef
  ) {
		// customize default values of carousels used by this component tree
		config.interval =999999;
		config.wrap = true;
		config.keyboard = false;
		config.pauseOnHover = false;
    config.animation=false;
    config.showNavigationIndicators=false
	}

  @ViewChild('carousel', { static: true }) carousel!: NgbCarousel;
  @ViewChild('carouselIndicators') carouselIndicators!: ElementRef;
  listImage:Array<any>=[]
  activeSlideId=''
  ngAfterViewInit(): void {
      this.HomeMainService.fIleData$.subscribe(async data=>{
        if(data.listFile.length>0){
          this.listImage=data.listFile
          this.activeSlideId = await data.fileId.toString();  
          this.cdr.detectChanges();    
          this.activeSrcollCarouselIndicators(data.fileId.toString())        
        }
        this.cdr.detectChanges();
       
      }) 
  }
  closeViewFile(){
    this.listImage=[];
    this.cdr.detectChanges()
    this.HomeMainService.closeViewFilePost()
  }
  onSlideChange(event: NgbSlideEvent){
    this.activeSrcollCarouselIndicators(event.current)
  }

  activeSrcollCarouselIndicators(fileId:string){
    const index = this.listImage.findIndex(item => item.id.toString() == fileId);
    const scoll= this.carouselIndicators.nativeElement as HTMLElement
    if(index>1){
      const scrollAmount = (0.11*window.innerHeight) * (index);
      scoll.scrollLeft=scrollAmount;
      // scoll.scrollBy({ left:scrollAmount, behavior: 'smooth' });
    }
    if(index<=1){
      scoll.scrollLeft=0;
    }
  }


}
