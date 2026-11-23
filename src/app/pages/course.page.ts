import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Assignment, Course, Lesson, Review, money, dateLabel } from '../core/models';
import { apiError } from '../shared/ui';
@Component({ standalone: true, imports: [RouterLink, FormsModule], templateUrl: './course.page.html' })
export class CoursePage implements OnInit {
    readonly auth = inject(AuthService);
    private readonly api = inject(ApiService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    readonly course = signal<Course | null>(null);
    readonly lessons = signal<Lesson[]>([]);
    readonly reviews = signal<Review[]>([]);
    readonly enrolled = signal(false);
    readonly busy = signal(false);
    readonly message = signal('');
    readonly error = signal('');
    readonly failed = signal(false);
    readonly money = money;
    readonly dateLabel = dateLabel;
    readonly artSymbols = ['⌘', '✎', '◈', '✦', '◎'];
    artIndex = 0;
    rating = 5;
    comment = '';
    private id = '';
    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id') || '';
        this.artIndex = this.id.charCodeAt(0) % 5;
        this.api.course(this.id).subscribe({ next: c => {
                this.course.set(c);
                this.fetchExtras();
            }, error: e => this.error.set(apiError(e)) });
    }
    private fetchExtras() {
        this.api.reviews(this.id).subscribe({ next: r => this.reviews.set(r) });
        if (this.auth.isLoggedIn()) {
            if (this.auth.isStudent()) {
                this.api.isEnrolled(this.id).subscribe({ next: r => {
                        this.enrolled.set(r.enrolled);
                        if (r.enrolled)
                            this.loadLessons();
                    } });
            }
            else
                this.loadLessons();
        }
    }
    private loadLessons() {
        this.api.lessons(this.id).subscribe({ next: v => this.lessons.set(v) });
    }
    enroll() {
        const course = this.course();
        if (!course)
            return;
        this.busy.set(true);
        this.message.set('');
        this.failed.set(false);
        const enrollNow = () => this.api.enroll(this.id).subscribe({ next: () => {
                this.enrolled.set(true);
                this.busy.set(false);
                this.message.set('You are enrolled! Your lessons are ready.');
                this.loadLessons();
            }, error: e => this.handle(e) });
        if (course.price > 0) {
            this.api.checkout(this.id).subscribe({ next: checkout => this.api.confirmPayment(checkout.paymentId).subscribe({ next: () => enrollNow(), error: e => this.handle(e) }), error: e => this.handle(e) });
        }
        else
            enrollNow();
    }
    review() {
        this.busy.set(true);
        this.api.createReview(this.id, this.rating, this.comment).subscribe({ next: v => {
                this.reviews.update(r => [v, ...r]);
                this.comment = '';
                this.busy.set(false);
                this.message.set('Review posted.');
                this.failed.set(false);
            }, error: e => this.handle(e) });
    }
    private handle(e: unknown) {
        this.busy.set(false);
        this.failed.set(true);
        this.message.set(apiError(e));
    }
}
