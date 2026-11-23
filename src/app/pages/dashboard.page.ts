import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Course, Enrollment, NotificationItem, Statistics } from '../core/models';
import { SideNavComponent } from '../shared/side-nav.component';
import { apiError } from '../shared/ui';
@Component({ standalone: true, imports: [RouterLink, SideNavComponent], templateUrl: './dashboard.page.html' })
export class DashboardPage implements OnInit {
    readonly auth = inject(AuthService);
    private readonly api = inject(ApiService);
    readonly enrollments = signal<Enrollment[]>([]);
    readonly teacherCourses = signal<Course[]>([]);
    readonly stats = signal<Statistics | null>(null);
    readonly unread = signal(0);
    readonly submissionsCount = signal(0);
    readonly error = signal('');
    readonly publishedCount = () => this.teacherCourses().filter(c => c.status === 2).length;
    readonly date = (x: string) => new Date(x).toLocaleDateString();
    ngOnInit() {
        this.api.notifications().subscribe({ next: n => this.unread.set(n.filter(v => !v.isRead).length) });
        if (this.auth.isStudent()) {
            this.api.myEnrollments().subscribe({ next: v => this.enrollments.set(v), error: e => this.error.set(apiError(e)) });
            this.api.mySubmissions().subscribe({ next: v => this.submissionsCount.set(v.length) });
        }
        if (this.auth.isTeacher()) {
            const load = () => {
                const id = this.auth.profile()?.id;
                if (id)
                    this.api.coursesByTeacher(id).subscribe({ next: v => this.teacherCourses.set(v), error: e => this.error.set(apiError(e)) });
            };
            if (this.auth.profile())
                load();
            else
                this.api.me().subscribe({ next: p => {
                        this.auth.profile.set(p);
                        load();
                    } });
        }
        if (this.auth.isAdmin())
            this.api.statistics().subscribe({ next: v => this.stats.set(v), error: e => this.error.set(apiError(e)) });
    }
}
