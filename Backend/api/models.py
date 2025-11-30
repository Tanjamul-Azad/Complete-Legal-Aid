import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, phone_number, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)

        return self.create_user(email, phone_number, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('CITIZEN', 'Citizen'),
        ('LAWYER', 'Lawyer'),
        ('ADMIN', 'Admin'),
        ('NGO_SUPPORT', 'NGO Support'),
    )
    LANGUAGE_CHOICES = (
        ('BN', 'Bangla'),
        ('EN', 'English'),
    )

    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    phone_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    language_preference = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='BN')
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    # Django admin required fields
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email

class CitizenProfile(models.Model):
    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    )

    profile_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='citizen_profile')
    full_name_en = models.CharField(max_length=100)
    full_name_bn = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    nid_number = models.CharField(max_length=50, null=True, blank=True)
    present_address = models.TextField(null=True, blank=True)
    permanent_address = models.TextField(null=True, blank=True)
    geo_division = models.CharField(max_length=50, null=True, blank=True)
    geo_district = models.CharField(max_length=50, null=True, blank=True)
    profile_photo_url = models.CharField(max_length=512, null=True, blank=True)
    identity_document_url = models.CharField(max_length=512, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'citizen_profiles'

class LawyerProfile(models.Model):
    VERIFICATION_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
        ('SUSPENDED', 'Suspended'),
    )

    profile_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lawyer_profile')
    bar_council_number = models.CharField(max_length=50, unique=True)
    license_issue_date = models.DateField()
    full_name_en = models.CharField(max_length=100)
    full_name_bn = models.CharField(max_length=100)
    bio_en = models.TextField(null=True, blank=True)
    bio_bn = models.TextField(null=True, blank=True)
    chamber_address = models.TextField(null=True, blank=True)
    geo_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    geo_longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='PENDING')
    profile_photo_url = models.CharField(max_length=512, null=True, blank=True)
    verification_document_url = models.CharField(max_length=512, null=True, blank=True)
    identity_document_url = models.CharField(max_length=512, null=True, blank=True)
    consultation_fee_online = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    consultation_fee_offline = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rating_average = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lawyer_profiles'

class AdminProfile(models.Model):
    ADMIN_LEVEL_CHOICES = (
        ('SUPER_ADMIN', 'Super Admin'),
        ('MODERATOR', 'Moderator'),
        ('SUPPORT', 'Support'),
    )

    profile_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    full_name = models.CharField(max_length=100)
    admin_level = models.CharField(max_length=20, choices=ADMIN_LEVEL_CHOICES, default='MODERATOR')
    department = models.CharField(max_length=100, null=True, blank=True)
    permissions = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'admin_profiles'

class LegalSpecialization(models.Model):
    specialization_id = models.AutoField(primary_key=True)
    name_en = models.CharField(max_length=100)
    name_bn = models.CharField(max_length=100)
    slug = models.CharField(max_length=100, unique=True)
    description_en = models.TextField(null=True, blank=True)
    description_bn = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'legal_specializations'

