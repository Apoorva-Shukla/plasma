from django.db import models
from django.contrib.auth.models import User

# Utils
profile_photo_path = '/profile_photo/'
banner_photo_path = '/banner_photo/'
image_path = '/uploads/images/'
video_path = '/uploads/video/'
story_image_path = '/story/images/'
story_video_path = '/story/video/'

def avatar_photo_upload(instance, filename):
    '''uploading to the corresponding user's folder'''
    return f"users/{instance.user.username}{profile_photo_path}{filename}/"

def banner_photo_upload(instance, filename):
    '''uploading to the corresponding user's folder'''
    return f"users/{instance.user.username}{banner_photo_path}{filename}/"

def post_photo_upload(instance, filename):
    '''uploading to the corresponding user's folder'''
    return f"users/{instance.profile.user.username}{image_path}{filename}/"

def post_video_upload(instance, filename):
    '''uploading to the corresponding user's folder'''
    return f"users/{instance.profile.user.username}{video_path}{filename}/"

def story_image_upload(instance, filename):
    '''uploading to the corresponding user's folder'''
    return f"users/{instance.profile.user.username}{story_image_path}{filename}/"

def story_video_upload(instance, filename):
    '''uploading to the corresponding user's folder'''
    return f"users/{instance.profile.user.username}{story_video_path}{filename}/"

# Create your models here.
class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to=avatar_photo_upload, blank=True)
    banner = models.ImageField(upload_to=banner_photo_upload, blank=True)

    bio = models.TextField(max_length=150, blank=True)
    birthday = models.DateField(null=True)

    date_joined = models.DateField(auto_now_add=True)
    time_joined = models.TimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.user.username

class Circle(models.Model):
    name = models.CharField(max_length=20)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='circle_profile')
    people = models.ManyToManyField(Profile)

    date_created = models.DateField(auto_now_add=True)
    time_created = models.TimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Post(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='post_profile')

    caption = models.TextField(max_length=5000)

    image = models.ImageField(upload_to=post_photo_upload, blank=True)
    video = models.FileField(upload_to=post_video_upload, blank=True)

    share_with = models.ForeignKey(Circle, on_delete=models.SET_NULL, null=True, blank=True, related_name='share_with')

    date_added = models.DateField(auto_now_add=True)
    time_added = models.TimeField(auto_now_add=True)

    deleted = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f'{self.profile.user.username} uploaded : {self.caption[0:20]}'

class Friend(models.Model):
    sender = models.ForeignKey(Profile, related_name='sender', on_delete=models.CASCADE, null=True)
    receiver = models.ForeignKey(Profile, related_name='receiver', on_delete=models.CASCADE, null=True)

    # accepted or rejected
    accepted = models.BooleanField(default=False)
    rejected = models.BooleanField(default=False)

    date_added = models.DateField(auto_now=True)
    time_added = models.TimeField(auto_now=True)

    def __str__(self):
        # if self.accepted == False and self.rejected == False:
        #     return f'{" sent a request to ".join([i.user.username for i in self.friends.all()])}'
        # else:
        #     if self.accepted == True and self.rejected == True:
        #         return f'{" was a friend of ".join([i.user.username for i in self.friends.all()])}'
        #     elif self.accepted == True and self.rejected == False:
        #         return f'{" is a friend of ".join([i.user.username for i in self.friends.all()])}'
        #     else:
        #         return f'{" was rejected as a friend by ".join([i.user.username for i in self.friends.all()])}'
        return f'{self.pk}'

    # Possible outcomes when a user say 'a' send request to a user say 'b':
    #     1. a sent request to b
    #     -> friends = [a, b]
    #     -> accepted = False
    #     -> rejected = False
    #     -> Show request sent to a,,, show request from a to b

    #     2. Either of the two below
    #         1. b accepted the request (Friends)
    #         -> friends = [a, b]
    #         -> accepted = True
    #         -> rejected = False
    #         -> Show b accepted your request to a,,, show you are now friends to both a and b
    #             1. Either a or b removes the other as thier friend (People who were your friends in the past)
    #             -> friends = [a, b]
    #             -> accepted = True
    #             -> rejected = True

    #         2. b rejected the request (Rejected as Friends)
    #         -> friends = [a, b]
    #         -> accepted = False
    #         -> rejected = True
    #         -> Show b rejected your request to a,,, remove a from pending request of b

class Like(models.Model):
    # lb - liked by
    lb = models.ForeignKey(Profile, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

    date = models.DateField(auto_now=True)
    time = models.TimeField(auto_now=True)

class Comment(models.Model):
    commenter = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='commenter')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post')
    comment = models.TextField(max_length=500)

    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)

    def __str__(self):
        return self.comment

class Story(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    image = models.ImageField(upload_to=story_image_upload, blank=True)
    video = models.ImageField(upload_to=story_video_upload, blank=True)
    caption = models.TextField(max_length=500, blank=True)

    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)