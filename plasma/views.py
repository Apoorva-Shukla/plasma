from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib import messages
from profile_page.views import basic_vars_return

def home(request):
    authenticated, profile, page, friends_list = basic_vars_return(request)

    context = {
        'authenticated': authenticated,
        'profile': profile,
        'page': page,
        'friends_list': friends_list,
    }

    return render(request, 'home.html', context)

def sign_in(request):
    if request.user.is_authenticated:
        return redirect('/')

    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('/')
        else:
            # No backend authenticated the credentials
            messages.error(request, 'Bad credentials', 'alert-danger')
            return redirect('/s/')

    return render(request, 's.html')

def register(request):
    if request.user.is_authenticated:
        return redirect('/')

    if request.method == 'POST':
        if request.POST.get('_type', '') == 'submit':
            try:
                name = str(request.POST.get('name', ''))
                username = request.POST.get('username', '')
                password = request.POST.get('password', '')

                splitted = name.split(' ')
                first_name = splitted[0]
                splitted.pop(0)
                last_name = ' '.join(splitted)

                User.objects.create_user(username=username, first_name=first_name, last_name=last_name, password=password).save()

                return JsonResponse(data={'redirect_url': '/s/'})
            except:
                pass

        elif request.POST.get('_type', '') != 'submit':
            exists = True
            if User.objects.filter(username=request.POST.get('username', '')).first() == None:
                exists = False

            return JsonResponse(data={
                'exists': exists,
            })


    return render(request, 'r.html')