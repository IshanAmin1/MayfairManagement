from django.urls import path
from Facility_Booking import views
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path('', views.api_root, name="api-root"),
    path('facilities/', views.FacilityList.as_view(), name='facility-list'),
    path('facilities/<int:pk>/', views.FacilityDetail.as_view(), name='facility-detail'),
]

urlpatterns = format_suffix_patterns(urlpatterns)

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)