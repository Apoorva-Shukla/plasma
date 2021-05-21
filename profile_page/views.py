from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, Http404, JsonResponse
from django.contrib.auth.models import User
from .models import Profile, Post, Friend, Like, Comment
from django.core.serializers import serialize
from .forms import PostForm
from django.contrib.messages import constants as messages
import math
from time import strftime

# Utils
def basic_vars_return(request, username=None):
    '''
    username - page username
    '''
    if username != None:
        page = get_object_or_404(Profile, user=User.objects.filter(username=username).first())
    else:
        page = None

    authenticated = False
    profile = None

    if request.user.is_authenticated:
        authenticated = True
        profile = Profile.objects.filter(user=request.user).first()

    # Friend
    fr_list = Friend.objects.filter(receiver=profile)
    fr_list2 = Friend.objects.filter(sender=profile)
    fl_ = fr_list | fr_list2
    friends_list = []

    for i in fl_.order_by('-date_added'):
        if (i.accepted == True and i.rejected == False):
            if (i.sender == profile):
                friends_list.append(i.receiver)
            else:
                friends_list.append(i.sender)

    return authenticated, profile, page, friends_list

def round_number(num):
    if num >= 1000 and num < 1000000:
        return f'{math.floor((num/1000)*10)/10}K'

    elif num >= 1000000:
        return f'{math.floor((num/1000000)*10)/10}M'

    else:
        return num


def check_private(request, postss, page, username, index):
    posts = postss
    p = []
    for i in posts:
        if i.deleted == False:
            if (i.share_with != None):
                if page != None and request.user != User.objects.filter(username=username).first():
                    for x in i.share_with.people.all():
                        if request.user == x:
                            p.append(i)
                            break
                else:
                    p.append(i)

            else:
                p.append(i)

    return p[index[0]:index[1]:index[2]]

# Create your views here.
def main(request, username):
    form = PostForm(request.POST or None, request.FILES or None, user=request.user)
    if request.method == 'POST':
        if request.POST.get('name_', '') == 'add-comment':
            commenter = Profile.objects.filter(user=request.user)
            comment = request.POST.get('comment', '')
            post = Post.objects.filter(pk=int(request.POST.get('post_pk', ''))).first()

            Comment.objects.create(commenter=commenter.first(), post=post, comment=comment).save()

            return JsonResponse(data={
                'commenter': serialize('json', commenter),
                'user': serialize('json', User.objects.filter(username=request.user.username)),
            })

        elif request.is_ajax():
            if form.is_valid():
                if request.user == User.objects.filter(username=form.cleaned_data.get('profile')).first():
                    form.save()

                    latest_post = list(Post.objects.filter(profile=form.cleaned_data['profile']))[-1].pk
                    latest_post = Post.objects.filter(pk=latest_post)
                    latest_post = serialize('json', latest_post)
                    return JsonResponse(data={
                        'lp': latest_post,
                    })

    authenticated, profile, page, friends_list = basic_vars_return(request, username)

    posts = list(Post.objects.filter(profile=page).all())

    posts = check_private(request, posts, page, username, [-1,-1 - 3,-1])

    friends = 1
    for i in Friend.objects.all():
        if (i.sender == profile or i.receiver == profile) and (i.sender == page or i.receiver == page):
            if (i.accepted == True and i.rejected == False):
                friends = '1s'

            elif i.rejected == False and i.accepted == False:
                if i.sender == page and i.receiver == profile:
                    friends = '0s'
                elif i.receiver == page and i.sender == profile:
                    friends = '0r'

    psts = []
    # Likes
    if request.user.is_authenticated:
        for i in posts:
            liked = Like.objects.filter(post=i, lb=profile).count()
            if liked == 0:liked == False
            else:liked = True
            like_count = Like.objects.filter(post=i).count()
            psts.append([i, liked, like_count])

    else:
        for i in posts:
            like_count = Like.objects.filter(post=i).count()
            psts.append([i, False, like_count])


    # People with similar names
    simi_users = (Profile.objects.filter(user__first_name__icontains=page.user.first_name) | Profile.objects.filter(user__last_name__icontains=page.user.last_name) | Profile.objects.filter(user__first_name__icontains=page.user.last_name) | Profile.objects.filter(user__last_name__icontains=page.user.first_name))
    simi_users = list(reversed(list(simi_users.exclude(pk=page.pk))))[0:2]

    # user friends
    u_f = (Friend.objects.filter(sender=page) | Friend.objects.filter(receiver=page))[0:2]
    user_friends = []
    for i in u_f:
        if i.accepted == True and i.rejected == False:
            if i.sender == page:
                user_friends.append(i.receiver)
            else:
                user_friends.append(i.sender)

    # Birthdays
    birthdays = [i for i in friends_list if strftime('%m-%d') == '-'.join(str(i.birthday).split('-')[1:3])]
    more_birthdays = len(birthdays) - len(birthdays[0:2])
    birthdays = birthdays[0:2]

    context = {
        'authenticated': authenticated,
        'simi_users': simi_users,
        'user_friends': user_friends,
        'profile': profile,
        'page': page,
        'friends_list': friends_list,
        'birthday_list': birthdays,
        'more_birthdays': more_birthdays,
        'friends': friends,
        'posts': psts,
        'form': form,
    }
    return render(request, 'profile_page/profile.html', context)


