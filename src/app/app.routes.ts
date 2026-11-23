import { Routes } from '@angular/router';
import { requireLogin, requireRole } from './core/guards';
export const routes: Routes = [
    { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home.page').then(m => m.HomePage), title: 'Discover learning · OLP' },
    { path: 'courses', loadComponent: () => import('./pages/catalog.page').then(m => m.CatalogPage), title: 'Explore courses · OLP' },
    { path: 'courses/:id', loadComponent: () => import('./pages/course.page').then(m => m.CoursePage), title: 'Course details · OLP' },
    { path: 'login', loadComponent: () => import('./pages/auth.page').then(m => m.AuthPage), title: 'Sign in · OLP' },
    { path: 'register', loadComponent: () => import('./pages/auth.page').then(m => m.AuthPage), title: 'Create an account · OLP' },
    { path: 'confirm-email', loadComponent: () => import('./pages/email.page').then(m => m.EmailPage), title: 'Confirm email · OLP' },
    { path: 'forgot-password', loadComponent: () => import('./pages/email.page').then(m => m.EmailPage), title: 'Recover account · OLP' },
    { path: 'reset-password', loadComponent: () => import('./pages/email.page').then(m => m.EmailPage), title: 'Reset password · OLP' },
    { path: 'dashboard', canActivate: [requireLogin], loadComponent: () => import('./pages/dashboard.page').then(m => m.DashboardPage), title: 'Dashboard · OLP' },
    { path: 'certificates/:id', canActivate: [requireRole('Student')], loadComponent: () => import('./pages/certificate.page').then(m => m.CertificatePage), title: 'Certificate · OLP' },
    { path: 'learning/:id', canActivate: [requireRole('Student')], loadComponent: () => import('./pages/learning.page').then(m => m.LearningPage), title: 'Your learning · OLP' },
    { path: 'teach', canActivate: [requireRole('Teacher')], loadComponent: () => import('./pages/teacher.page').then(m => m.TeacherPage), title: 'Teaching studio · OLP' },
    { path: 'teach/courses/:id', canActivate: [requireRole('Teacher')], loadComponent: () => import('./pages/teacher-course.page').then(m => m.TeacherCoursePage), title: 'Manage course · OLP' },
    { path: 'admin', canActivate: [requireRole('Admin')], loadComponent: () => import('./pages/admin.page').then(m => m.AdminPage), title: 'Admin workspace · OLP' },
    { path: 'notifications', canActivate: [requireLogin], loadComponent: () => import('./pages/notifications.page').then(m => m.NotificationsPage), title: 'Notifications · OLP' },
    { path: 'profile', canActivate: [requireLogin], loadComponent: () => import('./pages/profile.page').then(m => m.ProfilePage), title: 'My profile · OLP' },
    { path: '**', redirectTo: '' }
];
