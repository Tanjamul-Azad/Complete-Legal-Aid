import requests
import json
import sys
import os
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
django.setup()

from api.models import User

BASE_URL = "http://localhost:8000/api"

def verify_fixes():
    print("=" * 80)
    print("VERIFYING FIXES")
    print("=" * 80)

    # 1. Find the Lawyer "Tanjamul Azad"
    name_query = "Tanjamul Azad"
    users = User.objects.filter(lawyer_profile__full_name_en__icontains=name_query)
    
    if not users.exists():
        print("❌ Lawyer not found (unexpected, as previous script found him)")
        return
    
    lawyer = users.first()
    print(f"Lawyer: {lawyer.lawyer_profile.full_name_en}")
    print(f"User ID: {lawyer.user_id}")

    # 2. Login as Lawyer (to get token)
    # We don't know the password, so we'll force a token generation or just use a superuser if we had one.
    # Actually, we can just use the debug script approach but hit the API.
    # Wait, I can't login without password.
    # But I can inspect the Serializer output directly using Django shell logic!
    
    from api.serializers import ConsultationBookingSerializer
    from api.models import ConsultationBooking
    
    booking = ConsultationBooking.objects.filter(lawyer__user=lawyer).first()
    if not booking:
        print("❌ No bookings found for this lawyer.")
        return

    print(f"\nTesting Serializer for Booking ID: {booking.booking_id}")
    serializer = ConsultationBookingSerializer(booking)
    data = serializer.data
    
    print("Serialized Data Keys:", data.keys())
    
    if 'lawyer_user_id' in data:
        print(f"✅ 'lawyer_user_id' is present: {data['lawyer_user_id']}")
        if str(data['lawyer_user_id']) == str(lawyer.user_id):
            print("✅ 'lawyer_user_id' matches Lawyer User ID.")
        else:
            print(f"❌ 'lawyer_user_id' mismatch! Expected {lawyer.user_id}, got {data['lawyer_user_id']}")
    else:
        print("❌ 'lawyer_user_id' is MISSING from serializer output.")

if __name__ == "__main__":
    verify_fixes()
