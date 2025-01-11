import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HomeMainService } from '../../Service/home-main.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-comment',
    standalone: true,
    imports: [CommonModule, NgFor, NgIf, FormsModule],
    templateUrl: './comment.component.html',
    styleUrl: './comment.component.scss'
})
export class CommentComponent implements AfterViewInit {
  constructor(
    private HomeMainService:HomeMainService,
    private cdr:ChangeDetectorRef
  ){}

  postName:string='';
  avatarSelf:string=''
  content:string='';
  postId:number=0
  listComment:Array<any>=[]
  ngAfterViewInit(): void {
      this.HomeMainService.PostId$.subscribe(async data=>{
        this.postName=data.name;
        this.postId=data.postId;
        this.avatarSelf=data.avatarSelf
        this.listComment= await this.HomeMainService.getCommentOfPost(data.postId);
        this.cdr.detectChanges();
      })
  }
  setDate(date:string){
    return this.HomeMainService.setDate(date);
  }
  closePostComment(){
    this.HomeMainService.closePostComment();
  }
  async createComment(){
    if(this.content==''){
      return
    }
    const newComment= await this.HomeMainService.createComment( this.postId,this.content)
    this.listComment.push(newComment)
    this.content==''
    this.cdr.detectChanges();
  }
}
