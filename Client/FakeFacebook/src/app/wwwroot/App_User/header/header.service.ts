import { Injectable } from '@angular/core';
import { CallApiService } from '../../Service/call-api.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService  {

  constructor(
    private CallApiService:CallApiService,
  ) { }

  public _PersionalInformation = new BehaviorSubject<object>({});
  private _ListMessageHistory=new BehaviorSubject<Array<any>>([]);
  private _ActionCloseHistoryMessage= new BehaviorSubject<void>(undefined);
  private _ActionOpenPersionalInformation =new Subject<number>()
  private _ActionClosePersionalInformation=new BehaviorSubject<void>(undefined);


  ListMessageHistory$=this._ListMessageHistory.asObservable();
  PersionalInformation$ = this._PersionalInformation.asObservable();
  ActionCloseHistoryMessage$=this._ActionCloseHistoryMessage.asObservable();
  ActionOpenPersionalInformation$=this._ActionOpenPersionalInformation.asObservable();
  ActionClosePersionalInformation$=this._ActionClosePersionalInformation.asObservable();

  async getPersionalInformation(userCode:any) {
    try {
      const data = await this.CallApiService.CallApi('PersonalAction/GetPersonalInformation', 'post', JSON.stringify(userCode));
      this._PersionalInformation.next(data.object);
      return data.object;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  }

  closeHistory(){
    this._ActionCloseHistoryMessage.next();
  }

  async getHistoryChat(){
    const data= await this.getHistoryChatApi()
    this._ListMessageHistory.next(data);
  }

  async getHistoryChatApi(){
    const data =await this.CallApiService.CallApi('ActionMessage/GetAllMessageGroups','get',null)
    return data.object;
  }
  openPersionalInformation(userCode:number){
      this._ActionOpenPersionalInformation.next(userCode);
    }
    
  closePersionalInformation(){
    this._ActionClosePersionalInformation.next();
  }
}
