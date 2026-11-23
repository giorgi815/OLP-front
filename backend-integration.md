# Recommended backend integration adjustments

The Angular source works with your existing API; however, the current backend `AuthService` generates email URLs using the **API** base URL. This may be undesirable for the frontend.

## Make confirmation and reset emails open Angular

In `OLP.Application/Services/AuthService.cs`, find:

```csharp
private string BuildEmailLink(string route, Guid accountId, string token)
{
    var origin = _configuration["Api:BaseUrl"]
        ?? throw new InvalidOperationException("Frontend URL missing.");
    // ... keep remaining token encoding and query string logic
}
```

Replace `Api:BaseUrl` with `Frontend:BaseUrl`:

```csharp
var origin = _configuration["Frontend:BaseUrl"]
    ?? throw new InvalidOperationException("Frontend URL missing.");
```

Then change the confirmation email route from:

```csharp
var link = BuildEmailLink("/api/auth/confirm-email", account.Id, token);
```

to:

```csharp
var link = BuildEmailLink("/confirm-email", account.Id, token);
```

Keep the reset password route as `/reset-password`. Set `Frontend__BaseUrl=http://localhost:4200` in `docker-compose.override.yml` for development. The Angular pages will POST tokens to the existing backend controllers. This method also avoids link-scanning services accidentally confirming accounts via GET.

## Running Angular locally

When using `npm start`, Angular proxies `/api` to Docker's `http://localhost:8088`. No additional CORS policy is necessary for those local requests. If you use cross-origin requests directly in a deployed environment, configure a restrictive CORS policy on the backend instead.

## Optional but helpful API improvements

- A `GET /api/courses/mine` teacher endpoint would simplify querying personal drafts without looking up `DomainUsers.Id`.
- A protected `GET /api/admin/users` returning safe Identity account GUIDs alongside non-sensitive profile fields would let admins grant the teacher role without looking up `AspNetUsers.Id` in SSMS.
- A `GET /api/certificates/mine` endpoint would let students browse previously issued certificates.
- In `LessonProgressController`, put `[Authorize(Roles="Student")]` on the three progress-reading endpoints if only student self-view is intended. Keep `[Authorize(Roles="Teacher")]` on `complete-by-teacher`.
- Use your production reverse proxy and TLS. Don't expose SQL Server or Redis ports to the public internet.
