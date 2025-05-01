from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from django.contrib.auth import authenticate
from .permissions import IsAdminOrReadOnly
from .models import Facility, OccupiedDate, User
from .serializers import FacilitySerializer, OccupiedDateSerializer, UserSerializer
from rest_framework.authtoken.models import Token

#Create your views here
@api_view(['GET'])
def api_root(request,format=None):
    return Response({
        'facility':reverse('facility-list', request=request, format=format)
    })

class FacilityList(generics.ListCreateAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [IsAdminOrReadOnly]


class FacilityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [IsAdminOrReadOnly]

class OccupiedDatesList(generics.ListCreateAPIView):
    queryset = OccupiedDate.objects.all()
    serializer_class = OccupiedDateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_superuser and not user.is_staff: #If user is not a superuser or a staff, will return data only related to the user
            return OccupiedDate.objects.filter(user=user)
        
        return super().get_queryset() #Else will return all data
     

class OccupiedDatesDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = OccupiedDate.objects.all()
    serializer_class = OccupiedDateSerializer
    permission_classes = [IsAdminOrReadOnly]

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff: 
            return User.objects.all()
        else: 
            return User.objects.filter(id=user.id) #If user is not a superuser or a staff, will return data only related to the user

class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self):
        user = self.request.user
        obj = super().get_object()

        if obj == user or user.is_staff or user.is_superuser:
            return obj
        else:
            raise permissions.PermissionDenied("You do not have permission to access this users details.")

class Register(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()

        token, created = Token.objects.get_or_create(user=user)

        self.response_data = {
            "user": {
                "id": user.id,
                "username": user.email,
                "email": user.email,
                "full_name": user.full_name
            },
            "token": token.key
        }

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(self.response_data)
    

class Login(APIView):
    def post(self,request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            raise AuthenticationFailed('Invalid username or password')

        token,created = Token.objects.get_or_create(user=user)

        return Response({
            "user": {
                "id": user.id,
                "username": user.email,
                "email": user.email,
                "full_name": user.full_name
            },
            "token": token.key
        })