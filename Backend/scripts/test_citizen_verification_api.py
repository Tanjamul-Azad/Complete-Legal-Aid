import requests
import json
import sys
import os

# Setup Django environment to get user ID
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
import django
django.setup()
from api.models import User

BASE_URL = "http://localhost:8000/api"

def test_citizen_api():
    print("=" * 80)
    print("TESTING CITIZEN VERIFICATION API")
    print("=" * 80)

    # 1. Get Client User
    try:
        client = User.objects.get(email="client@example.com")
        print(f"✅ Found client: {client.email} ({client.user_id})")
        # Reset to unverified
        client.is_verified = False
        client.save()
        print(" - Reset is_verified to False")
    except User.DoesNotExist:
        print("❌ client@example.com not found")
        return

    # 2. Login as Admin
    print("\nLogging in as Admin...")
    # Assuming standard admin credentials or creating one
    admin_email = "admin@example.com" # Try generic admin
    admin_pass = "Admin123!" # Try generic pass
    
    # Try to find a valid admin
    admin = User.objects.filter(role='ADMIN').first()
    if admin:
        print(f"Found admin: {admin.email}")
        # Reset password to known one if needed, but let's try to use existing session or create temp admin
        # Actually, let's just create a temp admin to be sure
        temp_admin_email = "temp_admin_debug@cla.com"
        try:
            User.objects.get(email=temp_admin_email).delete()
        except:
            pass
        
        User.objects.create_superuser(
            email=temp_admin_email,
            password="TempPass123!",
            phone_number="01999999999"
        )
        admin_email = temp_admin_email
        admin_pass = "TempPass123!"
    else:
        print("No admin found, creating one...")
        # ... (create admin logic)

    login_resp = requests.post(f"{BASE_URL}/auth/login/", json={
        "identifier": admin_email,
        "password": admin_pass
    })
    
    if login_resp.status_code != 200:
        print(f"❌ Admin login failed: {login_resp.text}")
        return
        
    token = login_resp.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Admin login successful")

    # 3. Verify Client via API
    print(f"\nVerifying client {client.user_id} via API...")
    resp = requests.post(
        f"{BASE_URL}/users/{client.user_id}/verification/",
        json={"status": "VERIFIED"},
        headers=headers
    )
    
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.text}")
    
    if resp.status_code == 200:
        data = resp.json()
        if data.get('verification_status') == 'VERIFIED':
            print("✅ API returned VERIFIED status")
        else:
            print(f"❌ API returned status: {data.get('verification_status')}")
            
        client.refresh_from_db()
        if client.is_verified:
            print("✅ DB confirms is_verified=True")
        else:
            print("❌ DB shows is_verified=False")
    else:
        print("❌ API call failed")

if __name__ == "__main__":
    test_citizen_api()
