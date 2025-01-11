import { Component } from '@angular/core';
import { PostComponent } from "./post/post.component";
import { ContactUserComponent } from "./contact-user/contact-user.component";


@Component({
    selector: 'app-home-main',
    standalone: true,
    imports: [ PostComponent, ContactUserComponent],
    templateUrl: './home-main.component.html',
    styleUrl: './home-main.component.scss'
})
export class HomeMainComponent {

}
