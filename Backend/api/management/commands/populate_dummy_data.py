from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, datetime
import random
from api.models import (
    User, CitizenProfile, LawyerProfile, LegalSpecialization,  
    LawyerSpecializationMap, Case, ConsultationBooking, Notification, ChatMessage
)


class Command(BaseCommand):
    help = 'Populates database with dummy lawyers, cases, bookings, and notifications'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting dummy data population...'))
        
        # Create legal specializations first
        self.create_specializations()
        
        # Create dummy lawyers
        lawyers = self.create_lawyers(15)
        
        # Get existing citizens to create cases for
        citizens = User.objects.filter(role='CITIZEN')
        
        if citizens.exists():
            # Create dummy cases
            self.create_cases(citizens, lawyers)
            
            # Create dummy consultations
            self.create_consultations(citizens, lawyers)
            
            # Create dummy notifications
            self.create_notifications(citizens, lawyers)
        
        self.stdout.write(self.style.SUCCESS('✓ Dummy data population completed!'))
        self.stdout.write(self.style.SUCCESS(f'  - Created {len(lawyers)} lawyers'))
        self.stdout.write(self.style.SUCCESS(f'  - Created cases, bookings, and notifications'))

    def create_specializations(self):
        """Create legal specialization categories"""
        specializations = [
            ('Family Law', 'পারিবারিক আইন', 'family-law', 'Divorce, child custody, marriage, inheritance'),
            ('Criminal Law', 'ফৌজদারি আইন', 'criminal-law', 'Criminal defense, bail, investigations'),
            ('Corporate Law', 'কর্পোরেট আইন', 'corporate-law', 'Business formation, contracts, compliance'),
            ('Property Law', 'সম্পত্তি আইন', 'property-law', 'Land disputes, property transfer, documentation'),
            ('Labor Law', 'শ্রম আইন', 'labor-law', 'Employment disputes, labor rights, workplace issues'),
            ('Civil Law', 'দেওয়ানী আইন', 'civil-law', 'Civil disputes, tort claims, damages'),
            ('Tax Law', 'কর আইন', 'tax-law', 'Tax planning, tax disputes, compliance'),
            ('Immigration Law', 'অভিবাসন আইন', 'immigration-law', 'Visa, citizenship, immigration matters'),
        ]
        
        for name_en, name_bn, slug, desc_en in specializations:
            LegalSpecialization.objects.get_or_create(
                slug=slug,
                defaults={
                    'name_en': name_en,
                    'name_bn': name_bn,
                    'description_en': desc_en,
                    'is_active': True
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(specializations)} legal specializations'))

    def create_lawyers(self, count=15):
        """Create dummy lawyer profiles"""
        lawyer_names = [
            ('Md. Kamal Hossain', 'মোঃ কামাল হোসেন'),
            ('Advocate Farida Rahman', 'অ্যাডভোকেট ফরিদা রহমান'),
            ('Barrister Tanvir Ahmed', 'ব্যারিস্টার তানভীর আহমেদ'),
            ('Advocate Nasrin Sultana', 'অ্যাডভোকেট নাসরিন সুলতানা'),
            ('Md. Rafiqul Islam', 'মোঃ রফিকুল ইসলাম'),
            ('Advocate Shireen Akhter', 'অ্যাডভোকেট শিরীন আক্তার'),
            ('Barrister Ashraful Haque', 'ব্যারিস্টার আশরাফুল হক'),
            ('Advocate Monira Begum', 'অ্যাডভোকেট মনিরা বেগম'),
            ('Md. Abdur Rahman', 'মোঃ আবদুর রহমান'),
            ('Advocate Tasneem Hossain', 'অ্যাডভোকেট তাসনীম হোসেন'),
            ('Barrister Imran Khan', 'ব্যারিস্টার ইমরান খান'),
            ('Advocate Razia Sultana', 'অ্যাডভোকেট রাজিয়া সুলতানা'),
            ('Md. Jahangir Alam', 'মোঃ জাহাঙ্গীর আলম'),
            ('Advocate Shahnaz Parveen', 'অ্যাডভোকেট শাহনাজ পারভীন'),
            ('Barrister Mehedi Hasan', 'ব্যারিস্টার মেহেদী হাসান'),
        ]
        
        cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal']
        areas = {
            'Dhaka': ['Dhanmondi', 'Gulshan', 'Banani', 'Motijheel', 'Uttara'],
            'Chittagong': ['Agrabad', 'Panchlaish', 'Khulshi', 'CDA Avenue'],
            'Sylhet': ['Zindabazar', 'Bondorbazar', 'Ambarkhana'],
            'Rajshahi': ['Court Para', 'Shaheb Bazar', 'New Market'],
            'Khulna': ['Sonadanga', 'Khalishpur', 'Boyra'],
            'Barisal': ['Sadar Road', 'Band Road', 'Kalijira Road']
        }
        
        specializations = list(LegalSpecialization.objects.all())
        lawyers_created = []
        
        for i in range(min(count, len(lawyer_names))):
            name_en, name_bn = lawyer_names[i]
            city = random.choice(cities)
            area = random.choice(areas[city])
            
            # Create user
            email = f"lawyer{i+1}@cla.com"
            
            # Skip if user already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'  Lawyer {email} already exists, skipping...'))
                continue
            
            user = User.objects.create_user(
                email=email,
                phone_number=f"+88017{random.randint(10000000, 99999999)}",
                password="ahbab2018"  # Same password as user mentioned
            )
            user.role = 'LAWYER'
            user.is_active = True
            user.is_verified = True
            user.language_preference = 'EN'
            user.save()
            
            # Create lawyer profile
            years_exp = random.randint(3, 25)
            license_date = timezone.now().date() - timedelta(days=365 * years_exp)
            
            bio_templates = [
                f"Experienced lawyer specializing in various legal matters with {years_exp} years of practice. Dedicated to providing quality legal services.",
                f"Senior advocate with {years_exp} years of experience in Bangladesh legal system. Committed to justice and client satisfaction.",
                f"Practicing lawyer for {years_exp} years, handling diverse cases with professionalism and expertise.",
                f"{years_exp}+ years of legal practice in Bangladesh. Known for strong advocacy and client-focused approach."
            ]
            
            lawyer_profile = LawyerProfile.objects.create(
                user=user,
                bar_council_number=f"BAR-{random.randint(10000, 99999)}",
                license_issue_date=license_date,
                full_name_en=name_en,
                full_name_bn=name_bn,
                bio_en=random.choice(bio_templates),
                bio_bn=f"{years_exp} বছরের অভিজ্ঞতা সহ আইনজীবী।",
                chamber_address=f"{area}, {city}, Bangladesh",
                geo_latitude=23.8103 + random.uniform(-0.5, 0.5),
                geo_longitude=90.4125 + random.uniform(-0.5, 0.5),
                verification_status='VERIFIED',
                consultation_fee_online=random.choice([500, 800, 1000, 1500, 2000]),
                consultation_fee_offline=random.choice([1000, 1500, 2000, 2500, 3000]),
                rating_average=round(random.uniform(3.5, 5.0), 2),
                total_reviews=random.randint(5, 50)
            )
            
            # Assign 2-4 random specializations
            num_specs = random.randint(2, 4)
            selected_specs = random.sample(specializations, min(num_specs, len(specializations)))
            for spec in selected_specs:
                LawyerSpecializationMap.objects.create(
                    lawyer=lawyer_profile,
                    specialization=spec
                )
            
            lawyers_created.append(lawyer_profile)
            self.stdout.write(f'  Created lawyer: {name_en}')
        
        return lawyers_created

    def create_cases(self, citizens, lawyers):
        """Create dummy cases for citizens"""
        case_titles = [
            'Property Dispute Resolution',
            'Divorce Proceedings',
            'Child Custody Matter',
            'Land Ownership Dispute',
            'Employment Termination Case',
            'Contract Violation Claim',
            'Inheritance Distribution',
            'Tenant Eviction Notice',
            'Business Partnership Dispute',
            'Vehicle Accident Claim'
        ]
        
        case_descriptions = [
            'Need legal assistance regarding property ownership and documentation.',
            'Seeking legal advice for divorce proceedings and settlement.',
            'Require legal representation for child custody arrangement.',
            'Land dispute with neighbor regarding boundary.',
            'Unfair termination from employment, seeking compensation.',
            'Breach of contract by business partner, need legal action.',
            'Family inheritance distribution dispute among siblings.',
            'Landlord-tenant dispute regarding lease agreement.',
            'Partnership dissolution and asset distribution issue.',
            'Personal injury claim from traffic accident.'
        ]
        
        statuses = ['SUBMITTED', 'IN_REVIEW', 'SCHEDULED', 'RESOLVED']
        priorities = ['LOW', 'MEDIUM', 'HIGH']
        specializations = list(LegalSpecialization.objects.all())
        
        cases_created = 0
        for citizen in list(citizens)[:10]:  # Create cases for first 10 citizens
            num_cases = random.randint(1, 3)
            for _ in range(num_cases):
                case = Case.objects.create(
                    citizen=citizen,
                    assigned_lawyer=random.choice(lawyers) if random.random() > 0.3 else None,
                    category=random.choice(specializations),
                    title=random.choice(case_titles),
                    description=random.choice(case_descriptions),
                    status=random.choice(statuses),
                    priority=random.choice(priorities),
                    is_anonymous=random.random() < 0.1,
                    submission_date=timezone.now() - timedelta(days=random.randint(1, 90))
                )
                cases_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {cases_created} cases'))

    def create_consultations(self, citizens, lawyers):
        """Create dummy consultation bookings"""
        statuses = ['PENDING', 'CONFIRMED', 'COMPLETED']
        bookings_created = 0
        
        # Get some cases to associate with bookings
        cases = list(Case.objects.all()[:20])
        
        for case in cases:
            if random.random() > 0.5:  # 50% chance to have a booking
                start_time = timezone.now() + timedelta(days=random.randint(1, 14), hours=random.randint(9, 16))
                booking = ConsultationBooking.objects.create(
                    case=case,
                    citizen=case.citizen,
                    lawyer=case.assigned_lawyer if case.assigned_lawyer else random.choice(lawyers),
                    scheduled_start=start_time,
                    scheduled_end=start_time + timedelta(hours=1),
                    status=random.choice(statuses),
                    meeting_link=f"https://meet.cla.com/{random.randint(100000, 999999)}" if random.random() > 0.5 else None,
                    location=f"Lawyer's Chamber" if random.random() > 0.5 else None
                )
                bookings_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {bookings_created} consultation bookings'))

    def create_notifications(self, citizens, lawyers):
        """Create dummy notifications"""
        notification_templates = [
            ('CASE_UPDATE', 'Case Status Updated', 'Your case status has been changed to In Review'),
            ('BOOKING', 'Appointment Confirmed', 'Your consultation appointment has been confirmed for tomorrow'),
            ('SYSTEM', 'Welcome to CLA', 'Welcome to Citizen Legal Assistance platform'),
            ('REMINDER', 'Upcoming Appointment', 'You have an appointment scheduled for today'),
            ('MESSAGE', 'New Message', 'You have received a new message from your lawyer'),
        ]
        
        notifications_created = 0
        all_users = list(citizens) + [lawyer.user for lawyer in lawyers]
        
        for user in all_users[:30]:  # Create notifications for 30 users
            num_notifications = random.randint(2, 5)
            for _ in range(num_notifications):
                notif_type, title, body = random.choice(notification_templates)
                Notification.objects.create(
                    user=user,
                    type=notif_type,
                    title=title,
                    body=body,
                    is_read=random.random() < 0.5,
                    created_at=timezone.now() - timedelta(days=random.randint(0, 30))
                )
                notifications_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {notifications_created} notifications'))
