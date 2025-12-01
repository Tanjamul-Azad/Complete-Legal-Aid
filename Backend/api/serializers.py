from django.utils import timezone
from rest_framework import serializers
from .models import (
    User, CitizenProfile, LawyerProfile, AdminProfile, LegalSpecialization,
    LawyerSpecializationMap, Case, CaseActivityLog, CasePrivateNote,
    EvidenceDocument, DocumentShareToken, AIConversation, AIMessage,
    AIPromptTemplate, AIDocumentChunk, AIFeedback, LawyerAvailabilitySlot,
    ConsultationBooking, Notification, ChatMessage, LawyerReview, SystemSetting
)
from .utils import build_public_url

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    id = serializers.CharField(source='user_id', read_only=True)
    phone = serializers.CharField(source='phone_number', read_only=True)
    avatar = serializers.SerializerMethodField()
    verification_status = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'name', 'role', 'language_preference', 'is_active',
            'is_verified', 'created_at', 'avatar', 'verification_status', 'profile'
        ]
        extra_kwargs = {'password': {'write_only': True}}
    
    def _get_profile(self, obj):
        if hasattr(obj, 'citizen_profile'):
            return obj.citizen_profile
        if hasattr(obj, 'lawyer_profile'):
            return obj.lawyer_profile
        if hasattr(obj, 'admin_profile'):
            return obj.admin_profile
        return None

    def get_name(self, obj):
        profile = self._get_profile(obj)
        if profile and hasattr(profile, 'full_name_en'):
            return profile.full_name_en
        if profile and hasattr(profile, 'full_name'):
            return profile.full_name
        return obj.email.split('@')[0]

    def get_avatar(self, obj):
        request = self.context.get('request')
        profile = self._get_profile(obj)
        photo_path = None
        if hasattr(profile, 'profile_photo_url'):
            photo_path = profile.profile_photo_url
        return build_public_url(photo_path, request) if photo_path else None

    def get_verification_status(self, obj):
        if hasattr(obj, 'lawyer_profile'):
            return obj.lawyer_profile.verification_status
        return 'VERIFIED' if obj.is_verified else 'PENDING'

    def get_profile(self, obj):
        request = self.context.get('request')
        profile = self._get_profile(obj)
        if not profile:
            return None

        data = {}
        if hasattr(profile, 'full_name_en'):
            data['full_name_en'] = profile.full_name_en
        elif hasattr(profile, 'full_name'):
            data['full_name'] = profile.full_name
        if hasattr(profile, 'profile_photo_url'):
            data['profile_photo_url'] = build_public_url(profile.profile_photo_url, request)
        if hasattr(profile, 'verification_document_url'):
            data['verification_document_url'] = build_public_url(profile.verification_document_url, request)
        if hasattr(profile, 'identity_document_url'):
            data['identity_document_url'] = build_public_url(profile.identity_document_url, request)
        return data

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class CitizenProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CitizenProfile
        fields = '__all__'

class LawyerProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source='user.user_id', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone_number', read_only=True)
    name = serializers.CharField(source='full_name_en', read_only=True)
    avatar = serializers.SerializerMethodField()
    specializations = serializers.SerializerMethodField()
    experience_years = serializers.SerializerMethodField()
    location = serializers.CharField(source='chamber_address', read_only=True)
    availability = serializers.SerializerMethodField()

    class Meta:
        model = LawyerProfile
        fields = [
            'profile_id', 'user_id', 'user', 'name', 'email', 'phone', 'avatar',
            'verification_status', 'bar_council_number', 'bio_en', 'bio_bn',
            'chamber_address', 'location', 'consultation_fee_online',
            'consultation_fee_offline', 'rating_average', 'total_reviews',
            'license_issue_date', 'profile_photo_url', 'verification_document_url',
            'identity_document_url', 'specializations', 'experience_years',
            'availability'
        ]
        read_only_fields = (
            'profile_id', 'user_id', 'name', 'email', 'phone', 'avatar', 'location',
            'specializations', 'experience_years', 'bar_council_number', 'availability'
        )

    def get_avatar(self, obj):
        request = self.context.get('request')
        return build_public_url(obj.profile_photo_url, request)

    def get_specializations(self, obj):
        if hasattr(obj, 'lawyerspecializationmap_set'):
            mappings = obj.lawyerspecializationmap_set.select_related('specialization')
        else:
            mappings = LawyerSpecializationMap.objects.filter(lawyer=obj).select_related('specialization')
        return [m.specialization.name_en for m in mappings]

    def get_experience_years(self, obj):
        if obj.license_issue_date:
            today = timezone.now().date()
            delta = today.year - obj.license_issue_date.year
            if (today.month, today.day) < (obj.license_issue_date.month, obj.license_issue_date.day):
                delta -= 1
            return max(delta, 0)
        return None

    def get_availability(self, obj):
        """
        Generate availability slots for the next 30 days based on weekly schedule.
        Returns a dict: { 'YYYY-MM-DD': ['HH:MM', 'HH:MM', ...] }
        """
        slots = LawyerAvailabilitySlot.objects.filter(lawyer=obj, is_active=True)
        if not slots.exists():
            return {}

        availability_map = {}
        today = timezone.now().date()
        
        # Map day_of_week (0=Monday, 6=Sunday) to slots
        # Python's weekday(): 0=Monday, 6=Sunday
        # Django/DB usually matches this, but let's assume 0=Monday
        slots_by_day = {}
        for slot in slots:
            if slot.day_of_week not in slots_by_day:
                slots_by_day[slot.day_of_week] = []
            slots_by_day[slot.day_of_week].append(slot)

        for i in range(30):
            current_date = today + timezone.timedelta(days=i)
            day_of_week = current_date.weekday() # 0=Monday
            
            if day_of_week in slots_by_day:
                day_slots = slots_by_day[day_of_week]
                time_slots = []
                for slot in day_slots:
                    # Generate 1-hour slots within the range
                    start = slot.start_time
                    end = slot.end_time
                    
                    # Simple logic: just add the start time for now, or generate hourly
                    # Let's generate hourly slots
                    current_time = start
                    while current_time < end:
                        time_str = current_time.strftime('%I:%M %p') # 10:00 AM
                        time_slots.append(time_str)
                        
                        # Add 1 hour
                        # Handling time addition is tricky with datetime.time, convert to datetime
                        dt = timezone.datetime.combine(current_date, current_time)
                        dt += timezone.timedelta(hours=1)
                        current_time = dt.time()
                
                if time_slots:
                    availability_map[str(current_date)] = sorted(list(set(time_slots))) # Unique and sorted
        
        return availability_map

class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = '__all__'

class LegalSpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalSpecialization
        fields = '__all__'

class LawyerSpecializationMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawyerSpecializationMap
        fields = '__all__'

class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = '__all__'

class CaseActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseActivityLog
        fields = '__all__'

class CasePrivateNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CasePrivateNote
        fields = '__all__'

class EvidenceDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = EvidenceDocument
        fields = [
            'document_id', 'case', 'uploader', 'file_name', 'storage_path',
            'file_size_bytes', 'mime_type', 'encryption_hash', 'encryption_key_id',
            'uploaded_at', 'deleted_at', 'file_url'
        ]
        read_only_fields = (
            'document_id', 'uploader', 'file_name', 'storage_path',
            'file_size_bytes', 'mime_type', 'uploaded_at'
        )

    def get_file_url(self, obj):
        request = self.context.get('request')
        return build_public_url(obj.storage_path, request)

class DocumentShareTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentShareToken
        fields = '__all__'

class AIConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConversation
        fields = '__all__'

class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = '__all__'

class AIPromptTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIPromptTemplate
        fields = '__all__'

class AIDocumentChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIDocumentChunk
        fields = '__all__'

class AIFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIFeedback
        fields = '__all__'

class LawyerAvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawyerAvailabilitySlot
        fields = '__all__'

class ConsultationBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationBooking
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('sender', 'sent_at', 'is_read')

class LawyerReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawyerReview
        fields = '__all__'

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'
