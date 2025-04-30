
from rest_framework import serializers

from .models import Facility, FacilityImage

class FacilityImageSerializer(serializers.ModelSerializer):
    room = serializers.HyperlinkedRelatedField(
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