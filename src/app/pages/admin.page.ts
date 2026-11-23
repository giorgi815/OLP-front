import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Category, Statistics, UserProfile } from '../core/models';
import { SideNavComponent } from '../shared/side-nav.component';
import { apiError } from '../shared/ui';
@Component({ standalone: true, imports: [FormsModule, SideNavComponent], templateUrl: './admin.page.html' })
export class AdminPage implements OnInit {
    private readonly api = inject(ApiService);
    readonly statistics = signal<Statistics | null>(null);
    readonly categories = signal<Category[]>([]);
    readonly users = signal<UserProfile[]>([]);
    readonly tab = signal<'categories' | 'users' | 'notifications'>('categories');
    readonly busy = signal(false);
    readonly failed = signal(false);
    readonly message = signal('');
    categoryName = '';
    categoryDescription = '';
    categoryEditId = '';
    identityId = '';
    recipient = '';
    notificationTitle = '';
    notificationMessage = '';
    ngOnInit() {
        this.api.statistics().subscribe({ next: v => this.statistics.set(v), error: e => this.fail(e) });
        this.loadCategories();
        this.api.users().subscribe({ next: v => this.users.set(v), error: e => this.fail(e) });
    }
    private loadCategories() {
        this.api.categories().subscribe({ next: v => this.categories.set(v), error: e => this.fail(e) });
    }
    editCategory(c: Category) {
        this.categoryName = c.name;
        this.categoryDescription = c.description ?? '';
        this.categoryEditId = c.id;
    }
    clearCategory() {
        this.categoryName = '';
        this.categoryDescription = '';
        this.categoryEditId = '';
    }
    saveCategory() {
        this.busy.set(true);
        const req = this.categoryEditId ? this.api.updateCategory(this.categoryEditId, this.categoryName, this.categoryDescription) : this.api.createCategory(this.categoryName, this.categoryDescription);
        req.subscribe({ next: () => {
                this.busy.set(false);
                this.clearCategory();
                this.setMessage('Category saved.');
                this.loadCategories();
            }, error: e => this.fail(e) });
    }
    deleteCategory(id: string) {
        if (!confirm('Delete this category? Courses using it may prevent deletion.'))
            return;
        this.api.deleteCategory(id).subscribe({ next: () => {
                this.setMessage('Category deleted.');
                this.loadCategories();
            }, error: e => this.fail(e) });
    }
    promote() {
        this.busy.set(true);
        this.api.grantTeacherRole(this.identityId).subscribe({ next: () => {
                this.busy.set(false);
                this.setMessage('Teacher role granted.');
                this.identityId = '';
            }, error: e => this.fail(e) });
    }
    sendNotification() {
        this.busy.set(true);
        this.api.sendNotification(this.recipient, this.notificationTitle, this.notificationMessage).subscribe({ next: () => {
                this.busy.set(false);
                this.setMessage('Notification sent.');
                this.notificationTitle = '';
                this.notificationMessage = '';
            }, error: e => this.fail(e) });
    }
    private setMessage(msg: string) {
        this.failed.set(false);
        this.message.set(msg);
    }
    private fail(e: unknown) {
        this.busy.set(false);
        this.failed.set(true);
        this.message.set(apiError(e));
    }
}
