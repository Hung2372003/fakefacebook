import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ConectSinglRService {
  public hubConnection: HubConnection;
  private hostUrlHub = 'https://localhost:7158/hub';
  private reconnectInterval = 5000; // Thời gian nối lại sau khi ngắt kết nối

  constructor() { 
    // Tạo kết nối
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hostUrlHub, {
        accessTokenFactory: () => {
          const token = localStorage.getItem("token");
          return token || "";
        } 
      })
      .build();

    // Bắt đầu kết nối khi dịch vụ được khởi tạo
    this.startConnection();

    // Xử lý khi kết nối bị đóng
    this.hubConnection.onclose(() => {
      console.log("Kết nối thất bại! Đang kết nối lại...");
      this.reconnect();
    });
  }

  // Hàm khởi tạo kết nối
  public async startConnection() {

    try {
      await this.hubConnection.start();
      console.log("Đã kết nối với SignalR server");
    } catch (err) {
      console.error("Lỗi kết nối SignalR server : ", err);
      this.reconnect(); 
    }
  }

  // Hàm tái kết nối lại sau khi ngắt kết nối
  private reconnect() {
    setTimeout(async () => {
      await this.startConnection();
    }, this.reconnectInterval);
  }

  // Đảm bảo dừng kết nối khi component bị hủy
  public stopConnection() {
    // await this.hubConnection.stop()
    if (this.hubConnection && this.hubConnection.state === "Connected") {
      this.hubConnection.stop()
        .then(() => console.log("Đã dừng kết nối SignalR"))
        .catch(err => console.error("Lỗi dừng kết nối: ", err));
    }
  }
  public getListUserOnline(callback: (UserCode: any) => void) {
    return this.hubConnection.on("ListUserOnline", callback);  

  }
}
