import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
django.setup()

from api.models import User

# Create superuser
email = 'ahbab.md@gmail.com'
phone_number = '01700000000'  # Placeholder phone number
password = 'ahbab2018'

# Check if user already exists
if User.objects.filter(email=email).exists():
    print(f"Superuser with email {email} already exists!")
else:
    # Create superuser
    user = User.objects.create_superuser(
        email=email,
        phone_number=phone_number,
        password=password
    )
    user.name = 'Ahbab'
    user.role = 'ADMIN'
    user.save()
    print(f"Superuser created successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"You can now login to the admin panel at http://localhost:8000/admin/")
