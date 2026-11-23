import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { apiError } from '../shared/ui';
@Component({ standalone: true, imports: [FormsModule, RouterLink], templateUrl: './email.page.html' })
export class EmailPage {
    private readonly api = inject(ApiService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    readonly mode = this.router.url.split('?')[0].replace('/', '');
    readonly busy = signal(false);
    readonly error = signal('');
    readonly success = signal('');
    email = '';
    password = '';
    confirmPassword = '';
    submit() {
        this.error.set('');
        this.success.set('');
        const params = this.route.snapshot.queryParamMap;
        const id = params.get('userId') || '';
        const token = params.get('token') || '';
        if (this.mode !== 'forgot-password' && (!id || !token)) {
            this.error.set('The link is missing a user ID or token.');
            return;
        }
        if (this.mode === 'reset-password' && this.password !== this.confirmPassword) {
            this.error.set('Passwords do not match.');
            return;
        }
        this.busy.set(true);
        const request = this.mode === 'confirm-email' ? this.api.confirmEmail(id, token) : this.mode === 'reset-password' ? this.api.resetPassword(id, token, this.password, this.confirmPassword) : this.api.forgotPassword(this.email);
        request.subscribe({ next: r => {
                this.success.set(r.message || 'Done.');
                this.busy.set(false);
            }, error: e => {
                this.error.set(apiError(e));
                this.busy.set(false);
            } });
    }
}
