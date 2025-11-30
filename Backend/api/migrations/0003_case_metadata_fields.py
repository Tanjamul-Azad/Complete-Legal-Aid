from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_profile_media_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='case',
            name='case_number',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='case',
            name='court_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='case',
            name='filing_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='case',
            name='next_hearing_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='case',
            name='presiding_judge',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='case',
            name='relevant_acts',
            field=models.TextField(blank=True, null=True),
        ),
    ]
