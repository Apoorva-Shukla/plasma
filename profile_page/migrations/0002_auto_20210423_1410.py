# Generated by Django 3.1.4 on 2021-04-23 08:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profile_page', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='date_joined',
            field=models.DateField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='time_joined',
            field=models.TimeField(auto_now_add=True),
        ),
    ]
