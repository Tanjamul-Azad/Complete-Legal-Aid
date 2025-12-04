#!/usr/bin/env python
"""
Utility script to check and optionally clean up users in the database.
This can help identify duplicate or test users causing registration issues.
"""
import os
import django
import sys

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cla_backend.settings')
django.setup()

from api.models import User, LawyerProfile, CitizenProfile

def list_all_users():
    """List all users in the database"""
    users = User.objects.all().order_by('-created_at')
    print(f"\n{'='*80}")
    print(f"Total Users in Database: {users.count()}")
    print(f"{'='*80}\n")
    
    for user in users:
        profile_type = "NONE"
        if hasattr(user, 'citizen_profile'):
            profile_type = "CITIZEN"
        elif hasattr(user, 'lawyer_profile'):
            profile_type = "LAWYER"
        elif hasattr(user, 'admin_profile'):
            profile_type = "ADMIN"
        
        print(f"User ID: {user.user_id}")
        print(f"  Email: {user.email}")
        print(f"  Phone: {user.phone_number}")
        print(f"  Role: {user.role}")
        print(f"  Profile: {profile_type}")
        print(f"  Active: {user.is_active}")
        print(f"  Verified: {user.is_verified}")
        print(f"  Created: {user.created_at}")
        print("-" * 80)

def check_email(email):
    """Check if a specific email exists in the database"""
    from django.contrib.auth.models import BaseUserManager
    normalized_email = BaseUserManager.normalize_email(email.strip())
    
    print(f"\nSearching for email: {email}")
    print(f"Normalized email: {normalized_email}\n")
    
    # Case-sensitive search
    exact_match = User.objects.filter(email=email)
    print(f"Exact match (case-sensitive): {exact_match.count()} found")
    if exact_match.exists():
        for user in exact_match:
            print(f"  - {user.email} (ID: {user.user_id})")
    
    # Case-insensitive search
    case_insensitive_match = User.objects.filter(email__iexact=normalized_email)
    print(f"\nCase-insensitive match: {case_insensitive_match.count()} found")
    if case_insensitive_match.exists():
        for user in case_insensitive_match:
            print(f"  - {user.email} (ID: {user.user_id}, Created: {user.created_at})")

def delete_user_by_email(email):
    """Delete a user by email (use with caution!)"""
    from django.contrib.auth.models import BaseUserManager
    normalized_email = BaseUserManager.normalize_email(email.strip())
    
    users = User.objects.filter(email__iexact=normalized_email)
    count = users.count()
    
    if count == 0:
        print(f"No users found with email: {email}")
        return
    
    print(f"\nFound {count} user(s) with email: {email}")
    for user in users:
        print(f"  - {user.email} (ID: {user.user_id}, Role: {user.role})")
    
    confirm = input(f"\nAre you sure you want to delete {count} user(s)? (yes/no): ")
    if confirm.lower() == 'yes':
        users.delete()
        print(f"✓ Deleted {count} user(s)")
    else:
        print("Deletion cancelled")

def verify_user_by_email(email):
    """Verify a lawyer user by email"""
    from django.contrib.auth.models import BaseUserManager
    normalized_email = BaseUserManager.normalize_email(email.strip())
    
    try:
        user = User.objects.get(email__iexact=normalized_email)
    except User.DoesNotExist:
        print(f"No user found with email: {email}")
        return

    print(f"\nFound user: {user.email} (Role: {user.role})")
    
    if user.role != 'LAWYER':
        print("User is not a lawyer. Only lawyers need manual verification.")
        return

    if not hasattr(user, 'lawyer_profile'):
        print("User has no lawyer profile!")
        return
        
    profile = user.lawyer_profile
    print(f"Current status: {profile.verification_status}")
    
    if profile.verification_status == 'VERIFIED':
        print("Lawyer is already verified.")
        return

    confirm = input(f"Verify this lawyer? (yes/no): ")
    if confirm.lower() == 'yes':
        profile.verification_status = 'VERIFIED'
        profile.save()
        user.is_verified = True
        user.save()
        print(f"✓ Lawyer {user.email} is now VERIFIED")
    else:
        print("Verification cancelled")

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python check_users.py list                    - List all users")
        print("  python check_users.py check <email>           - Check if email exists")
        print("  python check_users.py verify <email>          - Verify a lawyer")
        print("  python check_users.py delete <email>          - Delete user by email")
        return
    
    command = sys.argv[1]
    
    if command == "list":
        list_all_users()
    elif command == "check" and len(sys.argv) >= 3:
        check_email(sys.argv[2])
    elif command == "verify" and len(sys.argv) >= 3:
        verify_user_by_email(sys.argv[2])
    elif command == "delete" and len(sys.argv) >= 3:
        delete_user_by_email(sys.argv[2])
    else:
        print("Invalid command or missing arguments")

if __name__ == "__main__":
    main()
