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
from api.models import User, LawyerProfile, LegalSpecialization

BASE_URL = "http://localhost:8000/api"

def debug_profile_update():
    print("=" * 80)
    print("DEBUGGING PROFILE UPDATE")
    print("=" * 80)

    # 1. Register a Lawyer
    lawyer_email = f"lawyer_debug_{datetime.now().strftime('%H%M%S')}@test.com"
    print(f"\nRegistering lawyer {lawyer_email}...")
    
    reg_resp = requests.post(f"{BASE_URL}/auth/register/", json={
        "email": lawyer_email,
        "phone_number": f"015{datetime.now().strftime('%H%M%S')}77",
        "password": "Test123!",
        "name": "Debug Lawyer",
        "role": "LAWYER",
        "lawyerId": f"BAR-DBG-{datetime.now().strftime('%H%M%S')}"
    })
    
    if reg_resp.status_code != 201:
        with open('debug_reg_error.html', 'w', encoding='utf-8') as f:
            f.write(reg_resp.text)
        print(f"❌ Registration failed. Response saved to debug_reg_error.html")
        return
        
    token = reg_resp.json()['access']
    user_id = reg_resp.json()['user']['id']
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Registered and logged in. User ID: {user_id}")

    # 2. Update Profile
    print("\nUpdating profile with new fields...")
    update_data = {
        "bio": "This is an updated bio.",
        "location": "123 Legal Lane, Dhaka",
        "fees": 5000,
        "experience": 10,
        "specializations": "Criminal Law, Family Law"
    }
    
    # Using PATCH as per auth_views.py
    update_resp = requests.patch(f"{BASE_URL}/auth/profile/update/", json=update_data, headers=headers)
    
    print(f"Status Code: {update_resp.status_code}")
    
    if update_resp.status_code == 200:
        print("✅ API update successful")
    else:
        with open('debug_error.html', 'w', encoding='utf-8') as f:
            f.write(update_resp.text)
        print(f"❌ API update failed. Response saved to debug_error.html")

if __name__ == "__main__":
    debug_profile_update()
