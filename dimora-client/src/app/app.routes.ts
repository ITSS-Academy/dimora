import { Routes } from '@angular/router';
import { SearchGuard } from './guards/search.guard';
import { DetailGuard } from './guards/detail.guard';
import { BookingGuard } from './guards/booking.guard';

export const routes: Routes = [
  {
    path:'home',
    loadComponent: () => import('../app/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path:'profile/:id',
    loadComponent: () => import('../app/pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path:'detail/:id',
    loadComponent: () => import('../app/pages/detail/detail.component').then(m => m.DetailComponent),
    canActivate: [DetailGuard]
  },
  {
    path:'create-post',
    loadComponent: () => import('../app/pages/create-post/create-post.component').then(m => m.CreatePostComponent)
  },
  {
    path:'search',
    loadComponent: () => import('../app/pages/search/search.component').then(m => m.SearchComponent),
    canActivate: [SearchGuard]
  },
  {
    path:'booking',
    loadComponent: () => import('../app/pages/booking/booking.component').then(m => m.BookingComponent),
    canActivate: [BookingGuard]
  },
  {
    path:'update-post/:id',
    loadComponent: () => import('../app/pages/update-post/update-post.component').then(m => m.UpdatePostComponent)
  },
  {
    path:'not-found',
    loadComponent: () => import('../app/pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path:'',
    redirectTo:'home',
    pathMatch:'full'
  },
  {
    path:'**',
    redirectTo:'not-found'
  }
];