def load_post(request):
    if request.method == 'POST':
        LIMIT = 3
        OFFSET = int(request.POST.get('length', '')) + 1
        username = request.POST.get('username', '')

        posts = list(Post.objects.filter(profile=(Profile.objects.filter(user=User.objects.filter(username=username).first()).first())).all())
        posts = check_private(request, posts, Profile.objects.filter(user=User.objects.filter(username=username).first()).first(), username, [-OFFSET,-LIMIT - OFFSET,-1])

        if (len(posts) != 0):
            post_profile = [i.profile for i in posts]
            post_users = [i.user for i in post_profile]
            share_with = [False if i.share_with == None else True for i in posts]

            like_stats = []
            liked_or_not = []
            # Likes
            if request.user.is_authenticated:
                for i in posts:
                    liked = Like.objects.filter(post=i, lb=Profile.objects.filter(user=request.user).first()).count()
                    if liked == 0:liked == False
                    else:liked = True
                    like_count = Like.objects.filter(post=i).count()
                    like_stats.append(like_count)
                    liked_or_not.append(liked)

            else:
                for i in posts:
                    like_count = Like.objects.filter(post=i).count()
                    like_stats.append(like_count)
                    liked_or_not.append(False)

            posts = serialize('json', posts)
            post_profile = serialize('json', post_profile)
            post_users = serialize('json', post_users)

            return JsonResponse(data={
                'posts': posts,
                'like_stats': like_stats,
                'liked_or_not': liked_or_not,
                'profiles': post_profile,
                'users': post_users,
                'share_with': share_with,
                'more_bool': True,
            })
        else:
            return JsonResponse(data={
                'more_bool': False,
            })
    else:
        raise Http404()

def friend(request):
    if request.method == 'POST':
        pk = int(request.POST.get('r', ''))
        user = request.user
        page = Profile.objects.filter(user=User.objects.filter(pk=pk).first()).first()
        sender = Profile.objects.filter(user=user).first()

        if request.POST.get('name', '') == 'add-friend':
            # already friends
            already_friends = Friend.objects.filter(sender=sender, receiver=page).first()
            already_friends2 = Friend.objects.filter(sender=page, receiver=sender).first()
            # other one sent me a request
            other_one_request = Friend.objects.filter(sender=page, receiver=sender).first()
            # I sent the other one a request
            i_sent_request = Friend.objects.filter(sender=sender, receiver=page).first()

            if already_friends != None or already_friends2 != None:
                if already_friends != None:
                    if (already_friends.rejected == True):
                        already_friends.accepted = False
                        already_friends.rejected = False
                        already_friends.sender = sender
                        already_friends.receiver = page
                        already_friends.save()
                else:
                    if (already_friends2.rejected == True):
                        already_friends2.accepted = False
                        already_friends2.rejected = False
                        already_friends2.sender = sender
                        already_friends2.receiver = page
                        already_friends2.save()
                    elif (other_one_request.accepted == False and other_one_request.rejected == False):
                        other_one_request.sender = sender
                        other_one_request.receiver = page
                        other_one_request.accepted = True
                        other_one_request.save()

            elif i_sent_request != None:pass
            elif already_friends == None and already_friends2 == None and other_one_request == None and i_sent_request == None:
                obj = Friend(sender=sender, receiver=page).save()


        elif request.POST.get('name', '') == 'cancel-request':
            obj = Friend.objects.filter(receiver=page, sender=sender).first()
            obj2 = Friend.objects.filter(receiver=sender, sender=page).first()
            if obj != None:
                if obj.accepted == False and obj.rejected == False:
                    Friend.objects.filter(receiver=page, sender=sender).delete()

            if obj2 != None:
                if obj2.accepted == False and obj2.rejected == False:
                    Friend.objects.filter(receiver=sender, sender=page).delete()


        elif request.POST.get('name', '') == 'accept-friend':
            obj = Friend.objects.filter(receiver=sender, sender=page).first()
            if obj != None:
                obj.accepted = True
                obj.rejected = False
                obj.save()


        elif request.POST.get('name', '') == 'reject-friend':
            obj = Friend.objects.filter(receiver=sender, sender=page).first()
            if obj != None:
                obj.accepted = False
                obj.rejected = True
                obj.save()


        elif request.POST.get('name', '') == 'unfriend':
            obj1 = Friend.objects.filter(receiver=sender, sender=page).first()
            obj2 = Friend.objects.filter(receiver=page, sender=sender).first()
            if obj1 != None:
                obj = obj1
            elif obj2 != None:
                obj = obj2

            obj.accepted = True
            obj.rejected = True
            obj.save()

        return JsonResponse(data={
            '': '',
        })
    else:
        raise Http404()

