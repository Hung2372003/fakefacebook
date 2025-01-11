import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CallApiService } from '../../../../Service/call-api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { NullLogger } from '@microsoft/signalr';
import { HubConnectionState  } from '@microsoft/signalr';
import { ConectSinglRService } from '../../../../Service/conect-singl-r.service';
@Injectable({
  providedIn: 'root'
})
export class HomeMainService {
  constructor(
    private http:HttpClient,
    private CallApiServices:CallApiService,
    private ConectSinglRService:ConectSinglRService
  ) { }

    private _InforCreatePost = new BehaviorSubject<{
      avatar:string,
      name:string
    }>({avatar:'',name:''});
    InforCreatePost$=this._InforCreatePost.asObservable();

    private _Close = new BehaviorSubject<void>(undefined);
    Close$=this._Close.asObservable();

    private _GetDataPost=new BehaviorSubject<void>(undefined);
    getDataPost$=this._GetDataPost.asObservable();

    private _DataPost= new BehaviorSubject<{
      listFile:Array<File>,
      content:string
    }>({listFile:[],content:''})
    DataPost$=this._DataPost.asObservable();

    private _PostId=new BehaviorSubject<{
      name:string,
      postId:number,
      avatarSelf:string
    }>({name:'',postId:Number(null),avatarSelf:''});
    PostId$=this._PostId.asObservable();

    private _ClosePostCommentButton=new BehaviorSubject<void>(undefined);
    closePostCommentButton$=this._ClosePostCommentButton.asObservable()

    private _FileData=new BehaviorSubject<{
      fileId:number,
      listFile:Array<any>
    }>({fileId:Number(null),listFile:[]});
    fIleData$=this._FileData.asObservable()

    private _CloseViewFileButton=new BehaviorSubject<void>(undefined);
    closeViewFileButton$=this._CloseViewFileButton.asObservable()

  async GetListFriend(){ 
    return await this.CallApiServices.CallApi('ContactUser/ListFrends', 'get', null)
  }
  openCreatePost(avatar:string,name:string){
    this._InforCreatePost.next({avatar:avatar,name:name});
  }
  closeCreatePost(){
    this._Close.next();
  }
  getDataPost(){
    this._GetDataPost.next();
  }
  sendDatapost(listFile:Array<File>,content:string){
    this._DataPost.next({listFile:listFile,content:content});
  }
  openPostComment(id:number,name:string,avatarSelf:string){
    this._PostId.next({name:name,postId:id,avatarSelf:avatarSelf});
  }
  createPost(listFile:Array<File>,content:string,status:string){
    const data=new FormData();
    for(let i=0;i<listFile.length;i++){
      data.append('Files',listFile[i]);
    }
    data.append('Content',content);
    data.append('Status',status)
    return this.CallApiServices.CallApi('PostManagement/AddNewPost','post',data)
  }
  async getPost(){
    const data= await this.CallApiServices.CallApi('PostManagement/GetPost','get',null)
    console.log(data);
    return data.object
  }
  async getCommentOfPost(id:number){
    const data = await this.CallApiServices.CallApi('PostManagement/GetPostComment','post',JSON.stringify(id))
    return data.object
  }
  async createComment(postId:number,content:string){
    const data =await this.CallApiServices.CallApi('PostManagement/AddComment','post',{PostCode:postId,Content:content})
    return data.object
  }
  closePostComment(){
    this._ClosePostCommentButton.next();
  }
  openViewFile(fileId:number, listFile:Array<any>){
    this._FileData.next({fileId:fileId,listFile:listFile})
  }
  closeViewFilePost(){
    this._CloseViewFileButton.next()
  }

  setLikeStatus(id:number){
    this.CallApiServices.CallApi('PostManagement/FeelPost','post',JSON.stringify(id))
  }

   async sendLikeStatus( postId:number,like:boolean) {
      if (this.ConectSinglRService.hubConnection.state === HubConnectionState.Connected) {
        try {
          await this.ConectSinglRService.hubConnection.invoke("SendLikeStatus", postId, like);
          console.log("Gửi like  thành công");
        } catch (err) {
          console.error("Lỗi gửi like nhắn:", err);
        }
      } else {
        console.warn("Kết nối không ở trạng thái 'Đã kết nối'.");
      }
    }

    onLikeStatusReceived(callback: (postId:number,like:boolean) => void) {  
      this.ConectSinglRService.hubConnection.on("ReceiveLikeStatus", callback );
    }
  setDate(timeData:string){
    let time =new Date(timeData);
    let timeNow=new Date();

    let differenceInMilliseconds = Math.abs(time.getTime() - timeNow.getTime());
    let differenceInSeconds = differenceInMilliseconds / 1000;
    let differenceInMinutes = Math.round(differenceInSeconds / 60);
    let differenceInHour = Math.round(differenceInMinutes / 60);
    let differenceInDay =Math.round(differenceInHour / 24);


    if(differenceInSeconds<10){
      return "vừa xong"
    }
    else if(differenceInMinutes < 60){
      return differenceInMinutes.toString()+" phút"
    }
    else if(differenceInHour<24){
      return differenceInHour.toString()+" giờ"
    }
    else if(differenceInDay<7){
       return differenceInDay.toString() +" ngày"
    }
    else 
    return time.getDate()+'/'+time.getMonth()+'/'+time.getFullYear()
  }


}
