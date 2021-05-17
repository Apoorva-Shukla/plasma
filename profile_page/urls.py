from django.urls import path
from . import views

urlpatterns = [
    path('load-post/', views.load_post, name="load_post"),
    path('friend/', views.friend, name="friend_request"),
    path('like/', views.like_post, name="like_post"),
    path('load-comment/', views.load_comment, name="load_comment"),
    path('update-avatar/', views.update_avatar, name="update_avatar"),
    path('update-banner/', views.update_banner, name="update_avatar"),
    path('<username>/', views.main, name="profile_page"),
    path('<username>/story/', views.story, name="user_story"),
]
