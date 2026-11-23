import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course, money } from '../core/models';
@Component({ selector: 'app-course-card', standalone: true, imports: [RouterLink], templateUrl: './course-card.component.html' })
export class CourseCardComponent {
    readonly course = input.required<Course>();
    readonly index = input(0);
    readonly symbols = ['⌘', '✎', '◈', '✦', '◎'];
    readonly money = money;
}
