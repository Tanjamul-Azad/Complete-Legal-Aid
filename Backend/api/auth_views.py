from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone

from .models import User, CitizenProfile, LawyerProfile, AdminProfile
from .serializers import UserSerializer
from .utils import save_uploaded_file


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user (citizen or lawyer)
    """
    data = request.data
    files = request.FILES
    print(f"Registration request data: {data}")  # Debug logging
    role = data.get('role', 'CITIZEN').upper()
    profile_photo_file = files.get('profile_photo') or files.get('avatar')
    verification_doc_file = files.get('verification_document') or files.get('doc')
    identity_doc_file = files.get('identity_document')
    
    # Validate required fields
    required_fields = ['email', 'phone_number', 'password', 'name']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        print(f"Missing fields: {missing_fields}")  # Debug logging
        return Response(
            {'error': f'Missing required fields: {", ".join(missing_fields)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already exists
    if User.objects.filter(email=data['email']).exists():
        print(f"User with email {data['email']} already exists")  # Debug logging
        return Response(
            {'error': 'An account with this email already exists.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if phone number already exists
    if User.objects.filter(phone_number=data['phone_number']).exists():
        print(f"User with phone {data['phone_number']} already exists")  # Debug logging
        return Response(
            {'error': 'An account with this phone number already exists.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Create user
        user = User.objects.create_user(
            email=data['email'],
            phone_number=data['phone_number'],
            password=data['password']
        )
        user.role = role
        user.language_preference = data.get('language', 'EN')
        user.is_active = True  # Auto-activate for now (can add email verification later)
        user.save()

        profile_photo_path = save_uploaded_file(profile_photo_file, f'profiles/{role.lower()}') if profile_photo_file else None
        verification_doc_path = save_uploaded_file(verification_doc_file, f'documents/{role.lower()}') if verification_doc_file else None
        identity_doc_path = save_uploaded_file(identity_doc_file, f'identity/{role.lower()}') if identity_doc_file else None
        
        # Create profile based on role
        if role == 'CITIZEN':
            CitizenProfile.objects.create(
                user=user,
                full_name_en=data['name'],
                profile_photo_url=profile_photo_path,
                identity_document_url=identity_doc_path,
            )
        elif role == 'LAWYER':
            LawyerProfile.objects.create(
                user=user,
                full_name_en=data['name'],
                bar_council_number=data.get('lawyerId', f'TEMP-{user.user_id}'),
                license_issue_date=timezone.now().date(),
                full_name_bn=data.get('name', ''),
                bio_en=data.get('bio', ''),
                profile_photo_url=profile_photo_path,
                verification_document_url=verification_doc_path,
                identity_document_url=identity_doc_path,
            )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Serialize user data
        user_data = UserSerializer(user, context={'request': request}).data
        
        return Response({
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"Registration error: {str(e)}")
        print(traceback.format_exc())
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login user and return JWT tokens
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate user
    user = authenticate(email=email, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    # Serialize user data
    user_data = UserSerializer(user, context={'request': request}).data
    
    return Response({
        'user': user_data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get current authenticated user profile
    """
    user_data = UserSerializer(request.user, context={'request': request}).data
    return Response(user_data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update current user profile
    """
    user = request.user
    data = request.data
    files = request.FILES
    avatar_file = files.get('avatar') or files.get('profile_photo')
    verification_doc_file = files.get('verification_document') or files.get('doc')
    identity_doc_file = files.get('identity_document')
    
    try:
        profile = None
        if hasattr(user, 'citizen_profile'):
            profile = user.citizen_profile
        elif hasattr(user, 'lawyer_profile'):
            profile = user.lawyer_profile
        elif hasattr(user, 'admin_profile'):
            profile = user.admin_profile
        elif user.role == 'ADMIN':
            profile, _ = AdminProfile.objects.get_or_create(
                user=user,
                defaults={
                    'full_name': data.get('name') or user.email.split('@')[0],
                }
            )

        # Update User model fields
        if 'name' in data and profile:
            if hasattr(profile, 'full_name_en'):
                profile.full_name_en = data['name']
            elif hasattr(profile, 'full_name'):
                profile.full_name = data['name']
        
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
        
        if 'preferred_language' in data:
            user.language_preference = data['preferred_language']

        if profile and hasattr(profile, 'admin_level') and 'admin_level' in data:
            profile.admin_level = data['admin_level']
        if profile and hasattr(profile, 'department') and 'department' in data:
            profile.department = data['department']
        if profile and hasattr(profile, 'permissions') and 'permissions' in data:
            profile.permissions = data['permissions']
        
        if avatar_file and profile and hasattr(profile, 'profile_photo_url'):
            profile.profile_photo_url = save_uploaded_file(avatar_file, f'profiles/{user.role.lower()}')
        if verification_doc_file and profile and hasattr(profile, 'verification_document_url'):
            profile.verification_document_url = save_uploaded_file(verification_doc_file, f'documents/{user.role.lower()}')
        if identity_doc_file and profile and hasattr(profile, 'identity_document_url'):
            profile.identity_document_url = save_uploaded_file(identity_doc_file, f'identity/{user.role.lower()}')
        if profile:
            profile.save()
        
        # Update lawyer-specific fields
        if hasattr(user, 'lawyer_profile') and user.role == 'LAWYER':
            if 'bio' in data:
                user.lawyer_profile.bio_en = data['bio']
            if 'specializations' in data:
                # Handle specializations update if needed
                pass
            user.lawyer_profile.save()
        
        # Update citizen-specific fields
        if hasattr(user, 'citizen_profile') and user.role == 'CITIZEN':
            # Handle citizen-specific updates
            pass
        
        user.save()
        
        # Return updated user data
        user_data = UserSerializer(user, context={'request': request}).data
        return Response(user_data)
        
    except Exception as e:
        import traceback
        print(f"Update profile error: {str(e)}")
        print(traceback.format_exc())
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'error': 'Old password and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.check_password(old_password):
        return Response(
            {'error': 'Invalid old password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password updated successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Verify user email with token
    """
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # In a real app, we would verify the token. 
    # For now, we'll just simulate success if the token looks valid-ish
    # or if we find a user with a matching "verification_token" (if we implemented that).
    
    # Mock implementation:
    return Response({'message': 'Email verified successfully', 'status': 'verified'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification_email(request):
    """
    Resend verification email
    """
    user = request.user
    if user.is_verified:
        return Response({'message': 'User is already verified'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Mock sending email
    print(f"Sending verification email to {user.email}")
    
    return Response({'message': 'Verification email sent'})


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request password reset link
    """
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        # Mock sending email
        print(f"Sending password reset email to {user.email}")
        return Response({'message': 'Password reset email sent'})
    except User.DoesNotExist:
        # Don't reveal user existence
        return Response({'message': 'Password reset email sent'})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    """
    Reset password with token
    """
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    user_id = request.data.get('user_id') # In real app, user is derived from token
    
    if not token or not new_password:
        return Response({'error': 'Token and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Mock implementation
    if user_id:
        try:
            user = User.objects.get(user_id=user_id)
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successfully'})
        except User.DoesNotExist:
            pass
            
    return Response({'message': 'Password reset successfully'})
