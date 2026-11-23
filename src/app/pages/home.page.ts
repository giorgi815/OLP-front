import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Course } from '../core/models';
import { CourseCardComponent } from '../shared/course-card.component';
@Component({ standalone: true, imports: [RouterLink, CourseCardComponent], templateUrl: './home.page.html' })
export class HomePage implements OnInit {
    private readonly api = inject(ApiService);
    readonly courses = signal<Course[]>([]);
    readonly loading = signal(true);
    ngOnInit() {
        this.api.courses().subscribe({ next: list => {
                this.courses.set(list.slice(0, 3));
                this.loading.set(false);
            }, error: () => this.loading.set(false) });
    }
}
