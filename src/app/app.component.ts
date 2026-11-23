import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { fullName } from './core/models';
@Component({
    selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './app.component.html'
})
export class AppComponent {
    readonly auth = inject(AuthService);
    readonly menuOpen = signal(false);
    readonly name = computed(() => fullName(this.auth.profile()));
    readonly initials = computed(() => {
        const profile = this.auth.profile();
        return profile ? `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase() : '●';
    });
}
