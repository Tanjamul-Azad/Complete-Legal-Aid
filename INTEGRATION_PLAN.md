# Frontend–Backend Integration Plan

_Last updated: 30 Nov 2025_

## 1. Current Pain Points (Code Smells & Dissimilarities)
- **Authentication flow drift**: Frontend expects `name`, `avatar`, `verificationStatus`, etc., but the DRF `UserSerializer` emits minimalist snake_case fields; tokens are stored but never normalized, leading to inconsistent role casing and null-safe fields scattered through the UI.
- **Global `AllowAny` permissions**: Every `ModelViewSet` exposes personal data (cases, bookings, notifications) to unauthenticated clients, and `perform_create` relies on `request.user`, which becomes `AnonymousUser` under the current default configuration.
- **Missing dependencies & runtime bugs**: `api/auth_views.py` uses `timezone` without importing it, causing registration to fail for lawyers. Similar unchecked imports exist for other helpers.
- **Incompatible casing & enums**: Backend stores statuses as `SUBMITTED`, `IN_REVIEW`, etc., while the React app renders display strings (`Submitted`, `In Review`). There is no mapping layer, so UI logic silently breaks when real data is returned.
- **Mock fallbacks left in production path**: `useAppLogic` still fabricates documents, messages, notifications, etc. This creates divergent truth sources versus the REST API and makes it impossible to test end-to-end behaviours.
- **No media pipeline**: Profile avatars, NID/license documents, and evidence uploads are kept in memory (`URL.createObjectURL`) with no persistence. The database lacks columns for file references and Django is not configured with a media root.
- **Notification schema mismatch**: Frontend writes `read` while DRF expects `is_read`; mark-all endpoint path differs from router action naming.
- **Inefficient serializers**: Multiple viewsets expose every column (`fields = '__all__'`) which leaks internal data (encryption secrets, log metadata) and sends UUIDs the client cannot interpret without extra fetches.

## 2. Integration Strategy (Step-by-Step)
1. **Backend foundation**
   - Configure `public/` as `MEDIA_ROOT`, expose `MEDIA_URL`, and version-control a `.gitkeep` under the folder.
   - Harden DRF defaults: set `DEFAULT_PERMISSION_CLASSES` to `IsAuthenticated`, override per-endpoint (registration/login stay `AllowAny`).
   - Import missing modules (`timezone`) and add logging guards.
2. **Domain-specific view updates**
   - Extend `CitizenProfile` & `LawyerProfile` with `profile_photo_url`, `verification_document_url`, etc. Add migrations.
   - Create dedicated serializers (nested user/profile info) that emit camelCase-friendly payloads and hide sensitive columns.
   - Add media-aware endpoints: e.g., `POST /profiles/upload-avatar/`, `POST /evidence-documents/` accepting `multipart/form-data`, saving files into `public/` and persisting relative links.
   - Add queryset filters (`clientId`, `lawyerId`) that map to `citizen` / `assigned_lawyer` fields so existing frontend query params remain valid.
3. **Frontend service layer**
   - Introduce transformers per domain (users, cases, bookings, notifications) to convert backend snake_case into the existing TypeScript shapes (and map enums such as `SUBMITTED -> Submitted`).
   - Update Axios client to drop the default `Content-Type` header when sending `FormData` so multipart uploads work.
   - Rework `authService.signup` / `updateUserProfile` to send `FormData` (name, role, language, plus files) and store normalized `User` objects client-side.
   - Replace `handleDocumentUpload` mock logic with calls to a new `evidenceService.upload()` that hits the DRF media endpoint and merges the API response into local state.
4. **UI state reconciliation**
   - Remove remaining references to `constants.ts` mock exports; `useAppLogic` should source everything from services and gracefully handle loading/empty states.
   - Align notification & case reducers with new service outputs; mark-read operations must call DRF endpoints so state stays in sync.
5. **Testing & follow-up**
   - Add serializer tests (or at least manual `pytest` instructions) to ensure file paths resolve under `MEDIA_ROOT`.
   - Document the new API contract (request/response examples) in `README.md` for future contributors.

## 3. Immediate Next Steps
- [ ] Implement backend media configuration + migrations for new columns.
- [ ] Ship DRF endpoints/parsers for avatar, verification, and evidence uploads storing files under `Backend/public/`.
- [ ] Update frontend Axios + services (`authService`, `caseService`, `notificationService`, new `mediaService`) with transformer helpers and real upload calls.
- [ ] Refactor `useAppLogic` to consume service data and remove hardcoded mock flows for documents & notifications.

This roadmap keeps both sides aligned while tackling the user-reported upload blocker first.