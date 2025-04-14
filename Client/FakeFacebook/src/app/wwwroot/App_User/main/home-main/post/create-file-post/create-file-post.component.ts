import { CommonModule, NgFor, NgIf} from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { HomeMainService } from '../../Service/home-main.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-create-file-post',
    standalone: true,
    imports: [NgFor, CommonModule, NgIf, FormsModule],
    templateUrl: './create-file-post.component.html',
    styleUrl: './create-file-post.component.scss'
})
export class CreateFilePostComponent implements AfterViewInit{

  constructor(
    private cdr:ChangeDetectorRef,
    private HomeMainService:HomeMainService
  ){}

  Content:string='';
  StatusPost:string='';
  ListFile: { id:number ;file: File; previewUrl: string | ArrayBuffer | null }[] = [];

  ngAfterViewInit(): void {
      this.HomeMainService.getDataPost$.subscribe(()=>{
          if(this.Content!=''||this.ListFile.length > 0){
            let listImage=[];
            for(let i=0;i<this.ListFile.length;i++){
              listImage.push(this.ListFile[i].file)
            }
            this.HomeMainService.sendDatapost(listImage,this.Content)
            this.ListFile=[];
            this.Content='';
            this.HomeMainService.closeCreatePost();
            
          }
        })
       
     
  }
  
  //tải file lên
  onFileSelected(event: Event): void {
    this.ListFile=[];
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const selectedFiles = Array.from(input.files);
      for(let i=0;i<selectedFiles.length;i++){
          const file=selectedFiles[i];
          const reader = new FileReader();
          reader.onload = () => {
            this.ListFile.push({
              id:i,
              file,
              previewUrl: reader.result
            });
            this.cdr.detectChanges();
            
          };
          reader.readAsDataURL(file); // Tạo URL tạm thời cho ảnh
       };
    } 
    else if(this.ListFile.length<1){
    }
    input.value='';
  }
  onAddFileSelected(event:Event){
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const selectedFiles = Array.from(input.files);
      for(let i=0;i<selectedFiles.length;i++){
          var file=selectedFiles[i];
          const reader = new FileReader();
          reader.onload = () => {
            this.ListFile.push({
              id:i,
              file,
              previewUrl: reader.result
            });
            this.cdr.detectChanges();
            
          };
          reader.readAsDataURL(file); // Tạo URL tạm thời cho ảnh
      };
      input.value=''
    }
  }
  removeFile(){
    this.ListFile=[];
    this.cdr.detectChanges();
  }

}
