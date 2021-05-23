from django.contrib import admin

# Register your models here.
from . import models

admin.site.register(models.Profile)
admin.site.register(models.Post)
admin.site.register(models.Circle)
admin.site.register(models.Friend)
admin.site.register(models.Like)
admin.site.register(models.Comment)
admin.site.register(models.Notification)