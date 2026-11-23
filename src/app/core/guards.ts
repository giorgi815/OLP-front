import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';
export const requireLogin: CanActivateFn = (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.isLoggedIn() ? true : router.createUrlTree(['/login'], { queryParams: { next: state.url } });
};
export const requireRole = (role: Role): CanActivateFn => () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.isLoggedIn() && auth.roles().includes(role) ? true : router.createUrlTree([auth.isLoggedIn() ? '/dashboard' : '/login']);
};
