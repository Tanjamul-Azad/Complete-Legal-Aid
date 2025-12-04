import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
django.setup()

from api.models import User

# Check if admin user exists
email = 'admin@cla.bd'
password = 'admin123'

try:
    admin = User.objects.filter(email=email).first()
    if admin:
        print(f"✓ User found!")
        print(f"  Email: {admin.email}")
        print(f"  Role: {admin.role}")
        print(f"  Is staff: {admin.is_staff}")
        print(f"  Is superuser: {admin.is_superuser}")
        print(f"  Is active: {admin.is_active}")
        print(f"  Password valid: {admin.check_password(password)}")
        print(f"\n  Trying alternate password...")
        print(f"  Password 'admin123' valid: {admin.check_password('admin123')}")
    else:
        print(f"✗ No user found with email: {email}")
        print("\nExisting users:")
        for user in User.objects.all()[:5]:
            print(f"  - {user.email} (Role: {user.role})")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
