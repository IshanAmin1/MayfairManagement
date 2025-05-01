from django.contrib import admin
from .models import Facility, FacilityImage, OccupiedDate

admin.site.register(Facility)
admin.site.register(FacilityImage)
admin.site.register(OccupiedDate)