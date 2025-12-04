import requests
import json
import sys
import os
import django
from django.db.models import Q

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
django.setup()

from api.models import User, ConsultationBooking, Case

def debug_user_data():
    print("=" * 80)
    print("DEBUGGING USER DATA")
    print("=" * 80)

    # 1. Find User
    name_query = "Tanjamul Azad"
    print(f"Searching for user with name '{name_query}'...")
    
    users = User.objects.filter(
        Q(lawyer_profile__full_name_en__icontains=name_query) | 
        Q(citizen_profile__full_name_en__icontains=name_query)
    )
    
    if not users.exists():
        print(f"❌ No user found with name '{name_query}'")
        # List all users
        for u in User.objects.all():
            name = "Unknown"
            if hasattr(u, 'lawyer_profile'): name = u.lawyer_profile.full_name_en
            elif hasattr(u, 'citizen_profile'): name = u.citizen_profile.full_name_en
            print(f" - {u.email}: {name}")
        return

    for user in users:
        name = "Unknown"
        if hasattr(user, 'lawyer_profile'): name = user.lawyer_profile.full_name_en
        elif hasattr(user, 'citizen_profile'): name = user.citizen_profile.full_name_en
        
        print(f"\nFound User: {name} ({user.role})")
        print(f"ID: {user.user_id}")
        print(f"Email: {user.email}")
        
        # 2. Check Appointments (Backend Query)
        print("\n[Backend Query] Checking Appointments...")
        # Mimic ViewSet logic
        bookings = ConsultationBooking.objects.filter(
            Q(lawyer__user=user) | Q(lawyer__profile_id=user.user_id)
        )
        print(f"Found {bookings.count()} bookings in DB.")
        for b in bookings:
            print(f" - ID: {b.booking_id}")
            print(f"   Date: {b.scheduled_start}")
            print(f"   Client: {b.citizen.name}")
            print(f"   Lawyer Profile ID: {b.lawyer.profile_id}")
            print(f"   Lawyer User ID: {b.lawyer.user.user_id}")

        # 3. Check Cases
        print("\n[Backend Query] Checking Cases...")
        cases = Case.objects.filter(lawyer=user.lawyer_profile if hasattr(user, 'lawyer_profile') else None)
        print(f"Found {cases.count()} cases in DB.")

if __name__ == "__main__":
    debug_user_data()
