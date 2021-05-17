from django import forms
from .models import Post, Profile, Circle

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ('profile', 'caption', 'image', 'video', 'share_with')

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user')
        super(PostForm, self).__init__(*args, **kwargs)

        self.fields['caption'].widget.attrs={
            'class': 'w-100 py-2 my-auto transparent-inp',}

        self.fields['image'].widget.attrs={
            'class': 'd-none',
            'accept': 'image/*'}

        self.fields['video'].widget.attrs={
            'class': 'd-none',
            'accept': 'video/*'}

        try:
            self.fields['share_with'].queryset = Circle.objects.filter(profile=Profile.objects.filter(user=self.user).first())
        except Exception:pass