import mimetypes
from pathlib import Path

from django.conf import settings
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from .models import (
    User, CitizenProfile, LawyerProfile, AdminProfile, LegalSpecialization,
    LawyerSpecializationMap, Case, CaseActivityLog, CasePrivateNote,
    EvidenceDocument, DocumentShareToken, AIConversation, AIMessage,
    AIPromptTemplate, AIDocumentChunk, AIFeedback, LawyerAvailabilitySlot,
    ConsultationBooking, Notification, ChatMessage, LawyerReview, SystemSetting
)
from .utils import save_uploaded_file
from .serializers import (
    UserSerializer, CitizenProfileSerializer, LawyerProfileSerializer,
    AdminProfileSerializer, LegalSpecializationSerializer,
    LawyerSpecializationMapSerializer, CaseSerializer, CaseActivityLogSerializer,
    CasePrivateNoteSerializer, EvidenceDocumentSerializer,
    DocumentShareTokenSerializer, AIConversationSerializer, AIMessageSerializer,
    AIPromptTemplateSerializer, AIDocumentChunkSerializer, AIFeedbackSerializer,
    LawyerAvailabilitySlotSerializer, ConsultationBookingSerializer,
    NotificationSerializer, ChatMessageSerializer, LawyerReviewSerializer,
    SystemSettingSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return super().get_queryset()
        return User.objects.filter(pk=user.pk)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser], url_path='verification')
    def set_verification(self, request, pk=None):
        user = self.get_object()
        status_value = (request.data.get('status') or '').upper()
        valid_status = {'VERIFIED', 'PENDING', 'REJECTED'}
        if status_value not in valid_status:
            return Response({'error': 'Invalid verification status'}, status=status.HTTP_400_BAD_REQUEST)

        def parse_bool(value):
            if isinstance(value, bool):
                return value
            if isinstance(value, str):
                lowered = value.strip().lower()
                if lowered in {'true', '1', 'yes'}:
                    return True
                if lowered in {'false', '0', 'no'}:
                    return False
            return None

        if status_value == 'VERIFIED':
            user.is_verified = True
            reactivate = parse_bool(request.data.get('activate'))
            if reactivate is None or reactivate:
                user.is_active = True
        else:
            user.is_verified = False

        ban_flag = parse_bool(request.data.get('ban_user'))
        if ban_flag is True:
            user.is_active = False
        elif ban_flag is False and status_value == 'VERIFIED':
            user.is_active = True

        if hasattr(user, 'lawyer_profile'):
            user.lawyer_profile.verification_status = status_value
            user.lawyer_profile.save(update_fields=['verification_status'])

        user.save(update_fields=['is_verified', 'is_active'])
        serializer = self.get_serializer(user)
        return Response(serializer.data)

class CitizenProfileViewSet(viewsets.ModelViewSet):
    queryset = CitizenProfile.objects.all()
    serializer_class = CitizenProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return super().get_queryset()
        return CitizenProfile.objects.filter(user=user)

class LawyerProfileViewSet(viewsets.ModelViewSet):
    queryset = LawyerProfile.objects.all()
    serializer_class = LawyerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = LawyerProfile.objects.select_related('user').prefetch_related('lawyerspecializationmap_set__specialization')
        user = self.request.user

        if user.is_staff:
            base_queryset = queryset
        elif hasattr(user, 'lawyer_profile'):
            base_queryset = queryset.filter(user=user)
        else:
            base_queryset = queryset.filter(verification_status='VERIFIED')

        specialization = self.request.query_params.get('specialization')
        location = self.request.query_params.get('location')
        search_query = self.request.query_params.get('q')

        if specialization:
            base_queryset = base_queryset.filter(lawyerspecializationmap__specialization__slug__iexact=specialization)
        if location:
            base_queryset = base_queryset.filter(chamber_address__icontains=location)
        if search_query:
            base_queryset = base_queryset.filter(
                Q(full_name_en__icontains=search_query) |
                Q(full_name_bn__icontains=search_query) |
                Q(user__email__icontains=search_query)
            )

        return base_queryset.distinct()

class AdminProfileViewSet(viewsets.ModelViewSet):
    queryset = AdminProfile.objects.all()
    serializer_class = AdminProfileSerializer
    permission_classes = [IsAdminUser]

class LegalSpecializationViewSet(viewsets.ModelViewSet):
    queryset = LegalSpecialization.objects.all()
    serializer_class = LegalSpecializationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class LawyerSpecializationMapViewSet(viewsets.ModelViewSet):
    queryset = LawyerSpecializationMap.objects.all()
    serializer_class = LawyerSpecializationMapSerializer

