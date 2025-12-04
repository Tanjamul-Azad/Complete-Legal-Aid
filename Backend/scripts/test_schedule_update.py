import requests
import json
import sys
import os
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
import django
django.setup()
from api.models import User, LawyerAvailabilitySlot

BASE_URL = "http://localhost:8000/api"

def test_schedule_update():
    print("=" * 80)
    print("TESTING LAWYER SCHEDULE UPDATE")
    print("=" * 80)

    # 1. Register a Lawyer
    lawyer_email = f"lawyer_sched_{datetime.now().strftime('%H%M%S')}@test.com"
    print(f"\nRegistering lawyer {lawyer_email}...")
    
    reg_resp = requests.post(f"{BASE_URL}/auth/register/", json={
        "email": lawyer_email,
        "phone_number": f"016{datetime.now().strftime('%H%M%S')}88",
        "password": "Test123!",
        "name": "Schedule Lawyer",
        "role": "LAWYER",
        "lawyerId": f"BAR-SCH-{datetime.now().strftime('%H%M%S')}"
    })
    
    if reg_resp.status_code != 201:
        print(f"❌ Registration failed: {reg_resp.text}")
        return
        
    token = reg_resp.json()['access']
    user_id = reg_resp.json()['user']['id']
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Registered and logged in. User ID: {user_id}")

    # 2. Update Schedule
    print("\nUpdating schedule...")
    schedule_payload = {
        "schedule": {
            "Monday": {"active": True, "start": "09:00", "end": "17:00"},
            "Wednesday": {"active": True, "start": "10:00", "end": "14:00"},
            "Friday": {"active": False, "start": "09:00", "end": "17:00"} # Should be ignored
        }
    }
    
    update_resp = requests.post(f"{BASE_URL}/lawyer-profiles/update-schedule/", json=schedule_payload, headers=headers)
    
    if update_resp.status_code == 200:
        print("✅ API update successful")
    else:
        print(f"❌ API update failed: {update_resp.text}")
        return

    # 3. Verify in Database
    print("\nVerifying in Database...")
    lawyer_user = User.objects.get(user_id=user_id)
    profile = lawyer_user.lawyer_profile
    slots = LawyerAvailabilitySlot.objects.filter(lawyer=profile)
    
    print(f"Found {slots.count()} slots.")
    if slots.count() == 2:
        print("✅ Correct number of slots created")
    else:
        print(f"❌ Incorrect number of slots: {slots.count()} (Expected 2)")

    for slot in slots:
        day_name = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][slot.day_of_week]
        print(f" - {day_name}: {slot.start_time} - {slot.end_time}")

    # 4. Verify Public Profile Visibility (Citizen View)
    print("\nVerifying Public Profile Visibility...")
    # Fetch profile using public endpoint (or just user endpoint if public access is allowed)
    # Assuming /lawyer-profiles/{id}/ is public or accessible to authenticated users
    
    # Let's try fetching as the lawyer themselves first to check the serializer output
    profile_resp = requests.get(f"{BASE_URL}/lawyer-profiles/{profile.profile_id}/", headers=headers)
    
    if profile_resp.status_code == 200:
        p_data = profile_resp.json()
        print(f"Profile Availability Keys: {p_data.get('availability', {}).keys()}")
        
        # Check if availability is populated (Note: get_availability generates dates, not just raw slots)
        availability = p_data.get('availability', {})
        if availability:
             print("✅ Availability field is populated in profile response")
             # Check if we have dates
             first_date = list(availability.keys())[0]
             print(f" - Sample Date: {first_date}, Slots: {availability[first_date]}")
        else:
             print("⚠️ Availability field is empty (might be due to date generation logic or no slots for next 30 days)")
             
    else:
        print(f"❌ Failed to fetch profile: {profile_resp.text}")

if __name__ == "__main__":
    test_schedule_update()
