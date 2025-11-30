from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='citizenprofile',
            name='identity_document_url',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AddField(
            model_name='citizenprofile',
            name='profile_photo_url',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AddField(
            model_name='lawyerprofile',
            name='identity_document_url',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AddField(
            model_name='lawyerprofile',
            name='profile_photo_url',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AddField(
            model_name='lawyerprofile',
            name='verification_document_url',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AlterField(
            model_name='evidencedocument',
            name='encryption_hash',
            field=models.CharField(blank=True, default='', max_length=64),
        ),
        migrations.AlterField(
            model_name='evidencedocument',
            name='encryption_key_id',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]
