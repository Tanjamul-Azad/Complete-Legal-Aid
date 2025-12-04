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

def test_profile_update():
    print("=" * 80)
    print("TESTING LAWYER PROFILE UPDATE")
    print("=" * 80)

    # 1. Register a Lawyer
    lawyer_email = f"lawyer_update_{datetime.now().strftime('%H%M%S')}@test.com"
    print(f"\nRegistering lawyer {lawyer_email}...")
    
    reg_resp = requests.post(f"{BASE_URL}/auth/register/", json={
        "email": lawyer_email,
        "phone_number": f"016{datetime.now().strftime('%H%M%S')}99",
        "password": "Test123!",
        "name": "Update Test Lawyer",
        "role": "LAWYER",
        "lawyerId": f"BAR-UPD-{datetime.now().strftime('%H%M%S')}"
    })
    
    if reg_resp.status_code != 201:
        print(f"❌ Registration failed: {reg_resp.text}")
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
        resp_data = update_resp.json()
        print(f"Response keys: {resp_data.keys()}")
        if 'profile' in resp_data:
            p_data = resp_data['profile']
            print(f"Profile keys: {p_data.keys()}")
            
            # Check if fields are present in response
            if 'bio_en' in p_data and p_data['bio_en'] == update_data['bio']:
                print("✅ Response contains updated bio")
            else:
                print(f"❌ Response missing or incorrect bio: {p_data.get('bio_en')}")

            if 'chamber_address' in p_data and p_data['chamber_address'] == update_data['location']:
                 print("✅ Response contains updated location")
            else:
                 print(f"❌ Response missing or incorrect location: {p_data.get('chamber_address')}")
                 
            if 'consultation_fee_online' in p_data and float(p_data['consultation_fee_online']) == float(update_data['fees']):
                 print("✅ Response contains updated fees")
            else:
                 print(f"❌ Response missing or incorrect fees: {p_data.get('consultation_fee_online')}")
        else:
            print("❌ Response missing 'profile' key")
        
        # 3. Verify in DB
        print("\nVerifying in Database...")
        lawyer = User.objects.get(user_id=user_id)
        profile = lawyer.lawyer_profile
        
        print(f" - Bio: {profile.bio_en}")
        print(f" - Location: {profile.chamber_address}")
        print(f" - Fees: {profile.consultation_fee_online}")
        print(f" - License Date: {profile.license_issue_date}")
        
        # Check specializations
        specs = profile.lawyerspecializationmap_set.all()
        spec_names = [s.specialization.name_en for s in specs]
        print(f" - Specializations: {', '.join(spec_names)}")
        
        # Assertions
        if profile.bio_en == "This is an updated bio.":
            print("✅ Bio updated")
        else:
            print("❌ Bio mismatch")
            
        if profile.chamber_address == "123 Legal Lane, Dhaka":
            print("✅ Location updated")
        else:
            print("❌ Location mismatch")
            
        if profile.consultation_fee_online == 5000.00:
            print("✅ Fees updated")
        else:
            print(f"❌ Fees mismatch: {profile.consultation_fee_online}")
            
        if "Criminal Law" in spec_names and "Family Law" in spec_names:
            print("✅ Specializations updated")
        else:
            print("❌ Specializations mismatch")
            
        # Check experience calculation (approximate)
        if profile.license_issue_date.year == datetime.now().year - 10:
             print("✅ Experience (License Date) calculated correctly")
        else:
             print(f"❌ Experience mismatch: {profile.license_issue_date}")

    else:
        with open('error_response.html', 'w', encoding='utf-8') as f:
            f.write(update_resp.text)
        print(f"❌ API update failed. Response saved to error_response.html")

if __name__ == "__main__":
    test_profile_update()
