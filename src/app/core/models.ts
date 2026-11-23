/** DTO shapes matched to OLP.Application/DTOs in the provided backend archive. */
export type Role = 'Admin' | 'Teacher' | 'Student';
export type Guid = string;
export interface UserProfile {
    id: Guid;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    createdAt?: string;
}
export interface AuthResponse {
    userId: Guid;
    email: string;
    accessToken: string;
    refreshToken?: string | null;
    expiresAt: string;
}
export interface Category {
    id: Guid;
    name: string;
    description?: string | null;
}
export interface Course {
    id: Guid;
    title: string;
    description: string;
    duration: number;
    price: number;
    status: number;
    createdAt: string;
    teacherId: Guid;
    teacherName: string;
    categoryId: Guid;
    categoryName: string;
}
export interface CourseInput {
    title: string;
    description: string;
    categoryId: Guid;
    duration: number;
    price: number;
}
export interface Lesson {
    id: Guid;
    courseId: Guid;
    title: string;
    content: string;
    attachments: string[];
    orderIndex: number;
    createdAt: string;
}
export interface LessonInput {
    courseId: Guid;
    title: string;
    content: string;
    attachments: string[];
    orderIndex: number;
}
export interface Assignment {
    id: Guid;
    courseId: Guid;
    title: string;
    description: string;
    dueDate: string;
    maxScore: number;
    createdAt: string;
}
export interface AssignmentInput {
    courseId: Guid;
    title: string;
    description: string;
    dueDate: string;
    maxScore: number;
}
export interface Submission {
    id: Guid;
    assignmentId: Guid;
    studentId: Guid;
    content: string;
    attachments: string[];
    score: number | null;
    feedback?: string | null;
    submittedAt: string;
}
export interface Enrollment {
    id: Guid;
    studentId: Guid;
    courseId: Guid;
    courseTitle: string;
    enrolledAt: string;
}
export interface Progress {
    id: Guid;
    studentId: Guid;
    lessonId: Guid;
    isCompleted: boolean;
    completedAt: string | null;
}
export interface Review {
    id: Guid;
    courseId: Guid;
    studentId: Guid;
    studentName: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
}
export interface NotificationItem {
    id: Guid;
    userId: Guid;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}
export interface Certificate {
    id: Guid;
    studentId: Guid;
    courseId: Guid;
    studentName: string;
    courseTitle: string;
    issuedAt: string;
}
export interface Statistics {
    users: number;
    courses: number;
    enrollments: number;
    submissions: number;
}
export interface PaymentCheckout {
    paymentId: Guid;
    checkoutUrl: string;
}
export interface Payment {
    paymentId: Guid;
    courseId: Guid;
    amount: number;
    currency: string;
    paidAt: string | null;
}
export const published = (course: Course): boolean => course.status === 2;
export const fullName = (profile: UserProfile | null): string => profile ? `${profile.firstName} ${profile.lastName}`.trim() : 'Your account';
export const money = (price: number): string => price === 0 ? 'Free' : `$${price.toFixed(2)}`;
export const dateLabel = (date?: string | null): string => date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set';
