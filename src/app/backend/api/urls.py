from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeamViewSet,
    PlayerViewSet,
    MatchViewSet,
    MatchResultViewSet,
    GoalViewSet,
    RoundViewSet,
    TournamentRuleViewSet,
    LeagueStandingsAPIView,
    TopScorersAPIView,
)

router = DefaultRouter()
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'matches', MatchViewSet)
router.register(r'match-results', MatchResultViewSet)
router.register(r'rounds', RoundViewSet)
router.register(r'tournament-rules', TournamentRuleViewSet)
router.register(r'goals', GoalViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('league-standings/', LeagueStandingsAPIView.as_view(),
         name='league-standings'),
    path('top-scorers/', TopScorersAPIView.as_view(), name='top-scorers'),
]
