import requests
import json
import sys
import os
from datetime import datetime

# Setup Django environment to access models directly for verification step
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
import django
django.setup()
from api.models import User

BASE_URL = "http://localhost:8000/api"

def test_verification_flow():
    print("=" * 80)
    print("TESTING LAWYER VERIFICATION FLOW")
    print("=" * 80)

    # 1. Register a new lawyer
    email = f"verify_test_{datetime.now().strftime('%H%M%S')}@test.com"
    password = "Test123!"
    
    print(f"\n1. Registering new lawyer: {email}")
    register_data = {
        "email": email,
        "phone_number": f"017{datetime.now().strftime('%H%M%S')}99",
        "password": password,
        "name": "Verification Test Lawyer",
        "role": "LAWYER",
        "lawyerId": f"BAR{datetime.now().strftime('%H%M%S')}",
        "specializations": "civil-law"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/register/", json=register_data)
        if resp.status_code != 201:
            print(f"❌ Registration failed: {resp.text}")
            return
        print("✅ Registration successful")
        
        # 2. Login
        print("\n2. Logging in...")
        login_data = {"identifier": email, "password": password}
        resp = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        
        if resp.status_code != 200:
            print(f"❌ Login failed: {resp.text}")
            return
            
        data = resp.json()
        token = data['access']
        status = data.get('verification_status')
        
        print(f"✅ Login successful")
        print(f"   Verification Status in response: {status}")
        
        if status != 'PENDING':
            print(f"❌ Expected PENDING, got {status}")
            return
            
        # 3. Try to access Dashboard (Should FAIL)
        print("\n3. Attempting to access Dashboard (Should be BLOCKED)...")
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/dashboard/lawyer/", headers=headers)
        
        print(f"   Status Code: {resp.status_code}")
        if resp.status_code == 403:
            print("✅ CORRECT! Access denied (403 Forbidden)")
            print(f"   Error: {resp.json().get('error')}")
        else:
            print(f"❌ FAILED! Expected 403, got {resp.status_code}")
            return

        # 4. Verify the lawyer (Simulating Admin Action)
        print("\n4. Verifying lawyer via Admin Action...")
        user = User.objects.get(email=email)
        profile = user.lawyer_profile
        profile.verification_status = 'VERIFIED'
        profile.save()
        print(f"✅ Lawyer {email} marked as VERIFIED in DB")

        # 5. Try to access Dashboard again (Should SUCCEED)
        print("\n5. Attempting to access Dashboard again (Should SUCCEED)...")
        resp = requests.get(f"{BASE_URL}/dashboard/lawyer/", headers=headers)
        
        print(f"   Status Code: {resp.status_code}")
        if resp.status_code == 200:
            print("✅ SUCCESS! Dashboard access granted")
        else:
            print(f"❌ FAILED! Expected 200, got {resp.status_code}")
            print(resp.text)

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_verification_flow()
