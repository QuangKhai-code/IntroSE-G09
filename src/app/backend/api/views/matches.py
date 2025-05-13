from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import Match
from ..serializers import MatchSerializer
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response


class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all().order_by('round', 'match_date', 'match_time')
    serializer_class = MatchSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Lọc theo vòng đấu nếu có tham số
        round_id = self.request.query_params.get('round')
        if round_id:
            queryset = queryset.filter(round_id=round_id)
        return queryset

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
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.pop('partial', False))
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
