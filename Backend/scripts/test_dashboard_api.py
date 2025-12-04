import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
EMAIL = "newlawyer@test.com"
PASSWORD = "Test123!"  # Assuming this is the password used in previous tests

def test_dashboard_api():
    print("=" * 50)
    print("TESTING LAWYER DASHBOARD API")
    print("=" * 50)

    # 1. Login to get token
    print(f"\nLogging in as {EMAIL}...")
    login_payload = {
        "identifier": EMAIL,
        "password": PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_payload)
        
        if response.status_code != 200:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
            return

        data = response.json()
        access_token = data['access']
        print("✅ Login successful")
        
        # 2. Call Dashboard Endpoint
        print("\nFetching dashboard data...")
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        dash_response = requests.get(f"{BASE_URL}/dashboard/lawyer/", headers=headers)
        
        if dash_response.status_code == 200:
            dash_data = dash_response.json()
            print("\n✅ API Call Successful!")
            print("\n--- Response Data ---")
            print(json.dumps(dash_data, indent=2))
            
            # Basic validation
            if 'stats' in dash_data and 'case_overview' in dash_data:
                print("\n✅ Structure validation passed")
            else:
                print("\n❌ Structure validation failed")
                
        else:
            print(f"\n❌ API Call Failed: {dash_response.status_code}")
            print(dash_response.text)

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    test_dashboard_api()
