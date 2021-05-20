from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from profile_page.models import Profile
from django.contrib import messages

def home(request):
    if request.user.is_authenticated:
        return redirect(f'/{request.user.username}/')

    return redirect('/s/')

def sign_in(request):
    if request.user.is_authenticated:
        return redirect('/')

    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if request.POST.get('next', ''):
                return redirect(f"{request.POST.get('next', '')}")
            return redirect('/')
        else:
            # No backend authenticated the credentials
            messages.error(request, 'Bad credentials', 'alert-danger')
            if request.POST.get('next', ''):
                return redirect(f"/s/?next={request.POST.get('next', '')}")
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

                user = User.objects.create_user(username=username, first_name=first_name, last_name=last_name, password=password)
                user.save()
                Profile.objects.create(user=user).save()
                auth_u = authenticate(request, username=username, password=password)
                login(request, auth_u)

                if request.POST.get('next', ''):
                    return JsonResponse(data={'redirect_url': f"{request.POST.get('next', '')}"})
                return JsonResponse(data={'redirect_url': '/'})
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


def sign_out(request):
    if request.user.is_authenticated:
        logout(request)
        return render(request, 'sign_out.html')
    else:
        return redirect('/s/')