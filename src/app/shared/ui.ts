import { HttpErrorResponse } from '@angular/common/http';
/** Present backend errors from ASP.NET problem details without exposing stack traces. */
export function apiError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
        if (error.status === 0)
            return 'Cannot reach the API. Check Docker and your Angular proxy.';
        const body = error.error as unknown;
        if (body && typeof body === 'object') {
            const problem = body as Record<string, unknown>;
            if (typeof problem['detail'] === 'string')
                return problem['detail'];
            if (typeof problem['message'] === 'string')
                return problem['message'];
            if (problem['errors'] && typeof problem['errors'] === 'object') {
                const messages = Object.values(problem['errors'] as Record<string, unknown>).flatMap(v => Array.isArray(v) ? v : []);
                if (messages.length)
                    return messages.map(String).join(' ');
            }
            if (typeof problem['title'] === 'string')
                return problem['title'];
        }
        if (error.status === 401)
            return 'Your session has expired. Please log in again.';
        if (error.status === 403)
            return 'You do not have permission for this action.';
        if (error.status === 404)
            return 'This item could not be found.';
        return `Request failed (${error.status}). Please try again.`;
    }
    return error instanceof Error ? error.message : 'Something went wrong.';
}
export function downloadBlob(blob: Blob, filename: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename.split('/').pop() || 'attachment';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
}
export function localDeadline(value: string): string {
    return new Date(value).toISOString();
}
