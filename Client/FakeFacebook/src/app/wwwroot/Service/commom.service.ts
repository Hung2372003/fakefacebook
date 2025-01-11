import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CommomService {
  private userListSubject = new BehaviorSubject<string[]>([]);
  constructor() {
    // if (typeof window !== 'undefined' && localStorage) {
    //   const storedList = localStorage.getItem('ListUserOnline');
    //   const initialList = storedList ? JSON.parse(storedList) : [];  // Nếu không có, khởi tạo mảng rỗng
    //   this.userListSubject = new BehaviorSubject<string[]>(initialList);  // Khởi tạo BehaviorSubject
    // } else {
    //   // Nếu không phải trình duyệt (ví dụ, đang chạy trong môi trường Node.js), khởi tạo mảng rỗng
    //   this.userListSubject = new BehaviorSubject<string[]>([]);
    // }
   }
  userList$ = this.userListSubject.asObservable();

  addUser(user: string): void {
    const currentList = this.userListSubject.value;
    const updatedList = [...currentList, user];
    this.userListSubject.next([...currentList, user]);
    localStorage.setItem('ListUserOnline', JSON.stringify(updatedList));
  }
  removeUser(user:string) : void{
    const currentList = this.userListSubject.value;
    const updatedList = currentList.filter(u => u !== user);  // Lọc bỏ người dùng cần xóa
    this.userListSubject.next(updatedList); 
    localStorage.setItem('ListUserOnline', JSON.stringify(updatedList));
  }
}
