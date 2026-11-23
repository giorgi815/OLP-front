import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Assignment, Certificate, Course, Lesson, Progress, Submission, dateLabel } from '../core/models';
import { apiError, downloadBlob } from '../shared/ui';
@Component({ standalone: true, imports: [RouterLink, FormsModule], templateUrl: './learning.page.html' })
export class LearningPage implements OnInit {
    private readonly api = inject(ApiService);
    private readonly route = inject(ActivatedRoute);
    readonly course = signal<Course | null>(null);
    readonly lessons = signal<Lesson[]>([]);
    readonly assignments = signal<Assignment[]>([]);
    readonly submissions = signal<Submission[]>([]);
    readonly progress = signal<Progress[]>([]);
    readonly percentage = signal(0);
    readonly selectedLesson = signal('');
    readonly certificate = signal<Certificate | null>(null);
    readonly error = signal('');
    readonly message = signal('');
    readonly failed = signal(false);
    readonly busy = signal(false);
    readonly dateLabel = dateLabel;
    answers: Record<string, string> = {};
    private id = '';
    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id') || '';
        this.api.course(this.id).subscribe({ next: v => this.course.set(v), error: e => this.error.set(apiError(e)) });
        this.refresh();
    }
    refresh() {
        this.api.lessons(this.id).subscribe({ next: v => this.lessons.set(v), error: e => this.error.set(apiError(e)) });
        this.api.assignments(this.id).subscribe({ next: v => this.assignments.set(v) });
        this.api.myProgress(this.id).subscribe({ next: v => this.progress.set(v) });
        this.api.progressPercentage(this.id).subscribe({ next: v => this.percentage.set(Math.min(100, Math.max(0, Math.round(v.percentage)))) });
        this.api.mySubmissions().subscribe({ next: v => this.submissions.set(v) });
    }
    readonly completeCount = () => this.lessons().filter(l => this.completed(l.id)).length;
    completed(lessonId: string) {
        return this.progress().some(p => p.lessonId === lessonId && p.isCompleted);
    }
    submissionFor(assignmentId: string) {
        return this.submissions().find(v => v.assignmentId === assignmentId);
    }
    submit(assignmentId: string) {
        const answer = this.answers[assignmentId]?.trim();
        if (!answer)
            return;
        this.busy.set(true);
        this.api.submit(assignmentId, answer).subscribe({ next: () => {
                this.busy.set(false);
                this.setMessage('Assignment submitted successfully.');
                this.api.mySubmissions().subscribe({ next: v => this.submissions.set(v) });
            }, error: e => this.fail(e) });
    }
    uploadSubmissionFile(id: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file)
            return;
        this.busy.set(true);
        this.api.uploadSubmissionFile(id, file).subscribe({ next: () => {
                this.busy.set(false);
                this.setMessage('File uploaded.');
                this.api.mySubmissions().subscribe({ next: v => this.submissions.set(v) });
            }, error: e => this.fail(e) });
        input.value = '';
    }
    lessonDownload(id: string, key: string) {
        this.api.lessonFile(id, key).subscribe({ next: b => downloadBlob(b, key), error: e => this.fail(e) });
    }
    submissionDownload(id: string, key: string) {
        this.api.submissionFile(id, key).subscribe({ next: b => downloadBlob(b, key), error: e => this.fail(e) });
    }
    issue() {
        this.busy.set(true);
        this.api.issueCertificate(this.id).subscribe({ next: v => {
                this.certificate.set(v);
                this.busy.set(false);
                this.setMessage('Certificate issued!');
            }, error: e => this.fail(e) });
    }
    printCertificate() {
        window.print();
    }
    private setMessage(value: string) {
        this.failed.set(false);
        this.message.set(value);
    }
    private fail(e: unknown) {
        this.busy.set(false);
        this.failed.set(true);
        this.message.set(apiError(e));
    }
}
