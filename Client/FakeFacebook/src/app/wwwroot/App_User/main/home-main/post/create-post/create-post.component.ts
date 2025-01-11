import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { HomeMainService } from '../../Service/home-main.service';
import { CreateFilePostComponent } from "../create-file-post/create-file-post.component";
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-create-post',
    standalone: true,
    imports: [CreateFilePostComponent, CommonModule, FormsModule],
    templateUrl: './create-post.component.html',
    styleUrl: './create-post.component.scss'
})
export class CreatePostComponent implements AfterViewInit {

  constructor(
    private HomeMainService:HomeMainService,
    private cdr:ChangeDetectorRef
  ){}
  infor:{
    avatar:string,
    name:string
  }={avatar:'',name:''};

  selectedVisibility: string = 'PUBLIC';
  listFile:Array<File>=[];
  content:string=''
   ngAfterViewInit(): void{
      this.HomeMainService.InforCreatePost$.subscribe(data=>{
        this.infor=data;
        this.cdr.detectChanges();
      })
      this.HomeMainService.DataPost$.subscribe(async(data)=>{
        this.listFile=data.listFile;
        if(data.content!=''||data.listFile.length>0){
          await this.HomeMainService.createPost(this.listFile,data.content,this.selectedVisibility)
        }
        
      })
  }
  closeCreatePost(){
    this.HomeMainService.closeCreatePost();
  }
  async createPost(){
    this.HomeMainService.getDataPost();  
  }
}
