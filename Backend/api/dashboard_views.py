from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Q
from .models import Case, ConsultationBooking, CaseActivityLog, LawyerProfile, User
from .serializers import CaseSerializer, ConsultationBookingSerializer, CaseActivityLogSerializer

class LawyerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Ensure user is a lawyer
        if user.role != 'LAWYER':
            return Response({'error': 'Access denied. Lawyer role required.'}, status=403)
            
        try:
            profile = user.lawyer_profile
        except LawyerProfile.DoesNotExist:
            return Response({'error': 'Lawyer profile not found.'}, status=404)

        # Check verification status
        if profile.verification_status != 'VERIFIED':
            return Response({
                'error': 'Account pending verification.',
                'code': 'NOT_VERIFIED',
                'status': profile.verification_status
            }, status=403)

        # 1. Stats
        active_cases_count = Case.objects.filter(
            assigned_lawyer=profile,
            status__in=['SUBMITTED', 'IN_REVIEW', 'DOC_REQUESTED', 'SCHEDULED']
        ).count()

        today = timezone.now()
        next_week = today + timezone.timedelta(days=7)
        
        upcoming_hearings_count = Case.objects.filter(
            assigned_lawyer=profile,
            next_hearing_at__range=[today, next_week]
        ).count()

        # Tasks: For now, we'll count pending bookings + cases needing attention as "tasks"
        pending_bookings_count = ConsultationBooking.objects.filter(
            lawyer=profile,
            status='PENDING'
        ).count()
        
        # Billable hours (Placeholder as we don't have a time log model yet, using dummy 0 or random)
        # In a real app, this would sum up TimeLog entries
        billable_hours = 0 # Placeholder from design

        # 2. Case Overview (for Chart)
        # Group by status
        case_stats = Case.objects.filter(assigned_lawyer=profile).values('status').annotate(count=Count('status'))
        case_overview_data = {item['status']: item['count'] for item in case_stats}

        # 3. Upcoming Hearings (Next 5)
        upcoming_hearings_cases = Case.objects.filter(
            assigned_lawyer=profile,
            next_hearing_at__gte=today
        ).order_by('next_hearing_at')[:5]
        
        # Serialize hearings (we can use CaseSerializer or a simplified custom dict)
        hearings_data = []
        for case in upcoming_hearings_cases:
            hearings_data.append({
                'id': case.case_id,
                'title': case.title,
                'case_number': case.case_number,
                'date': case.next_hearing_at,
                'court': case.court_name
            })

        # 4. Recent Activity
        # Get logs for cases assigned to this lawyer
        recent_activities = CaseActivityLog.objects.filter(
            case__assigned_lawyer=profile
        ).order_by('-timestamp')[:5]
        
        activity_serializer = CaseActivityLogSerializer(recent_activities, many=True)

        # 5. Cases Needing Attention
        # Logic: High priority cases or cases with hearings tomorrow
        attention_cases = Case.objects.filter(
            assigned_lawyer=profile
        ).filter(
            Q(priority='CRITICAL') | 
            Q(priority='HIGH') |
            Q(next_hearing_at__range=[today, today + timezone.timedelta(days=2)])
        ).distinct()[:3]
        
        attention_serializer = CaseSerializer(attention_cases, many=True)

        return Response({
            'stats': {
                'active_cases': active_cases_count,
                'hearings_this_week': upcoming_hearings_count,
                'pending_tasks': pending_bookings_count, 
                'billable_hours': billable_hours
            },
            'case_overview': case_overview_data,
            'upcoming_hearings': hearings_data,
            'recent_activity': activity_serializer.data,
            'cases_needing_attention': attention_serializer.data
        })
