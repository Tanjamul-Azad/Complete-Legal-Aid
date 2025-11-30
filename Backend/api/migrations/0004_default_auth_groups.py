from django.db import migrations


def create_default_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    default_groups = ['CITIZEN', 'LAWYER', 'ADMIN', 'NGO_SUPPORT']
    for group_name in default_groups:
        Group.objects.get_or_create(name=group_name)


def remove_default_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=['CITIZEN', 'LAWYER', 'ADMIN', 'NGO_SUPPORT']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_case_metadata_fields'),
    ]

    operations = [
        migrations.RunPython(create_default_groups, remove_default_groups),
    ]