class LawyerSpecializationMap(models.Model):
    lawyer = models.ForeignKey(LawyerProfile, on_delete=models.CASCADE)
    specialization = models.ForeignKey(LegalSpecialization, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lawyer_specializations_map'
        unique_together = (('lawyer', 'specialization'),)

class Case(models.Model):
    STATUS_CHOICES = (
        ('SUBMITTED', 'Submitted'),
        ('IN_REVIEW', 'In Review'),
        ('DOC_REQUESTED', 'Doc Requested'),
        ('SCHEDULED', 'Scheduled'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    )
    PRIORITY_CHOICES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    )

    case_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    citizen = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cases')
    assigned_lawyer = models.ForeignKey(LawyerProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_cases')
    category = models.ForeignKey(LegalSpecialization, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    case_number = models.CharField(max_length=100, null=True, blank=True)
    court_name = models.CharField(max_length=255, null=True, blank=True)
    presiding_judge = models.CharField(max_length=255, null=True, blank=True)
    relevant_acts = models.TextField(null=True, blank=True)
    next_hearing_at = models.DateTimeField(null=True, blank=True)
    filing_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    is_anonymous = models.BooleanField(default=False)
    submission_date = models.DateTimeField(default=timezone.now)
    resolved_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'cases'

class CaseActivityLog(models.Model):
    log_id = models.BigAutoField(primary_key=True)
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    actor_user = models.ForeignKey(User, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=50)
    previous_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'case_activity_log'

class CasePrivateNote(models.Model):
    VISIBILITY_CHOICES = (
        ('PRIVATE', 'Private'),
        ('SHARED', 'Shared'),
    )

    note_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    lawyer = models.ForeignKey(LawyerProfile, on_delete=models.CASCADE)
    content = models.TextField()
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='PRIVATE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'case_private_notes'

class EvidenceDocument(models.Model):
    document_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    uploader = models.ForeignKey(User, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    storage_path = models.CharField(max_length=512)
    file_size_bytes = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    encryption_hash = models.CharField(max_length=64, blank=True, default='')
    encryption_key_id = models.CharField(max_length=100, blank=True, default='')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'evidence_documents'

class DocumentShareToken(models.Model):
    token_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(EvidenceDocument, on_delete=models.CASCADE)
    access_token = models.CharField(max_length=128, unique=True)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    expires_at = models.DateTimeField()
    is_revoked = models.BooleanField(default=False)
    access_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_share_tokens'

class AIConversation(models.Model):
    conversation_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, null=True, blank=True)
    context_window_usage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_conversations'

class AIMessage(models.Model):
    SENDER_ROLE_CHOICES = (
        ('USER', 'User'),
        ('ASSISTANT', 'Assistant'),
        ('SYSTEM', 'System'),
    )

    message_id = models.BigAutoField(primary_key=True)
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE)
    sender_role = models.CharField(max_length=20, choices=SENDER_ROLE_CHOICES)
    content = models.TextField()
    model_version = models.CharField(max_length=50, null=True, blank=True)
    prompt_tokens = models.IntegerField(null=True, blank=True)
    completion_tokens = models.IntegerField(null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    citations = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_messages'

class AIPromptTemplate(models.Model):
    template_id = models.AutoField(primary_key=True)
    feature_key = models.CharField(max_length=100)
    template_text = models.TextField()
    version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_prompt_templates'

class AIDocumentChunk(models.Model):
    chunk_id = models.BigAutoField(primary_key=True)
    document = models.ForeignKey(EvidenceDocument, on_delete=models.CASCADE)
    chunk_index = models.IntegerField()
    content_text = models.TextField()
    vector_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_document_chunks'

class AIFeedback(models.Model):
    USER_RATING_CHOICES = (
        ('THUMBS_UP', 'Thumbs Up'),
        ('THUMBS_DOWN', 'Thumbs Down'),
    )
    CATEGORY_CHOICES = (
        ('INACCURATE', 'Inaccurate'),
        ('UNSAFE', 'Unsafe'),
        ('HELPFUL', 'Helpful'),
        ('OTHER', 'Other'),
    )

    feedback_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(AIMessage, on_delete=models.CASCADE)
    user_rating = models.CharField(max_length=20, choices=USER_RATING_CHOICES)
    correction_text = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_feedback'

class LawyerAvailabilitySlot(models.Model):
    BOOKING_TYPE_CHOICES = (
        ('ONLINE', 'Online'),
        ('IN_PERSON', 'In Person'),
        ('BOTH', 'Both'),
    )

    slot_id = models.BigAutoField(primary_key=True)
    lawyer = models.ForeignKey(LawyerProfile, on_delete=models.CASCADE)
    day_of_week = models.SmallIntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPE_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lawyer_availability_slots'

class ConsultationBooking(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
        ('RESCHEDULED', 'Rescheduled'),
    )

    booking_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    citizen = models.ForeignKey(User, on_delete=models.CASCADE)
    lawyer = models.ForeignKey(LawyerProfile, on_delete=models.CASCADE)
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    meeting_link = models.CharField(max_length=255, null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultation_bookings'

class Notification(models.Model):
    TYPE_CHOICES = (
        ('CASE_UPDATE', 'Case Update'),
        ('BOOKING', 'Booking'),
        ('SYSTEM', 'System'),
        ('REMINDER', 'Reminder'),
        ('MESSAGE', 'Message'),
    )

    notification_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    metadata_json = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'

class ChatMessage(models.Model):
    message_id = models.BigAutoField(primary_key=True)
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message_text = models.TextField()
    attachment = models.ForeignKey(EvidenceDocument, on_delete=models.SET_NULL, null=True, blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        db_table = 'chat_messages'

class LawyerReview(models.Model):
    review_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(ConsultationBooking, on_delete=models.CASCADE)
    lawyer = models.ForeignKey(LawyerProfile, on_delete=models.CASCADE)
    citizen = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField(null=True, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lawyer_reviews'

class SystemSetting(models.Model):
    DATA_TYPE_CHOICES = (
        ('STRING', 'String'),
        ('INTEGER', 'Integer'),
        ('BOOLEAN', 'Boolean'),
        ('JSON', 'JSON'),
    )

    setting_key = models.CharField(max_length=100, primary_key=True)
    setting_value = models.TextField()
    description = models.CharField(max_length=255, null=True, blank=True)
    data_type = models.CharField(max_length=20, choices=DATA_TYPE_CHOICES, default='STRING')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_settings'
