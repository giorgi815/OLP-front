import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { NotificationItem, dateLabel } from '../core/models';
import { SideNavComponent } from '../shared/side-nav.component';
import { apiError } from '../shared/ui';
@Component({ standalone: true, imports: [RouterLink, SideNavComponent], templateUrl: './notifications.page.html' })
export class NotificationsPage implements OnInit {
    private readonly api = inject(ApiService);
    readonly items = signal<NotificationItem[]>([]);
    readonly error = signal('');
    readonly dateLabel = dateLabel;
    ngOnInit() {
        this.load();
    }
    load() {
        this.api.notifications().subscribe({ next: v => this.items.set(v.sort((a, b) => b.createdAt.localeCompare(a.createdAt))), error: e => this.error.set(apiError(e)) });
    }
    read(id: string) {
        this.api.markRead(id).subscribe({ next: () => this.items.update(items => items.map(item => item.id === id ? { ...item, isRead: true } : item)), error: e => this.error.set(apiError(e)) });
    }
    readAll() {
        this.api.markAllRead().subscribe({ next: () => this.items.update(items => items.map(item => ({ ...item, isRead: true }))), error: e => this.error.set(apiError(e)) });
    }
    remove(id: string) {
        this.api.deleteNotification(id).subscribe({ next: () => this.items.update(items => items.filter(item => item.id !== id)), error: e => this.error.set(apiError(e)) });
    }
}
