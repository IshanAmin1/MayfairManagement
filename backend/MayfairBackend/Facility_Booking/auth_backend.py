from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class EmailBackend(ModelBackend): #Overriding Backend with EmailBackend
    def authenticate(self, request, username=None, password=None, **kwargs): #Redefining authenticate Method
        UserModel = get_user_model() #Getting UserModel
        try:
            user = UserModel.objects.get(email=username) #Get the email
        except UserModel.DoesNotExist: #If email not found, return None
            return None
        else:
            if user.check_password(password): #If password matches, return user, else return None
                return user
            return None

