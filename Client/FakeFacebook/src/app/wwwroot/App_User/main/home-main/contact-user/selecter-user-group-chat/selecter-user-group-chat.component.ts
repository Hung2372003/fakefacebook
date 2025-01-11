import {ChangeDetectionStrategy, Component, computed, OnInit, signal,ViewEncapsulation } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { HomeMainService } from '../../Service/home-main.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { ContactUserService } from '../contact-user.service';
import { ChangeDetectorRef,Renderer2  } from '@angular/core';
export interface Task {
  userCode:number;
  name: string;
  avatar:string;
  completed: boolean;
  statusSearch:boolean;
  subtasks?: Task[];
};
interface inforGroupChat {
  groupName: string;
  groupAvatar: File|null;
  listUserAddGroup: Array<number>;
}

@Component({
    selector: 'app-selecter-user-group-chat',
    standalone:true,
    imports: [MatCheckboxModule, FormsModule, NgFor, NgIf, MatButtonModule, MatIconModule, MatDividerModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './selecter-user-group-chat.component.html',
    styleUrl: 'selecter-user-group-chat.component.scss'
})
export class SelecterUserGroupChatComponent implements OnInit {

  constructor(  
    private HomeMainServices:HomeMainService,
    private WindowSelectUser:ContactUserService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private ContactUserService:ContactUserService
  ){}

  public buttonClickSubscription!: Subscription;
  statusBAddGroup='none';
  backGroupBAddGroup='#0866ff8f';
  async ngOnInit(): Promise<void>{
    this.ListUserOnline= await this.HomeMainServices.GetListFriend();
    this.buttonClickSubscription=this.WindowSelectUser.buttonClickedOpen$.subscribe( async (): Promise<void> =>{ 
      this.initializeSubtasks();      
    })
  }
   readonly task = signal<Task>({
    userCode:0,
    name: 'Chọn tất cả',
    avatar:'',
    completed: false,
    statusSearch:true,
    subtasks: [],
  });
  private async initializeSubtasks(): Promise<void> {
    this.statusBAddGroup='none';
    this.backGroupBAddGroup='#0866ff8f';
    const friends = await this.HomeMainServices.GetListFriend();
    const subtasks = friends.map((friend: { name: string ,userCode:number,path:string}) => ({
      userCode:friend.userCode,
      avatar:friend.path,
      name: friend.name,
      statusSearch:true,
      completed: false,
    }));
    this.task.update(task => ({ ...task, subtasks }));
  }

  readonly partiallyComplete = computed(() => {
    const task = this.task();
    if (!task.subtasks) {
      return false;
    }
    return task.subtasks.some(t => t.completed) && !task.subtasks.every(t => t.completed);
  });

  update(completed: boolean, index?: number) {
    this.task.update(task => {
      if (index === undefined) {
        task.completed = completed;
        task.subtasks?.forEach(t => (t.completed = completed));
      } else {
        task.subtasks![index].completed = completed;
        task.completed = task.subtasks?.every(t => t.completed) ?? true;
      }
      return {...task};
    });
   let count=0;
    this.task().subtasks?.forEach(x=>{
      if(x.completed==true){count++}
    })
    if(count>=2){
      this.statusBAddGroup=''
      this.backGroupBAddGroup=''
    }else{
      this.statusBAddGroup='none';
      this.backGroupBAddGroup='#0866ff8f';
    }
  }
  ListUserOnline : any;

  closeSelect(){
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input: HTMLInputElement) => {
      this.renderer.setProperty(input, 'value', '');
    });
    this.WindowSelectUser.CloseWindowSelectUser();
    this.selectedFile=null
    this.previewUrl=null
  }

  public previewUrl: string | ArrayBuffer | null=null ;
  selectedFile: File | null = null;
  groupName:string = ''
  onAvatarGroupChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = null;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        console.log('FileReader onload triggered:', e);
        this.previewUrl = reader.result as string; // Lưu URL của ảnh
        console.log('Preview URL:', this.previewUrl);
        this.cdr.detectChanges();
        if (input) {
          input.value = ''; // Reset nội dung input file
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  onSearchUserChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    this.task().subtasks?.forEach(x=>{
      const normalizedName = x.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      x.statusSearch = normalizedName.includes(searchValue);  
    })
  }

  //----------------------------------------------------------

  async createGroupChat(){
    const formData = new FormData();
    this.task().subtasks?.forEach((x,index)=>{
      if(x.completed==true){
        formData.append(`ListUser[${index}]`, x.userCode.toString());
      }
    })
    formData.append('GroupName',this.groupName)
    if (this.selectedFile) {
      formData.append('Avatar',this.selectedFile)
    }
    await this.ContactUserService.CreateGroupChat(formData)
    this.ContactUserService.ReloadGroup();
    this.closeSelect();
  }
}