class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Case.objects.all()
        if not user.is_staff:
            queryset = queryset.filter(
                Q(citizen=user) | Q(assigned_lawyer__user=user)
            )

        client_id = self.request.query_params.get('clientId')
        lawyer_id = self.request.query_params.get('lawyerId')
        status_filter = self.request.query_params.get('status')

        if client_id:
            queryset = queryset.filter(citizen__user_id=client_id)
        if lawyer_id:
            queryset = queryset.filter(
                Q(assigned_lawyer__user__user_id=lawyer_id) |
                Q(assigned_lawyer__profile_id=lawyer_id)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())

        return queryset.distinct()

    def perform_create(self, serializer):
        citizen = serializer.validated_data.get('citizen')
        if citizen is None:
            return serializer.save(citizen=self.request.user)
        return serializer.save()

class CaseActivityLogViewSet(viewsets.ModelViewSet):
    queryset = CaseActivityLog.objects.all()
    serializer_class = CaseActivityLogSerializer

class CasePrivateNoteViewSet(viewsets.ModelViewSet):
    queryset = CasePrivateNote.objects.all()
    serializer_class = CasePrivateNoteSerializer

class EvidenceDocumentViewSet(viewsets.ModelViewSet):
    queryset = EvidenceDocument.objects.all()
    serializer_class = EvidenceDocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        queryset = EvidenceDocument.objects.all()
        if user.is_staff:
            return queryset
        return queryset.filter(
            Q(case__citizen=user) |
            Q(case__assigned_lawyer__user=user) |
            Q(uploader=user)
        ).distinct()

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        case_id = request.data.get('case') or request.data.get('case_id') or request.data.get('caseId')

        if not case_id:
            return Response({'error': 'case is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not file_obj:
            return Response({'error': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)

        case = get_object_or_404(Case, case_id=case_id)

        storage_path = save_uploaded_file(file_obj, 'evidence')
        mime_type = file_obj.content_type or mimetypes.guess_type(file_obj.name)[0] or 'application/octet-stream'

        document = EvidenceDocument.objects.create(
            case=case,
            uploader=request.user,
            file_name=file_obj.name,
            storage_path=storage_path,
            file_size_bytes=file_obj.size,
            mime_type=mime_type,
        )

        serializer = self.get_serializer(document)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_destroy(self, instance):
        storage_path = instance.storage_path
        super().perform_destroy(instance)
        if storage_path:
            file_path = (Path(settings.MEDIA_ROOT) / storage_path).resolve()
            try:
                if file_path.exists() and file_path.is_file():
                    file_path.unlink()
            except FileNotFoundError:
                pass

class DocumentShareTokenViewSet(viewsets.ModelViewSet):
    queryset = DocumentShareToken.objects.all()
    serializer_class = DocumentShareTokenSerializer

class AIConversationViewSet(viewsets.ModelViewSet):
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer

class AIMessageViewSet(viewsets.ModelViewSet):
    queryset = AIMessage.objects.all()
    serializer_class = AIMessageSerializer

class AIPromptTemplateViewSet(viewsets.ModelViewSet):
    queryset = AIPromptTemplate.objects.all()
    serializer_class = AIPromptTemplateSerializer

class AIDocumentChunkViewSet(viewsets.ModelViewSet):
    queryset = AIDocumentChunk.objects.all()
    serializer_class = AIDocumentChunkSerializer

class AIFeedbackViewSet(viewsets.ModelViewSet):
    queryset = AIFeedback.objects.all()
    serializer_class = AIFeedbackSerializer

class LawyerAvailabilitySlotViewSet(viewsets.ModelViewSet):
    queryset = LawyerAvailabilitySlot.objects.all()
    serializer_class = LawyerAvailabilitySlotSerializer

class ConsultationBookingViewSet(viewsets.ModelViewSet):
    queryset = ConsultationBooking.objects.all()
    serializer_class = ConsultationBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ConsultationBooking.objects.all()
        if not user.is_staff:
            queryset = queryset.filter(
                Q(citizen=user) | Q(lawyer__user=user)
            )

        client_id = self.request.query_params.get('clientId')
        lawyer_id = self.request.query_params.get('lawyerId')
        if client_id:
            queryset = queryset.filter(citizen__user_id=client_id)
        if lawyer_id:
            queryset = queryset.filter(
                Q(lawyer__user__user_id=lawyer_id) |
                Q(lawyer__profile_id=lawyer_id)
            )

        return queryset.distinct()

    def perform_create(self, serializer):
        citizen = serializer.validated_data.get('citizen')
        if citizen is None:
            return serializer.save(citizen=self.request.user)
        return serializer.save()

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_param = self.request.query_params.get('userId')
        if user_param and self.request.user.is_staff:
            return Notification.objects.filter(user__user_id=user_param)
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'marked all as read'})

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

class LawyerReviewViewSet(viewsets.ModelViewSet):
    queryset = LawyerReview.objects.all()
    serializer_class = LawyerReviewSerializer

    def perform_create(self, serializer):
        serializer.save(citizen=self.request.user)

class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
