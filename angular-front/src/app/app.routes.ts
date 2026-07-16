import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { FormComponent } from './components/form/form';
import { ProfileViewComponent } from './components/profile-view/profile-view';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: FormComponent },
      { path: 'view', component: ProfileViewComponent },
    ],
  },
];
