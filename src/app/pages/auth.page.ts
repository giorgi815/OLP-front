import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { apiError } from '../shared/ui';
@Component({ standalone: true, imports: [FormsModule, RouterLink], templateUrl: './auth.page.html' })
export class AuthPage {
    private readonly api = inject(ApiService);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    readonly registerMode = signal(this.router.url.split('?')[0] === '/register');
    readonly busy = signal(false);
    readonly error = signal('');
    readonly success = signal('');
    role: 'student' | 'teacher' = 'student';
    firstName = '';
    lastName = '';
    email = '';
    password = '';
    confirmPassword = '';
    submit() {
        this.error.set('');
        this.success.set('');
        if (this.registerMode() && this.password !== this.confirmPassword) {
            this.error.set('Passwords do not match.');
            return;
        }
        this.busy.set(true);
        if (this.registerMode()) {
            this.api.register(this.role, { email: this.email, password: this.password, confirmPassword: this.confirmPassword, firstName: this.firstName, lastName: this.lastName }).subscribe({ next: response => {
                    this.success.set(response.message || 'Registration successful. Please confirm your email before logging in.');
                    this.busy.set(false);
                }, error: e => {
                    this.error.set(apiError(e));
                    this.busy.set(false);
                } });
        }
        else {
            this.auth.login(this.email, this.password).subscribe({ next: () => {
                    this.busy.set(false);
                    const next = this.route.snapshot.queryParamMap.get('next');
                    void this.router.navigateByUrl(next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');
                }, error: e => {
                    this.error.set(apiError(e));
                    this.busy.set(false);
                } });
        }
    }
}