def like_post(request):
    if request.method == "POST":
        index = int(request.POST.get('index', ''))
        page = Profile.objects.filter(user=User.objects.filter(pk=int(request.POST.get('page', ''))).first()).first()
        profile = Profile.objects.filter(user=request.user).first()

        post_list = list(Post.objects.filter(profile=page))
        last_item = post_list[0]
        post_list = check_private(request, post_list, page, page.user.username, [-1, 0, -1])
        post_list.append(last_item)

        if request.user.is_authenticated:
            if request.POST.get('name', '') == 'like':
                if Like.objects.filter(lb=profile, post=post_list[index]).first() == None:
                    Like(lb=profile, post=post_list[index]).save()
            elif request.POST.get('name', '') == 'unlike':
                Like.objects.filter(lb=profile, post=post_list[index]).delete()

        like_count = Like.objects.filter(post=post_list[index]).count()
        liked = Like.objects.filter(post=post_list[index], lb=profile).first()
        if liked == None:
            liked = False
        else:
            liked = True

        return JsonResponse(data={
            'liked': liked,
            'like_count': like_count,
        })
    else:
        raise Http404()

def load_comment(request):
    if request.method == "POST":
        post_ind = int(request.POST.get('post_ind', ''))
        c_length = int(request.POST.get('c_length', ''))+1
        page = Profile.objects.filter(user=User.objects.filter(pk=int(request.POST.get('page', ''))).first()).first()

        LIMIT = 3

        post_list = list(Post.objects.filter(profile=page))
        last_item = post_list[0]
        post_list = check_private(request, post_list, page, page.user.username, [-1, 0, -1])
        post_list.append(last_item)

        comments = list(Comment.objects.filter(post=post_list[post_ind]))[-c_length:-c_length - LIMIT:-1]
        profiles = [i.commenter for i in comments]
        users = [i.user for i in profiles]

        # comments passed time
        c_time_passed = []
        for i in comments:
            # Calculating the time passed since the comment has been posted
            # Split and get a list
            dt = str(i.date).split('-')
            # Taking 0th element because it is hour and we don't need mins and seconds
            t = str(i.time).split(':')
            # Now we have data like this - [Year, Month, Date, Hour]
            dt.append(t[0])
            dt.append(t[1])

            # Now we have data corresponding to the current time - [Year, Month, Date, Hour]
            r_dt = [strftime('%Y'), strftime('%m'), strftime('%d'), strftime('%H'), strftime('%M')]

            if r_dt[0] == dt[0]: # year
                tp = f'{int(r_dt[1]) - int(dt[1])} months ago'
                if r_dt[1] == dt[1]: # month
                    tp = f'{int(r_dt[2]) - int(dt[2])} days ago'
                    if r_dt[2] == dt[2]: # date
                        tp = f'{int(r_dt[3]) - int(dt[3])} hours ago'
                        if r_dt[3] == dt[3]: # hour
                            if (int(r_dt[4]) - int(dt[4])) == 0:
                                tp = 'Just now'
                            else:
                                tp = f'{int(r_dt[4]) - int(dt[4])} minutes ago'

                c_time_passed.append(tp)

        comments = serialize('json', comments)
        profiles = serialize('json', profiles)
        users = serialize('json', users)

        return JsonResponse(data={
            'comments': comments,
            'comments_time': c_time_passed,
            'profiles': profiles,
            'users': users,
            'limit': LIMIT,
        })

    else:
        raise Http404()

def update_avatar(request):
    if request.method == "POST":
        profile = Profile.objects.filter(user=request.user).first()
        profile.avatar = request.FILES.get('file')
        profile.save()
        return JsonResponse(data={
            'url': profile.avatar.url,
        })

    else:
        raise Http404()

def update_banner(request):
    if request.method == "POST":
        profile = Profile.objects.filter(user=request.user).first()
        profile.banner = request.FILES.get('file')
        profile.save()
        return JsonResponse(data={
            'url': profile.banner.url,
        })

    else:
        raise Http404()