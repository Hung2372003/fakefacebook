import { Injectable, OnInit } from '@angular/core';
import { CallApiService } from '../../Service/call-api.service';
import { HubConnectionState  } from '@microsoft/signalr';
import { ConectSinglRService } from '../../Service/conect-singl-r.service';
import { HomeMainService } from '../main/home-main/Service/home-main.service';
import { HeaderService } from '../header/header.service';
@Injectable({
  providedIn: 'root'
})
export class ChatBoxService {
  constructor(
    private CallApiServices:CallApiService,
    private ConentOnline:ConectSinglRService,
    private HomeMainService:HomeMainService,
    private HeaderService:HeaderService
  ){
  }
  
  // lấy thông tin phòng chat
  async Create_WindowChat(data:any){
     return await this.CallApiServices.CallApi('ChatBox/CreateWindowChat','post', data)
  }

  // Kết nối phòng chat
  async joinGroup(GroupChatId: string) {
    if (this.ConentOnline.hubConnection.state === HubConnectionState.Connected) {
      try {
      
        await this.ConentOnline.hubConnection.invoke("JoinGroup", GroupChatId);
        console.log("Kết nối groupchat thành công"+GroupChatId);
      } catch (err) {
        console.error("Kết nối groupchat thất bại:", err);
      }
    } else {
      console.warn("Kết nối không ở trạng thái 'Đã kết nối'.");
      // Đợi kết nối và thử lại
      await this.ConentOnline.startConnection();
      this.joinGroup(GroupChatId); // Gọi lại hàm sau khi kết nối xong
    }
  }

  // Thoát phòng chat
  async leaveGroup(GroupChatId: string) {
    // this.ConentOnline.startConnection()
    if ( this.ConentOnline.hubConnection.state === HubConnectionState.Connected) {
      try {
        await this.ConentOnline.hubConnection.invoke("LeaveGroup", GroupChatId);
        console.log("Rời groupchat thành công");
      } catch (err) {
        console.error("Rồi groupchát thất bại:", err);
      }
    } else {
      console.warn("Kết nối không ở trạng thái 'Đã kết nối'.");
    }
  }

  public Message={
    GroupChatId:'',
    Contents:'',
    ListFile:[{}],
    Id:0,
  }
  // Gửi tin nhắn
  async sendMessageToGroup(GroupChatId: string, Contents: string,ListFile:Object) {
    if (this.ConentOnline.hubConnection.state === HubConnectionState.Connected) {
      try {
        await this.ConentOnline.hubConnection.invoke("SendMessageToGroup", GroupChatId, Contents, ListFile);
        console.log("Gửi tin nhắn thành công");
      } catch (err) {
        console.error("Lỗi gửi tin nhắn:", err);
      }
    } else {
      console.warn("Kết nối không ở trạng thái 'Đã kết nối'.");
    }
  }
  // public data=new FormData();
  async UpdateMessage(message:any,listfile:Array<File>){
    const data=new FormData();
    data.append('Content', message.Contents || '');
    data.append('GroupChatId',message.GroupChatId);
    for(let i=0;i<listfile.length;i++){
      data.append('FileUpload',listfile[i]);
    }
   //lưu tin nhắn và lấy danh sách file
   const ListFile= await this.CallApiServices.CallApi('ChatBox/UpdateMessage','post',data)
   this.sendMessageToGroup(message.GroupChatId.toString(),message.Contents,ListFile);
    return
  }

  // Nhận tin nhắn
  onMessageReceived(callback: (GroupChatId: string, Contents: string,UserCode:string,ListFile:any) => void) {  
    this.ConentOnline.hubConnection.on("ReceiveMessage", callback );
  }


  async openViewFileChat(fileId:number,groupChatId:number){    
    const data= await this.CallApiServices.CallApi('ChatBox/GetFileChat','post',JSON.stringify(groupChatId))
    this.HomeMainService.openViewFile(fileId,data.object)
  }

  async setStatusMess(groupChatId:number){
     await this.CallApiServices.CallApi('ChatBox/SetStatusMess','post',JSON.stringify(groupChatId))
     this.HeaderService.getHistoryChat();
  }
 
}
  

