from django.urls import path, include 
from . import views 
from rest_framework.routers import DefaultRouter  

router = DefaultRouter()
router.register(r'teams', views.TeamViewSet)
router.register(r'players', views.PlayerViewSet)
router.register(r'rounds', views.RoundViewSet)
router.register(r'matches', views.MatchViewSet)
router.register(r'match-results', views.MatchResultViewSet)
router.register(r'goals', views.GoalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
