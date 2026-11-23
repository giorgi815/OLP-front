import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment, AssignmentInput, AuthResponse, Category, Certificate, Course, CourseInput, Enrollment, Lesson, LessonInput, NotificationItem, Payment, PaymentCheckout, Progress, Review, Statistics, Submission, UserProfile } from './models';
/** Uses relative URLs. Development proxy routes /api to localhost:8088 (Docker API). */
@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly http = inject(HttpClient);
    private readonly root = '/api';
    private get<T>(path: string): Observable<T> {
        return this.http.get<T>(`${this.root}${path}`);
    }
    private post<T>(path: string, body: unknown = {}): Observable<T> {
        return this.http.post<T>(`${this.root}${path}`, body);
    }
    private put<T>(path: string, body: unknown = {}): Observable<T> {
        return this.http.put<T>(`${this.root}${path}`, body);
    }
    private delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.root}${path}`);
    }
    private upload<T>(path: string, file: File): Observable<T> {
        const data = new FormData();
        data.append('file', file);
        return this.post<T>(path, data);
    }
    login(email: string, password: string) {
        return this.post<AuthResponse>('/auth/login', { email, password });
    }
    register(role: 'student' | 'teacher', body: {
        email: string;
        password: string;
        confirmPassword: string;
        firstName: string;
        lastName: string;
    }) {
        return this.post<{
            message: string;
        }>(`/auth/register/${role}`, body);
    }
    refresh(refreshToken: string) {
        return this.post<AuthResponse>('/auth/refresh', { refreshToken });
    }
    logout() {
        return this.post<void>('/auth/logout');
    }
    confirmEmail(userId: string, token: string) {
        return this.post<{
            message: string;
        }>('/auth/confirm-email', { userId, token });
    }
    resendConfirmation(email: string) {
        return this.post<{
            message: string;
        }>('/auth/resend-confirmation', { email });
    }
    forgotPassword(email: string) {
        return this.post<{
            message: string;
        }>('/auth/forgot-password', { email });
    }
    resetPassword(userId: string, token: string, newPassword: string, confirmNewPassword: string) {
        return this.post<{
            message: string;
        }>('/auth/reset-password', { userId, token, newPassword, confirmNewPassword });
    }
    changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string) {
        return this.post<void>('/auth/change-password', { currentPassword, newPassword, confirmNewPassword });
    }
    categories() {
        return this.get<Category[]>('/categories');
    }
    createCategory(name: string, description: string) {
        return this.post<Category>('/categories', { name, description });
    }
    updateCategory(id: string, name: string, description: string) {
        return this.put<Category>(`/categories/${id}`, { name, description });
    }
    deleteCategory(id: string) {
        return this.delete<void>(`/categories/${id}`);
    }
    courses() {
        return this.get<Course[]>('/courses');
    }
    course(id: string) {
        return this.get<Course>(`/courses/${id}`);
    }
    coursesByCategory(id: string) {
        return this.get<Course[]>(`/courses/by-category/${id}`);
    }
    coursesByTeacher(id: string) {
        return this.get<Course[]>(`/courses/by-teacher/${id}`);
    }
    createCourse(body: CourseInput) {
        return this.post<Course>('/courses', body);
    }
    updateCourse(id: string, body: CourseInput) {
        return this.put<Course>(`/courses/${id}`, body);
    }
    publishCourse(id: string) {
        return this.post<void>(`/courses/${id}/publish`);
    }
    deleteCourse(id: string) {
        return this.delete<void>(`/courses/${id}`);
    }
    lessons(courseId: string) {
        return this.get<Lesson[]>(`/lessons/by-course/${courseId}`);
    }
    lesson(id: string) {
        return this.get<Lesson>(`/lessons/${id}`);
    }
    createLesson(body: LessonInput) {
        return this.post<Lesson>('/lessons', body);
    }
    updateLesson(id: string, body: Omit<LessonInput, 'courseId'>) {
        return this.put<Lesson>(`/lessons/${id}`, body);
    }
    deleteLesson(id: string) {
        return this.delete<void>(`/lessons/${id}`);
    }
    uploadLessonFile(id: string, file: File) {
        return this.upload<Lesson>(`/lessons/${id}/attachments`, file);
    }
    lessonFile(id: string, key: string) {
        return this.http.get(`${this.root}/lessons/${id}/attachments`, { params: new HttpParams().set('key', key), responseType: 'blob' });
    }
    assignments(courseId: string) {
        return this.get<Assignment[]>(`/assignments/by-course/${courseId}`);
    }
    assignment(id: string) {
        return this.get<Assignment>(`/assignments/${id}`);
    }
    createAssignment(body: AssignmentInput) {
        return this.post<Assignment>('/assignments', body);
    }
    updateAssignment(id: string, body: Omit<AssignmentInput, 'courseId'>) {
        return this.put<Assignment>(`/assignments/${id}`, body);
    }
    deleteAssignment(id: string) {
        return this.delete<void>(`/assignments/${id}`);
    }
    myEnrollments() {
        return this.get<Enrollment[]>('/enrollments/mine');
    }
    courseStudents(id: string) {
        return this.get<Enrollment[]>(`/enrollments/courses/${id}/students`);
    }
    isEnrolled(id: string) {
        return this.get<{
            enrolled: boolean;
        }>(`/enrollments/courses/${id}/mine`);
    }
    enroll(id: string) {
        return this.post<Enrollment>(`/enrollments/courses/${id}`);
    }
    unenroll(id: string) {
        return this.delete<void>(`/enrollments/courses/${id}`);
    }
    checkout(id: string) {
        return this.post<PaymentCheckout>(`/payments/courses/${id}/checkout`);
    }
    confirmPayment(id: string) {
        return this.post<Payment>(`/payments/${id}/confirm`);
    }
    mySubmissions() {
        return this.get<Submission[]>('/submissions/mine');
    }
    submissionsByAssignment(id: string) {
        return this.get<Submission[]>(`/submissions/by-assignment/${id}`);
    }
    submit(assignmentId: string, content: string) {
        return this.post<Submission>('/submissions', { assignmentId, content, attachments: [] });
    }
    grade(id: string, score: number, feedback: string) {
        return this.put<Submission>(`/submissions/${id}/grade`, { score, feedback });
    }
    uploadSubmissionFile(id: string, file: File) {
        return this.upload<Submission>(`/submissions/${id}/attachments`, file);
    }
    submissionFile(id: string, key: string) {
        return this.http.get(`${this.root}/submissions/${id}/attachments`, { params: new HttpParams().set('key', key), responseType: 'blob' });
    }
    myProgress(courseId: string) {
        return this.get<Progress[]>(`/progress/courses/${courseId}/lessons`);
    }
    progressPercentage(courseId: string) {
        return this.get<{
            percentage: number;
        }>(`/progress/courses/${courseId}/percentage`);
    }
    markComplete(lessonId: string, studentId: string) {
        return this.post<{
            message: string;
        }>('/progress/complete-by-teacher', { lessonId, studentId });
    }
    issueCertificate(courseId: string) {
        return this.post<Certificate>(`/certificates/courses/${courseId}/issue`);
    }
    certificate(id: string) {
        return this.get<Certificate>(`/certificates/${id}`);
    }
    reviews(courseId: string) {
        return this.get<Review[]>(`/reviews/by-course/${courseId}`);
    }
    reviewAverage(courseId: string) {
        return this.get<{ averageRating: number }>(`/reviews/by-course/${courseId}/average`);
    }
    createReview(courseId: string, rating: number, comment: string) {
        return this.post<Review>('/reviews', { courseId, rating, comment });
    }
    updateReview(id: string, rating: number, comment: string) {
        return this.put<Review>(`/reviews/${id}`, { rating, comment });
    }
    deleteReview(id: string) {
        return this.delete<void>(`/reviews/${id}`);
    }
    notifications() {
        return this.get<NotificationItem[]>('/notifications/mine');
    }
    markRead(id: string) {
        return this.put<void>(`/notifications/${id}/read`);
    }
    markAllRead() {
        return this.put<void>('/notifications/read-all');
    }
    deleteNotification(id: string) {
        return this.delete<void>(`/notifications/${id}`);
    }
    sendNotification(userId: string, title: string, message: string) {
        return this.post<NotificationItem>('/notifications', { userId, title, message });
    }
    user(id: string) {
        return this.get<UserProfile>(`/users/${id}`);
    }
    me() {
        return this.get<UserProfile>('/users/me');
    }
    updateMe(firstName: string, lastName: string) {
        return this.put<UserProfile>('/users/me', { firstName, lastName });
    }
    teachers() {
        return this.get<UserProfile[]>('/users/teachers');
    }
    users() {
        return this.get<UserProfile[]>('/users');
    }
    statistics() {
        return this.get<Statistics>('/admin/statistics');
    }
    grantTeacherRole(identityUserId: string) {
        return this.post<void>(`/admin/users/${identityUserId}/teacher-role`);
    }
    uploadAvatar(file: File) {
        return this.upload<UserProfile>('/users/me/avatar', file);
    }
    avatarUrl(id: string) {
        return `${this.root}/users/${id}/avatar`;
    }
}
