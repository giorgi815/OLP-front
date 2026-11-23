import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Assignment, AssignmentInput, Category, Course, CourseInput, Enrollment, Lesson, LessonInput, Submission, money, dateLabel } from '../core/models';
import { apiError, localDeadline, downloadBlob } from '../shared/ui';
@Component({ standalone: true, imports: [RouterLink, FormsModule], templateUrl: './teacher-course.page.html' })
export class TeacherCoursePage implements OnInit {
    private readonly api = inject(ApiService);
    private readonly auth = inject(AuthService);
    private readonly route = inject(ActivatedRoute);
    readonly course = signal<Course | null>(null);
    readonly categories = signal<Category[]>([]);
    readonly editCourseOpen = signal(false);
    readonly lessons = signal<Lesson[]>([]);
    readonly assignments = signal<Assignment[]>([]);
    readonly students = signal<Enrollment[]>([]);
    readonly studentNames = signal<Record<string, string>>({});
    readonly gradingSubmissions = signal<Submission[]>([]);
    readonly selectedAssignmentId = signal('');
    readonly tab = signal<'lessons' | 'assignments' | 'students' | 'grades'>('lessons');
    readonly busy = signal(false);
    readonly failed = signal(false);
    readonly message = signal('');
    readonly money = money;
    readonly dateLabel = dateLabel;
    courseDraft: CourseInput = { title: '', description: '', categoryId: '', duration: 60, price: 0 };
    lessonDraft: LessonInput = { courseId: '', title: '', content: '', attachments: [], orderIndex: 1 };
    lessonEditId = '';
    assignmentDraft: AssignmentInput = { courseId: '', title: '', description: '', dueDate: '', maxScore: 100 };
    assignmentEditId = '';
    dueDateLocal = '';
    selectedLessonByStudent: Record<string, string> = {};
    gradeValues: Record<string, number> = {};
    feedbackValues: Record<string, string> = {};
    private id = '';
    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id') || '';
        this.lessonDraft.courseId = this.id;
        this.assignmentDraft.courseId = this.id;
        this.reload();
    }
    private reload() {
        this.api.categories().subscribe({ next: v => this.categories.set(v) });
        const profile = this.auth.profile();
        if (profile)
            this.loadOwnedCourse(profile.id);
        else
            this.api.me().subscribe({ next: p => {
                    this.auth.profile.set(p);
                    this.loadOwnedCourse(p.id);
                }, error: e => this.fail(e) });
        this.reloadLessons();
        this.reloadAssignments();
        this.api.courseStudents(this.id).subscribe({ next: v => {
                this.students.set(v);
                this.loadStudents(v);
            }, error: e => this.fail(e) });
    }
    private loadOwnedCourse(teacherId: string) {
        this.api.coursesByTeacher(teacherId).subscribe({ next: list => {
                const c = list.find(v => v.id === this.id);
                if (c) {
                    this.course.set(c);
                    this.courseDraft = { title: c.title, description: c.description, categoryId: c.categoryId, duration: c.duration, price: c.price };
                }
                else
                    this.setMessage('Course not found or you are not its teacher.', true);
            }, error: e => this.fail(e) });
    }
    saveCourse() {
        this.busy.set(true);
        this.api.updateCourse(this.id, this.courseDraft).subscribe({ next: c => {
                this.course.set(c);
                this.busy.set(false);
                this.editCourseOpen.set(false);
                this.setMessage('Course updated.');
            }, error: e => this.fail(e) });
    }
    private loadStudents(students: Enrollment[]) {
        for (const student of students) {
            this.api.user(student.studentId).subscribe({ next: u => this.studentNames.update(values => ({ ...values, [student.studentId]: `${u.firstName} ${u.lastName}` })) });
        }
    }
    private reloadLessons() {
        this.api.lessons(this.id).subscribe({ next: v => this.lessons.set(v.sort((a, b) => a.orderIndex - b.orderIndex)), error: e => this.fail(e) });
    }
    private reloadAssignments() {
        this.api.assignments(this.id).subscribe({ next: v => this.assignments.set(v), error: e => this.fail(e) });
    }
    publish() {
        if (!confirm('Publish this course for all students?'))
            return;
        this.busy.set(true);
        this.api.publishCourse(this.id).subscribe({ next: () => {
                this.busy.set(false);
                this.setMessage('Course published!');
                this.course.update(c => c ? { ...c, status: 2 } : null);
            }, error: e => this.fail(e) });
    }
    editLesson(lesson: Lesson) {
        this.lessonEditId = lesson.id;
        this.lessonDraft = { courseId: this.id, title: lesson.title, content: lesson.content, attachments: [...lesson.attachments], orderIndex: lesson.orderIndex };
        this.tab.set('lessons');
    }
    resetLesson() {
        this.lessonEditId = '';
        this.lessonDraft = { courseId: this.id, title: '', content: '', attachments: [], orderIndex: this.lessons().length + 1 };
    }
    saveLesson() {
        this.busy.set(true);
        const { courseId, ...update } = this.lessonDraft;
        const request = this.lessonEditId ? this.api.updateLesson(this.lessonEditId, update) : this.api.createLesson(this.lessonDraft);
        request.subscribe({ next: () => {
                this.busy.set(false);
                this.setMessage('Lesson saved.');
                this.resetLesson();
                this.reloadLessons();
            }, error: e => this.fail(e) });
    }
    deleteLesson(id: string) {
        if (!confirm('Delete this lesson permanently?'))
            return;
        this.api.deleteLesson(id).subscribe({ next: () => {
                this.setMessage('Lesson deleted.');
                this.reloadLessons();
            }, error: e => this.fail(e) });
    }
    uploadLesson(id: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file)
            return;
        this.busy.set(true);
        this.api.uploadLessonFile(id, file).subscribe({ next: () => {
                this.busy.set(false);
                this.setMessage('File uploaded.');
                this.reloadLessons();
            }, error: e => this.fail(e) });
        input.value = '';
    }
    editAssignment(a: Assignment) {
        this.assignmentEditId = a.id;
        this.assignmentDraft = { courseId: this.id, title: a.title, description: a.description, dueDate: a.dueDate, maxScore: a.maxScore };
        this.dueDateLocal = a.dueDate.slice(0, 16);
        this.tab.set('assignments');
    }
    resetAssignment() {
        this.assignmentEditId = '';
        this.assignmentDraft = { courseId: this.id, title: '', description: '', dueDate: '', maxScore: 100 };
        this.dueDateLocal = '';
    }
    saveAssignment() {
        if (!this.dueDateLocal) {
            this.setMessage('Please choose a due date.', true);
            return;
        }
        this.busy.set(true);
        const body = { ...this.assignmentDraft, dueDate: localDeadline(this.dueDateLocal) };
        const { courseId, ...update } = body;
        const request = this.assignmentEditId ? this.api.updateAssignment(this.assignmentEditId, update) : this.api.createAssignment(body);
        request.subscribe({ next: () => {
                this.busy.set(false);
                this.setMessage('Assignment saved.');
                this.resetAssignment();
                this.reloadAssignments();
            }, error: e => this.fail(e) });
    }
    deleteAssignment(id: string) {
        if (!confirm('Delete this assignment?'))
            return;
        this.api.deleteAssignment(id).subscribe({ next: () => {
                this.setMessage('Assignment removed.');
                this.reloadAssignments();
            }, error: e => this.fail(e) });
    }
    markStudent(studentId: string) {
        const lessonId = this.selectedLessonByStudent[studentId];
        if (!lessonId)
            return;
        this.busy.set(true);
        this.api.markComplete(lessonId, studentId).subscribe({ next: () => {
                this.busy.set(false);
                this.setMessage('Lesson marked completed for this student.');
            }, error: e => this.fail(e) });
    }
    openSubmissions(a: Assignment) {
        this.tab.set('grades');
        this.pickAssignment(a.id);
    }
    pickAssignment(id: string) {
        this.selectedAssignmentId.set(id);
        this.gradingSubmissions.set([]);
        if (!id)
            return;
        this.api.submissionsByAssignment(id).subscribe({ next: v => {
                this.gradingSubmissions.set(v);
                for (const item of v) {
                    this.gradeValues[item.id] = item.score ?? 0;
                    this.feedbackValues[item.id] = item.feedback ?? '';
                }
            }, error: e => this.fail(e) });
    }
    selectedAssignmentMax() {
        return this.assignments().find(a => a.id === this.selectedAssignmentId())?.maxScore ?? 100;
    }
    grade(id: string) {
        const score = this.gradeValues[id];
        if (score < 0 || score > this.selectedAssignmentMax()) {
            this.setMessage('Score must be within the assignment maximum.', true);
            return;
        }
        this.busy.set(true);
        this.api.grade(id, score, this.feedbackValues[id] || '').subscribe({ next: () => {
                this.busy.set(false);
                this.setMessage('Grade saved.');
                this.pickAssignment(this.selectedAssignmentId());
            }, error: e => this.fail(e) });
    }
    downloadSubmission(id: string, key: string) {
        this.api.submissionFile(id, key).subscribe({ next: b => downloadBlob(b, key), error: e => this.fail(e) });
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
