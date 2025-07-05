from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import Match
from ..serializers import MatchSerializer, MatchListSerializer
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Q


class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all().order_by('round', 'match_date', 'match_time')
    serializer_class = MatchSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'upcoming':
            return MatchListSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        queryset = super().get_queryset()
        # Lọc theo vòng đấu nếu có tham số (cho các actions mặc định)
        # Không áp dụng filter round cho upcoming
        if self.action not in ['upcoming']:
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

    @action(detail=False, methods=['get'], url_path='upcoming', permission_classes=[AllowAny])
    def upcoming(self, request):
        """
        API để lấy danh sách các trận đấu sắp diễn ra.
        Các trận đấu được coi là sắp diễn ra nếu:
        1. Ngày thi đấu (match_date) lớn hơn hoặc bằng ngày hiện tại.
        2. Chưa có kết quả trận đấu (MatchResult).
        Sắp xếp theo ngày và giờ thi đấu tăng dần.
        """
        now = timezone.now()
        queryset = Match.objects.filter(
            Q(match_date__gt=now.date()) | Q(
                match_date=now.date(), match_time__gte=now.time()),
            result__isnull=True
        ).select_related(
            'home_team', 'away_team', 'round'
        ).order_by('match_date', 'match_time')

        # Pagination
        page = self.paginate_queryset(queryset)
        report_tstamp = timezone.now().strftime("%Y-%m-%d %H:%M:%S")

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            paginated_response.data['report_date'] = report_tstamp
            return paginated_response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "report_date": report_tstamp,
            "results": serializer.data
        })
