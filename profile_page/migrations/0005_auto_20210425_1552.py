# Generated by Django 3.1.4 on 2021-04-25 10:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('profile_page', '0004_circle_post'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='share_with',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='share_with', to='profile_page.circle'),
        ),
    ]
