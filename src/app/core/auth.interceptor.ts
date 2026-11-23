import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
/** Attach JWT and attempt one refresh for protected routes on HTTP 401. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const auth = inject(AuthService);
    const token = auth.accessToken();
    const publicAuth = /\/api\/auth\/(?:login|register|refresh|forgot-password|reset-password|resend-confirmation|confirm-email)/.test(request.url);
    const outbound = token && !publicAuth ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
    return next(outbound).pipe(catchError(error => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401 || publicAuth || !token)
            return throwError(() => error);
        return auth.refreshSession().pipe(switchMap(() => next(request.clone({ setHeaders: { Authorization: `Bearer ${auth.accessToken()}` } }))), catchError(refreshError => {
            auth.clear();
            return throwError(() => refreshError);
        }));
    }));
};
