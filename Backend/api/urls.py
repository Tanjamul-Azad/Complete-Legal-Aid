from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .auth_views import (
    register, login, get_profile, update_profile, change_password,
    verify_email, resend_verification_email, request_password_reset, reset_password_confirm
)
from .views import (
    UserViewSet, CitizenProfileViewSet, LawyerProfileViewSet,
    AdminProfileViewSet, LegalSpecializationViewSet,
    LawyerSpecializationMapViewSet, CaseViewSet, CaseActivityLogViewSet,
    CasePrivateNoteViewSet, EvidenceDocumentViewSet,
    DocumentShareTokenViewSet, AIConversationViewSet, AIMessageViewSet,
    AIPromptTemplateViewSet, AIDocumentChunkViewSet, AIFeedbackViewSet,
    LawyerAvailabilitySlotViewSet, ConsultationBookingViewSet,
    NotificationViewSet, ChatMessageViewSet, LawyerReviewViewSet,
    SystemSettingViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'citizen-profiles', CitizenProfileViewSet)
router.register(r'lawyer-profiles', LawyerProfileViewSet)
router.register(r'admin-profiles', AdminProfileViewSet)
router.register(r'legal-specializations', LegalSpecializationViewSet)
router.register(r'lawyer-specializations-map', LawyerSpecializationMapViewSet)
router.register(r'cases', CaseViewSet)
router.register(r'case-activity-logs', CaseActivityLogViewSet)
router.register(r'case-private-notes', CasePrivateNoteViewSet)
router.register(r'evidence-documents', EvidenceDocumentViewSet)
router.register(r'document-share-tokens', DocumentShareTokenViewSet)
router.register(r'ai-conversations', AIConversationViewSet)
router.register(r'ai-messages', AIMessageViewSet)
router.register(r'ai-prompt-templates', AIPromptTemplateViewSet)
router.register(r'ai-document-chunks', AIDocumentChunkViewSet)
router.register(r'ai-feedback', AIFeedbackViewSet)
router.register(r'lawyer-availability-slots', LawyerAvailabilitySlotViewSet)
router.register(r'consultation-bookings', ConsultationBookingViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'chat-messages', ChatMessageViewSet)
router.register(r'lawyer-reviews', LawyerReviewViewSet)
router.register(r'system-settings', SystemSettingViewSet)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', get_profile, name='get_profile'),
    path('auth/profile/update/', update_profile, name='update_profile'),
    path('auth/password/change/', change_password, name='change_password'),
    path('auth/verify-email/', verify_email, name='verify_email'),
    path('auth/resend-verification/', resend_verification_email, name='resend_verification'),
    path('auth/password/reset/', request_password_reset, name='request_password_reset'),
    path('auth/password/reset/confirm/', reset_password_confirm, name='reset_password_confirm'),
    
    # ViewSet routes
    path('', include(router.urls)),
]

