import { AfterViewInit, ChangeDetectorRef, Component, OnInit,ChangeDetectionStrategy } from '@angular/core';
import { HeaderService } from '../../../header/header.service';
import { CreatePostComponent } from "./create-post/create-post.component";
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HomeMainService } from '../Service/home-main.service';
import { CommentComponent } from "./comment/comment.component";

@Component({
    selector: 'app-post',
    standalone: true,
    imports: [CreatePostComponent, CommonModule, NgFor, NgIf, CommentComponent],
    templateUrl: './post.component.html',
    styleUrl: './post.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostComponent implements OnInit,AfterViewInit {
  constructor(
    private HeaderService:HeaderService,
    private HomeMainService:HomeMainService,
    private cdr:ChangeDetectorRef,

  ){}

  displayCreatePost='none';
  displayPostComment='none';
  PersionalInformation:any;
  listPost:any;
  async ngOnInit(): Promise<void> {
    this.HeaderService.PersionalInformation$.subscribe(data => {
      this.PersionalInformation = data;
    }); 
    this.listPost=await this.HomeMainService.getPost();
    this.HomeMainService.closePostCommentButton$.subscribe(()=>{
      this.displayPostComment='none'

    })
    this.HomeMainService.onLikeStatusReceived((PostId,Like)=>{
      console.log(PostId)
      for(let i=0;i<this.listPost.length;i++){
        if(this.listPost[i].id==PostId){
          this.listPost[i].like= Like
          if( this.listPost[i].like==true)  {
            this.listPost[i].likeNumber=this.listPost[i].likeNumber+1
          } else
          {
            this.listPost[i].likeNumber=this.listPost[i].likeNumber-1
          }
          break;
        }
      }
      this.cdr.detectChanges();
    })
    this.cdr.detectChanges();
  }
  ngAfterViewInit(): void {
      this.HomeMainService.Close$.subscribe(()=>{
         this.displayCreatePost='none'
      })
  }
  openCreatePost(avatar:string,name:string){
    this.HomeMainService.openCreatePost(avatar,name);
    this.displayCreatePost=''
  }
  openComment(id:number,name:string){
    this.displayPostComment=''
    this.HomeMainService.openPostComment(id,name,this.PersionalInformation.avatar);
  }
  setDate(date:string){
    return this.HomeMainService.setDate(date);
  }

  openViewFile(fileId:number,postId:number,listFile:Array<any>){
   this.HomeMainService.openViewFile(fileId,listFile)
  }
  setLikeStatus(id:number){
    for(let i=0;i<this.listPost.length;i++){
      if(this.listPost[i].id==id){
        this.HomeMainService.sendLikeStatus(this.listPost[i].id, !this.listPost[i].like)
        break;
      }
    }
    this.HomeMainService.setLikeStatus(id)
    // this.listPost = [...this.listPost];
    this.cdr.detectChanges();
  }
}
