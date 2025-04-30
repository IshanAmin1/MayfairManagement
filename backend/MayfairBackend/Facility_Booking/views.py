from django.shortcuts import render
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from .models import Facility
from .serializers import FacilitySerializer

#Create your views here
@api_view(['GET'])
def api_root(request,format=None):
    return Response({
        'facility':reverse('facility-list', request=request, format=format)
    })

class FacilityList(generics.ListCreateAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer

class FacilityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    
