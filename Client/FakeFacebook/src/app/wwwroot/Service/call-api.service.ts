import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class CallApiService {
  isBrowser: boolean;
  private hostUrlApi='https://localhost:7158/api';
  constructor(
    private http:HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) 
  {
    this.isBrowser = isPlatformBrowser(platformId);
  }
    

  // gọi các phương thức
  CallApi(endpoint: string,method:string,data:any): Promise<any> {
      if (this.isBrowser==true) {
        const token = localStorage.getItem('token'); 
        // const headers =new HttpHeaders()
        let headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
        });
    
        // Nếu dữ liệu là FormData, không cần 'Content-Type'
        if (!(data instanceof FormData)) {
          headers = headers.set('Content-Type', 'application/json');
        }
       
      const url = `${this.hostUrlApi}/${endpoint}`;
      switch (method.toLowerCase()) {
        case 'get':
          return new Promise((resolve, reject) => {
           this.http.get(url, { headers }).subscribe({
            next: (data: any) => {       
              resolve(data); 
            },
            error: (error) => {
              console.error(error);
              reject(error); 
            },
            complete: () => {
              console.log('Complete!');
            }
           })
          })
        case 'post':
          return new Promise((resolve, reject) => {
          this.http.post(url, data, { headers }).subscribe({
            next: (data: any) => {       
              resolve(data); 
            },
            error: (error) => {
              console.error(error);
              reject(error); 
            },
            complete: () => {
              console.log('Complete!');
            }
           })
          });
        case 'put':
          return new Promise((resolve, reject) => {
           this.http.put(url, data, { headers }).subscribe({
            next: (data: any) => {       
              resolve(data); 
            },
            error: (error) => {
              console.error(error);
              reject(error); 
            },
            complete: () => {
              console.log('Complete!');
            }
           })
          });
        case 'delete':
          return new Promise((resolve, reject) => {
           this.http.delete(url, { headers }).subscribe({
            next: (data: any) => {       
              resolve(data); 
            },
            error: (error) => {
              console.error(error);
              reject(error); 
            },
            complete: () => {
              console.log('Complete!');
            }
           })
          });
        default:
          console.error('Invalid HTTP method:', method);
          return Promise.reject(new Error('Invalid HTTP method'));
      }
   }else{
    return Promise.reject(new Error('Đây là môi trường Node.js'));
   }
  }
}
