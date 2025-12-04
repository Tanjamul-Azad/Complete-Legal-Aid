import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
django.setup()

from api.models import User

# Create superuser
email = 'admin@cla.bd'
phone_number = '01700000000'  # Placeholder phone number
password = 'admin123'

# Check if user already exists
if User.objects.filter(email=email).exists():
    print(f"Superuser with email {email} already exists!")
    user = User.objects.get(email=email)
    user.set_password(password)
    user.save()
    print(f"Password updated to: {password}")

elif User.objects.filter(phone_number=phone_number).exists():
    print(f"User with phone {phone_number} already exists. Updating to admin...")
    user = User.objects.get(phone_number=phone_number)
    user.email = email
    user.set_password(password)
    user.name = 'Admin'
    user.role = 'ADMIN'
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print(f"User updated successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")

else:
    # Create superuser
    user = User.objects.create_superuser(
        email=email,
        phone_number=phone_number,
        password=password
    )
    user.name = 'Admin'
    user.role = 'ADMIN'
    user.save()
    print(f"Superuser created successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"You can now login to the admin panel at http://localhost:8000/admin/")
