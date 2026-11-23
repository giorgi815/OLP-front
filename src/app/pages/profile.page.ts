import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { SideNavComponent } from '../shared/side-nav.component';
import { apiError } from '../shared/ui';
@Component({ standalone: true, imports: [FormsModule, SideNavComponent], templateUrl: './profile.page.html' })
export class ProfilePage implements OnInit {
    readonly auth = inject(AuthService);
    private readonly api = inject(ApiService);
    readonly busy = signal(false);
    readonly failed = signal(false);
    readonly message = signal('');
    firstName = '';
    lastName = '';
    currentPassword = '';
    newPassword = '';
    confirmNewPassword = '';
    ngOnInit() {
        this.api.me().subscribe({ next: p => {
                this.auth.profile.set(p);
                this.firstName = p.firstName;
                this.lastName = p.lastName;
            }, error: e => this.fail(e) });
    }
    save() {
        this.busy.set(true);
        this.api.updateMe(this.firstName, this.lastName).subscribe({ next: p => {
                this.auth.profile.set(p);
                this.busy.set(false);
                this.setMessage('Profile updated.');
            }, error: e => this.fail(e) });
    }
    upload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file)
            return;
        this.busy.set(true);
        this.api.uploadAvatar(file).subscribe({ next: p => {
                this.auth.profile.set(p);
                this.busy.set(false);
                this.setMessage('Photo uploaded.');
            }, error: e => this.fail(e) });
        input.value = '';
    }
    changePassword() {
        if (this.newPassword !== this.confirmNewPassword) {
            this.setMessage('Passwords do not match.', true);
            return;
        }
        this.busy.set(true);
        this.api.changePassword(this.currentPassword, this.newPassword, this.confirmNewPassword).subscribe({ next: () => {
                this.busy.set(false);
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmNewPassword = '';
                this.setMessage('Password updated. Please sign in again on your next session.');
            }, error: e => this.fail(e) });
    }
    private setMessage(value: string, failed = false) {
        this.failed.set(failed);
        this.message.set(value);
    }
    private fail(e: unknown) {
        this.busy.set(false);
        this.setMessage(apiError(e), true);
    }
}
