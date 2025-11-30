from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import (
    User,
    LawyerProfile,
    LegalSpecialization,
    LawyerSpecializationMap,
)


class Command(BaseCommand):
    help = 'Seed baseline legal specializations and lawyer profiles'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding legal specializations...'))
        specializations = [
            {'name_en': 'Family Law', 'name_bn': 'পারিবারিক আইন', 'slug': 'family-law'},
            {'name_en': 'Criminal Defense', 'name_bn': 'ফৌজদারি আইন', 'slug': 'criminal-defense'},
            {'name_en': 'Property & Land', 'name_bn': 'সম্পত্তি আইন', 'slug': 'property-law'},
            {'name_en': 'Corporate & Tax', 'name_bn': 'কর্পোরেট আইন', 'slug': 'corporate-law'},
        ]
        spec_lookup = {}
        for spec in specializations:
            obj, _ = LegalSpecialization.objects.update_or_create(
                slug=spec['slug'],
                defaults={
                    'name_en': spec['name_en'],
                    'name_bn': spec['name_bn'],
                    'description_en': f'{spec["name_en"]} related matters.',
                    'description_bn': spec['name_bn'],
                    'is_active': True,
                },
            )
            spec_lookup[spec['slug']] = obj

        self.stdout.write(self.style.NOTICE('Seeding lawyer profiles...'))
        lawyers = [
            {
                'email': 'farhana.siddiqui@example.com',
                'phone': '01710000001',
                'name': 'Farhana Siddiqui',
                'bio': '12+ years advocating for women and children in family disputes.',
                'location': 'Dhaka, Bangladesh',
                'fee': 2500,
                'experience_years': 12,
                'specializations': ['family-law'],
            },
            {
                'email': 'anik.chowdhury@example.com',
                'phone': '01710000002',
                'name': 'Anik Chowdhury',
                'bio': 'Former public prosecutor focusing on criminal litigation and appeals.',
                'location': 'Chittagong, Bangladesh',
                'fee': 3000,
                'experience_years': 15,
                'specializations': ['criminal-defense'],
            },
            {
                'email': 'labib.rahman@example.com',
                'phone': '01710000003',
                'name': 'Labib Rahman',
                'bio': 'Property and land rights specialist helping resolve title disputes.',
                'location': 'Sylhet, Bangladesh',
                'fee': 2200,
                'experience_years': 10,
                'specializations': ['property-law'],
            },
            {
                'email': 'nabila.hoque@example.com',
                'phone': '01710000004',
                'name': 'Nabila Hoque',
                'bio': 'Handles corporate compliance, startup advisory, and tax restructuring.',
                'location': 'Khulna, Bangladesh',
                'fee': 3500,
                'experience_years': 9,
                'specializations': ['corporate-law'],
            },
        ]

        for data in lawyers:
            user, _ = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'phone_number': data['phone'],
                    'role': 'LAWYER',
                    'is_active': True,
                    'is_verified': True,
                    'password': 'pbkdf2_sha256$600000$seedlawyer$Ee7G52m1o//PpQfem9E3bppzg9t8NQ==',
                },
            )
            user.role = 'LAWYER'
            user.phone_number = data['phone']
            user.is_active = True
            user.is_verified = True
            user.save(update_fields=['role', 'phone_number', 'is_active', 'is_verified'])

            license_issue_date = timezone.now().date() - timedelta(days=365 * data['experience_years'])
            profile_defaults = {
                'full_name_en': data['name'],
                'full_name_bn': data['name'],
                'license_issue_date': license_issue_date,
                'bar_council_number': f'BCS-{user.user_id.hex[:8].upper()}',
                'bio_en': data['bio'],
                'bio_bn': data['bio'],
                'chamber_address': data['location'],
                'consultation_fee_online': data['fee'],
                'consultation_fee_offline': data['fee'],
                'verification_status': 'VERIFIED',
            }

            profile, _ = LawyerProfile.objects.update_or_create(user=user, defaults=profile_defaults)

            LawyerSpecializationMap.objects.filter(lawyer=profile).delete()
            for slug in data['specializations']:
                spec = spec_lookup.get(slug)
                if not spec:
                    continue
                LawyerSpecializationMap.objects.get_or_create(lawyer=profile, specialization=spec)

        self.stdout.write(self.style.SUCCESS('Lawyer directory seed completed.'))
