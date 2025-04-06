from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from rest_framework.decorators import action
from django.contrib.auth.models import User 
from rest_framework import generics
from .serializers import NoteSerializer, UserSerializer, TeamSerializer, PlayerSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Team, Player

# Create your views here.

class NoteListCreate(generics.ListCreateAPIView): 
    serializer_class = NoteSerializer 
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user 
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid(): 
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteListDelete(generics.DestroyAPIView): 
    serializer_class = NoteSerializer 
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user 
        return Note.objects.filter(author=user)
            
class CreateUserView(generics.CreateAPIView): 
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [AllowAny] 
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def team_stats(self, request, pk=None):
        team = self.get_object()
        domestic_count = team.players.filter(player_type='domestic').count()
        foreign_count = team.players.filter(player_type='foreign').count()
        
        stats = {
            'team_name': team.name,
            'total_players': team.players.count(),
            'domestic_players': domestic_count,
            'foreign_players': foreign_count,
        }
        
        return Response(stats)

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [AllowAny] 
