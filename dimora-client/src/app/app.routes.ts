import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path:'home',
    loadComponent: () => import('../app/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path:'profile',
    loadComponent: () => import('../app/pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path:'detail/:id',
    loadComponent: () => import('../app/pages/detail/detail.component').then(m => m.DetailComponent)
  },
  {
    path:'create-post',
    loadComponent: () => import('../app/pages/create-post/create-post.component').then(m => m.CreatePostComponent)
  },
  {
    path:'search',
    loadComponent: () => import('../app/pages/search/search.component').then(m => m.SearchComponent)
  },
  {
    path:'',
    redirectTo:'home',
    pathMatch:'full'
  }
];
