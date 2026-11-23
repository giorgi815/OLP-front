import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Category, Course } from '../core/models';
import { CourseCardComponent } from '../shared/course-card.component';
import { apiError } from '../shared/ui';
@Component({ standalone: true, imports: [FormsModule, CourseCardComponent], templateUrl: './catalog.page.html' })
export class CatalogPage implements OnInit {
    private readonly api = inject(ApiService);
    readonly courses = signal<Course[]>([]);
    readonly categories = signal<Category[]>([]);
    readonly loading = signal(true);
    readonly error = signal('');
    search = '';
    category = '';
    readonly filtered = () => this.courses().filter(course => (!this.category || course.categoryId === this.category) && (!this.search || `${course.title} ${course.description} ${course.teacherName} ${course.categoryName}`.toLowerCase().includes(this.search.toLowerCase())));
    ngOnInit() {
        this.api.courses().subscribe({ next: v => {
                this.courses.set(v);
                this.loading.set(false);
            }, error: e => {
                this.error.set(apiError(e));
                this.loading.set(false);
            } });
        this.api.categories().subscribe({ next: v => this.categories.set(v) });
    }
}
