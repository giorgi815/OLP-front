import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, Role, UserProfile } from './models';
const STORAGE = 'olp.session';
interface Session {
    token: string;
    refreshToken: string | null;
    email: string;
    identityId: string;
    expiresAt: string;
    roles: Role[];
}
function readRoles(token: string): Role[] {
    try {
        const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '='))) as Record<string, unknown>;
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload['role'] ?? payload['roles'] ?? [];
        return (Array.isArray(role) ? role : [role]).filter((item): item is Role => item === 'Admin' || item === 'Teacher' || item === 'Student');
    }
    catch {
        return [];
    }
}
function loadSession(): Session | null {
    try {
        const raw = sessionStorage.getItem(STORAGE);
        return raw ? JSON.parse(raw) as Session : null;
    }
    catch {
        return null;
    }
}
@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly api = inject(ApiService);
    private readonly router = inject(Router);
    readonly session = signal<Session | null>(loadSession());
    readonly profile = signal<UserProfile | null>(null);
    readonly isLoggedIn = computed(() => !!this.session()?.token);
    readonly roles = computed(() => this.session()?.roles ?? []);
    readonly isStudent = computed(() => this.roles().includes('Student'));
    readonly isTeacher = computed(() => this.roles().includes('Teacher'));
    readonly isAdmin = computed(() => this.roles().includes('Admin'));
    private refreshing$: Observable<AuthResponse> | null = null;
    constructor() {
        if (this.session())
            this.loadProfile();
    }
    login(email: string, password: string): Observable<AuthResponse> {
        return this.api.login(email, password).pipe(tap(result => {
            this.setSession(result);
            this.loadProfile();
        }));
    }
    loadProfile(): void {
        if (!this.session())
            return;
        this.api.me().subscribe({ next: profile => this.profile.set(profile), error: () => this.profile.set(null) });
    }
    accessToken(): string | null {
        return this.session()?.token ?? null;
    }
    refreshSession(): Observable<AuthResponse> {
        if (this.refreshing$)
            return this.refreshing$;
        const token = this.session()?.refreshToken;
        if (!token)
            return throwError(() => new Error('No refresh token'));
        this.refreshing$ = this.api.refresh(token).pipe(tap(result => this.setSession(result)), finalize(() => this.refreshing$ = null), shareReplay(1));
        return this.refreshing$;
    }
    logout(): void {
        if (this.session())
            this.api.logout().pipe(catchError(() => of(null))).subscribe();
        this.clear();
        void this.router.navigate(['/']);
    }
    clear(): void {
        sessionStorage.removeItem(STORAGE);
        this.session.set(null);
        this.profile.set(null);
    }
    private setSession(result: AuthResponse): void {
        const session: Session = { token: result.accessToken, refreshToken: result.refreshToken ?? null, email: result.email, identityId: result.userId, expiresAt: result.expiresAt, roles: readRoles(result.accessToken) };
        sessionStorage.setItem(STORAGE, JSON.stringify(session));
        this.session.set(session);
    }
}
