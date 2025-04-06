from django.urls import path, include 
from . import views 
from rest_framework.routers import DefaultRouter  

router = DefaultRouter()
router.register(r'teams', views.TeamViewSet)
router.register(r'players', views.PlayerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
