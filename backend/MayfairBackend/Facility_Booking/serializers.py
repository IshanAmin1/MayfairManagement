
from rest_framework import serializers

from .models import Facility, FacilityImage, OccupiedDate, User

class FacilityImageSerializer(serializers.ModelSerializer):
    facility = serializers.HyperlinkedRelatedField(
        view_name = 'facility-detail',
        queryset = Facility.objects.all()),
    class Meta:
        model = FacilityImage
        fields = ['id', 'image', 'caption', 'facility']

class FacilitySerializer(serializers.HyperlinkedModelSerializer):
    images = FacilityImageSerializer(many=True, read_only=True)
    class Meta:
        model = Facility
        fields = ['url', 'id', 'name', 'type', 'description', 'maxOccupancy', 'images']

class OccupiedDateSerializer(serializers.HyperlinkedModelSerializer):
    facility = serializers.HyperlinkedRelatedField(
        view_name = 'facility-detail',
        queryset = Facility.objects.all()),
    class Meta:
        model = OccupiedDate
        fields = ['url', 'id', 'facility', 'date']

from django.contrib.auth.hashers import make_password
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'id', 'username', 'password', 'email', 'full_name']
    
    def validate_password(self,value):
        return make_password(value)