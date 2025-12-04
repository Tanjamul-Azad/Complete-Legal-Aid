import requests
import json
import sys
import os
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
django.setup()

from api.models import ConsultationBooking
from api.serializers import ConsultationBookingSerializer

def verify_enriched_data():
    print("=" * 80)
    print("VERIFYING ENRICHED APPOINTMENT DATA")
    print("=" * 80)

    # Get the last booking
    booking = ConsultationBooking.objects.last()
    if not booking:
        print("❌ No bookings found.")
        return

    print(f"Testing Serializer for Booking ID: {booking.booking_id}")
    
    # Mock request context for avatar URL generation
    from django.test.client import RequestFactory
    factory = RequestFactory()
    request = factory.get('/')
    
    serializer = ConsultationBookingSerializer(booking, context={'request': request})
    data = serializer.data
    
    print("\n[Checked Fields]")
    
    fields_to_check = [
        'citizen_name', 'citizen_email', 'citizen_avatar',
        'lawyer_name', 'lawyer_avatar', 'lawyer_specialization'
    ]
    
    all_present = True
    for field in fields_to_check:
        if field in data:
            print(f"✅ {field}: {data[field]}")
        else:
            print(f"❌ {field} is MISSING")
            all_present = False
            
    if all_present:
        print("\n✅ All enriched fields are present!")
    else:
        print("\n❌ Some fields are missing.")

if __name__ == "__main__":
    verify_enriched_data()
