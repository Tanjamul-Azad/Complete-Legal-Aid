import requests
import json

# Test the registration endpoint directly
url = "http://localhost:8000/api/auth/register/"

# Test data
test_lawyer = {
    "email": "newlawyer@test.com",
    "phone_number": "01712345678",
    "password": "Test123!",
    "name": "New Test Lawyer",
    "role": "LAWYER",
    "lawyerId": "BAR12345678",
    "specializations": "divorce",
    "language": "EN"
}

print("=" * 80)
print("Testing Lawyer Registration via Direct API Call")
print("=" * 80)
print(f"\nTest Data:")
print(json.dumps(test_lawyer, indent=2))
print("\n" + "=" * 80)

try:
    response = requests.post(url, json=test_lawyer)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"\nResponse:")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 201:
        print("\n✅ SUCCESS: Registration completed successfully!")
    elif response.status_code == 400:
        error_msg = response.json().get('error', '')
        if 'already exists' in error_msg.lower():
            print(f"\n❌ ISSUE: {error_msg}")
            print("\nThis might be a duplicate test. Try with a different email or run:")
            print(f"python check_users.py delete {test_lawyer['email']}")
        else:
            print(f"\n⚠️ VALIDATION ERROR: {error_msg}")
    else:
        print(f"\n⚠️ UNEXPECTED RESPONSE")
        
except requests.exceptions.ConnectionError:
    print("\n❌ ERROR: Cannot connect to backend server")
    print("Make sure the backend is running on http://localhost:8000")
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
