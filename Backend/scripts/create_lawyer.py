import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
django.setup()

from api.models import User, LawyerProfile

def create_lawyer():
    email = 'lawyer@example.com'
    password = 'LawyerPass123!'
    
    if User.objects.filter(email=email).exists():
        print(f"User {email} already exists.")
        user = User.objects.get(email=email)
        user.set_password(password)
        user.save()
        print("Password reset.")
    else:
        user = User.objects.create_user(
            email=email,
            password=password,
            phone_number='01700000001',
            role='LAWYER'
        )
        print(f"User {email} created.")

    # Ensure profile exists and is verified
    profile, created = LawyerProfile.objects.get_or_create(
        user=user,
        defaults={
            'bar_council_number': '12345',
            'license_issue_date': datetime.date(2020, 1, 1),
            'full_name_en': 'Test Lawyer',
            'full_name_bn': 'Test Lawyer',
            'verification_status': 'VERIFIED'
        }
    )
    
    if not created:
        profile.verification_status = 'VERIFIED'
        profile.save()
        
    print(f"Lawyer profile verified for {email}.")

if __name__ == '__main__':
    create_lawyer()
