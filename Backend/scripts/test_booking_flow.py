import requests
import json
import sys
import os
from datetime import datetime, timedelta

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
import django
django.setup()
from api.models import User, LawyerAvailabilitySlot, ConsultationBooking

BASE_URL = "http://localhost:8000/api"

def test_booking_flow():
    print("=" * 80)
    print("TESTING BOOKING FLOW")
    print("=" * 80)

    # 1. Register Lawyer
    lawyer_email = f"lawyer_book_{datetime.now().strftime('%H%M%S')}@test.com"
    print(f"\nRegistering lawyer {lawyer_email}...")
    lawyer_resp = requests.post(f"{BASE_URL}/auth/register/", json={
        "email": lawyer_email,
        "phone_number": f"017{datetime.now().strftime('%H%M%S')}88",
        "password": "Test123!",
        "name": "Booking Lawyer",
        "role": "LAWYER",
        "lawyerId": f"BAR-BOOK-{datetime.now().strftime('%H%M%S')}"
    })
    if lawyer_resp.status_code != 201:
        print(f"❌ Lawyer registration failed: {lawyer_resp.text}")
        return
    lawyer_token = lawyer_resp.json()['access']
    lawyer_id = lawyer_resp.json()['user']['id']
    lawyer_headers = {"Authorization": f"Bearer {lawyer_token}"}
    print(f"✅ Lawyer registered. ID: {lawyer_id}")

    # 2. Update Lawyer Schedule
    print("\nUpdating Lawyer Schedule...")
    schedule_payload = {
        "schedule": {
            "Monday": {"active": True, "start": "09:00", "end": "17:00"},
            "Tuesday": {"active": True, "start": "09:00", "end": "17:00"},
            "Wednesday": {"active": True, "start": "09:00", "end": "17:00"},
            "Thursday": {"active": True, "start": "09:00", "end": "17:00"},
            "Friday": {"active": True, "start": "09:00", "end": "17:00"},
            "Saturday": {"active": True, "start": "09:00", "end": "17:00"},
            "Sunday": {"active": True, "start": "09:00", "end": "17:00"}
        }
    }
    requests.post(f"{BASE_URL}/lawyer-profiles/update-schedule/", json=schedule_payload, headers=lawyer_headers)
    print("✅ Schedule updated.")

    # 3. Register Citizen
    citizen_email = f"citizen_book_{datetime.now().strftime('%H%M%S')}@test.com"
    print(f"\nRegistering citizen {citizen_email}...")
    citizen_resp = requests.post(f"{BASE_URL}/auth/register/", json={
        "email": citizen_email,
        "phone_number": f"018{datetime.now().strftime('%H%M%S')}99",
        "password": "Test123!",
        "name": "Booking Citizen",
        "role": "CITIZEN"
    })
    if citizen_resp.status_code != 201:
        print(f"❌ Citizen registration failed: {citizen_resp.text}")
        return
    citizen_token = citizen_resp.json()['access']
    citizen_id = citizen_resp.json()['user']['id']
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}
    print(f"✅ Citizen registered. ID: {citizen_id}")

    # 4. Book Appointment
    print("\nBooking Appointment...")
    # Calculate next Monday
    today = datetime.now()
    days_ahead = 0 - today.weekday() if today.weekday() <= 0 else 7 - today.weekday()
    if days_ahead <= 0: days_ahead += 7
    next_monday = today + timedelta(days=days_ahead)
    booking_date = next_monday.strftime('%Y-%m-%d')
    booking_time = "10:00" # 10 AM

    booking_payload = {
        "lawyer": lawyer_id, # The serializer expects lawyer ID (user ID or profile ID?) - let's try user ID first as per service
        "citizen": citizen_id,
        "scheduled_start": f"{booking_date}T{booking_time}:00Z",
        "scheduled_end": f"{booking_date}T11:00:00Z",
        "title": "Legal Consultation",
        "status": "PENDING",
        "meeting_link": "http://meet.google.com/abc-defg-hij"
    }
    
    # Note: The frontend service sends `lawyer` as ID. The backend serializer expects `lawyer` to be a PrimaryKeyRelatedField to LawyerProfile.
    # But `lawyer_id` from register response is the User ID.
    # We need to get the LawyerProfile ID.
    
    lawyer_profile_resp = requests.get(f"{BASE_URL}/lawyer-profiles/?user={lawyer_id}", headers=lawyer_headers)
    if lawyer_profile_resp.status_code == 200 and len(lawyer_profile_resp.json()['results']) > 0:
        lawyer_profile_id = lawyer_profile_resp.json()['results'][0]['profile_id']
        booking_payload['lawyer'] = lawyer_profile_id
        print(f"✅ Found Lawyer Profile ID: {lawyer_profile_id}")
    else:
        # Fallback: try to fetch profile directly if endpoint allows or assume user ID might work if serializer is smart (unlikely)
        # Let's try to get profile from user object if possible or just fail
        print("⚠️ Could not fetch lawyer profile ID via list. Trying to use User ID (might fail).")
        # Actually, let's try to get it from the login response if it was there, or just fetch the user details
        user_details = requests.get(f"{BASE_URL}/auth/users/{lawyer_id}/", headers=lawyer_headers).json()
        if 'lawyer_profile' in user_details:
             # This might be a dict or ID depending on serializer
             pass

    booking_resp = requests.post(f"{BASE_URL}/consultation-bookings/", json=booking_payload, headers=citizen_headers)
    
    if booking_resp.status_code != 201:
        print(f"❌ Booking failed: {booking_resp.text}")
        return
    
    booking_id = booking_resp.json()['booking_id']
    print(f"✅ Appointment booked. ID: {booking_id}")

    # 5. Verify Lawyer Can See Appointment
    print("\nVerifying Lawyer View...")
    # Lawyer fetches their appointments
    lawyer_appts_resp = requests.get(f"{BASE_URL}/consultation-bookings/?lawyerId={lawyer_id}", headers=lawyer_headers)
    
    if lawyer_appts_resp.status_code == 200:
        appts = lawyer_appts_resp.json()['results']
        print(f"Found {len(appts)} appointments for lawyer.")
        found = False
        for appt in appts:
            if appt['booking_id'] == booking_id:
                found = True
                print(f"✅ Found booking {booking_id} in lawyer's list.")
                print(f" - Title: {appt['title']}")
                print(f" - Client: {appt['citizen_name'] if 'citizen_name' in appt else appt['citizen']}")
                break
        if not found:
            print("❌ Booking NOT found in lawyer's list.")
    else:
        print(f"❌ Failed to fetch lawyer appointments: {lawyer_appts_resp.text}")

if __name__ == "__main__":
    test_booking_flow()
