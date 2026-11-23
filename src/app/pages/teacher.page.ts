import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Category, Course, CourseInput, money } from '../core/models';
import { SideNavComponent } from '../shared/side-nav.component';
import { apiError } from '../shared/ui';
@Component({ standalone: true, imports: [FormsModule, RouterLink, SideNavComponent], templateUrl: './teacher.page.html' })
export class TeacherPage implements OnInit {
    readonly auth = inject(AuthService);
    private readonly api = inject(ApiService);
    readonly categories = signal<Category[]>([]);
    readonly courses = signal<Course[]>([]);
    readonly loading = signal(true);
    readonly showForm = signal(false);
    readonly busy = signal(false);
    readonly failed = signal(false);
    readonly message = signal('');
    readonly money = money;
    draft: CourseInput = { title: '', description: '', categoryId: '', duration: 60, price: 0 };
    ngOnInit() {
        this.api.categories().subscribe({ next: v => this.categories.set(v) });
        const profile = this.auth.profile();
        if (profile)
            this.fetch(profile.id);
        else
            this.api.me().subscribe({ next: p => {
                    this.auth.profile.set(p);
                    this.fetch(p.id);
                }, error: e => {
                    this.message.set(apiError(e));
                    this.failed.set(true);
                    this.loading.set(false);
                } });
    }
    private fetch(id: string) {
        this.api.coursesByTeacher(id).subscribe({ next: v => {
                this.courses.set(v);
                this.loading.set(false);
            }, error: e => {
                this.message.set(apiError(e));
                this.failed.set(true);
                this.loading.set(false);
            } });
    }
    create() {
        this.busy.set(true);
        this.message.set('');
        this.api.createCourse(this.draft).subscribe({ next: v => {
                this.courses.update(list => [v, ...list]);
                this.draft = { title: '', description: '', categoryId: '', duration: 60, price: 0 };
                this.showForm.set(false);
                this.busy.set(false);
                this.failed.set(false);
                this.message.set('Your draft is ready. Add lessons and assignments before publishing.');
            }, error: e => {
                this.busy.set(false);
                this.failed.set(true);
                this.message.set(apiError(e));
            } });
    }
}
