import sys
import os
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
django.setup()

from api.models import User
from api.serializers import UserSerializer

def debug_citizen():
    email = "client@example.com" # Assuming this is the email based on "client@example"
    print(f"Checking user: {email}")
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        print(f"❌ User {email} not found!")
        # Try finding by name or partial email
        users = User.objects.filter(email__icontains="client")
        if users.exists():
            print("Found similar users:")
            for u in users:
                print(f" - {u.email} (Role: {u.role}, Verified: {u.is_verified})")
            user = users.first()
        else:
            return

    print(f"\nUser Details:")
    print(f" - ID: {user.user_id}")
    print(f" - Role: {user.role}")
    print(f" - Is Verified: {user.is_verified}")
    
    serializer = UserSerializer(user)
    print(f" - Serialized Status: {serializer.data.get('verification_status')}")

    if user.is_verified:
        print("\nUser is already verified. Attempting to un-verify for testing...")
        user.is_verified = False
        user.save()
        print(" - Set is_verified = False")
    
    print("\nAttempting to VERIFY user programmatically...")
    user.is_verified = True
    user.save()
    print(" - Set is_verified = True")
    
    user.refresh_from_db()
    print(f" - New Is Verified: {user.is_verified}")
    
    serializer = UserSerializer(user)
    print(f" - New Serialized Status: {serializer.data.get('verification_status')}")
    
    if serializer.data.get('verification_status') == 'VERIFIED':
        print("\n✅ Backend logic works. The issue might be in the API view or Frontend.")
    else:
        print("\n❌ Backend logic FAILED. Serializer still returning PENDING?")

if __name__ == "__main__":
    debug_citizen()
