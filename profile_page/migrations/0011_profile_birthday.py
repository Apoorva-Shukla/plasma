# Generated by Django 3.1.4 on 2021-05-07 12:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profile_page', '0010_like'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='birthday',
            field=models.DateField(null=True),
        ),
    ]
