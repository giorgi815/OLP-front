import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
@Component({ selector: 'app-side-nav', standalone: true, imports: [RouterLink, RouterLinkActive], templateUrl: './side-nav.component.html' })
export class SideNavComponent {
    readonly auth = inject(AuthService);
}
