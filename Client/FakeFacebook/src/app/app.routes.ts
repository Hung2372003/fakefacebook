import { Routes } from '@angular/router';
import { SignInComponent } from './wwwroot/Authentication_User/sign-in/sign-in.component';
import { RegisterComponent } from './wwwroot/Authentication_User/register/register.component';
import { ErrorPageComponent } from './wwwroot/Authentication_User/error-page/error-page.component';
import { ForgotPasswordComponent } from './wwwroot/Authentication_User/forgot-password/forgot-password.component';
import { AppUserComponent } from './app-user/app-user.component';
import { HomeMainComponent } from './wwwroot/App_User/main/home-main/home-main.component';
import { AuthGuard } from './auth.guard';
import { FriendComponent } from './wwwroot/App_User/main/friend/friend.component';
import { FriendRequestComponent } from './wwwroot/App_User/main/friend/friend-request/friend-request.component';
import { ListFriendComponent } from './wwwroot/App_User/main/friend/list-friend/list-friend.component';
import { ListSearchFriendComponent } from './wwwroot/App_User/main/friend/list-search-friend/list-search-friend.component';
import { AppMessagesComponent } from './app-messages/app-messages.component';
import { AppAdminComponent } from './app-admin/app-admin.component';
export const routes: Routes = [ 
   {path: '', redirectTo: 'sign-in', pathMatch: 'full'},
   { path: 'sign-in', component: SignInComponent },
   { path: 'register', component: RegisterComponent },
   { path: 'error-page', component: ErrorPageComponent },
   {path: 'forgot', component: ForgotPasswordComponent },
   { path: 'app-user', component: AppUserComponent,canActivate: [AuthGuard],
      children: [
          {path: '', redirectTo: 'home-main', pathMatch: 'full'},
          { path: 'home-main', component: HomeMainComponent },
          { path: 'friend', component: FriendComponent,
            children:[
                {path:'',redirectTo:'list-friend',pathMatch:'full'},
                {path:'friend-request',component:FriendRequestComponent},
                {path:'list-friend',component:ListFriendComponent},
                {path:'list-search-friend',component:ListSearchFriendComponent}
            ],
          },
        ],    
    },
    
    { path: 'my', component: HomeMainComponent },
    { path:'messages', component: AppMessagesComponent },
    { path:'admin', component: AppAdminComponent },
];
