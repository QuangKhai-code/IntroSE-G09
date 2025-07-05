from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from ..models import Player, Goal
from ..serializers import PlayerWithGoalStatsSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters as drf_filters
from django.db import models
from django.db.models import OuterRef, Subquery, Count
from django.db.models.functions import Coalesce
from ..filters import PlayerFilter
from django.utils import timezone
from rest_framework.response import Response


class PlayerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API để tra cứu thông tin cầu thủ theo Biểu mẫu 4.
    Hỗ trợ tìm kiếm theo tên, lọc theo đội, loại cầu thủ.
    Hỗ trợ sắp xếp theo tên, đội, loại, tổng số bàn thắng.

    Query Parameters:
    - `name__icontains=<giá trị>`: Tìm kiếm tên cầu thủ (không phân biệt hoa thường).
    - `team_id=<id>`: Lọc theo ID đội.
    - `team_name__icontains=<tên đội>`: Lọc theo tên đội.
    - `player_type=<domestic|foreign>`: Lọc theo loại cầu thủ.
    - `ordering=<field>`: Sắp xếp. Ví dụ: `ordering=name`, `ordering=-total_goals`.
      Các trường có thể sắp xếp: 'name', 'team__name', 'player_type', 'total_goals'.
    """
    queryset = Player.objects.all()
    serializer_class = PlayerWithGoalStatsSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend,
                       drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_class = PlayerFilter
    search_fields = ['name', 'team__name']
    ordering_fields = ['name', 'team__name',
                       'birthdate', 'player_type', 'total_goals']
    ordering = ['name']  # Sắp xếp mặc định theo tên cầu thủ

    def get_queryset(self):
        """
        Ghi đè queryset để annotate (đếm) tổng số bàn thắng cho mỗi cầu thủ.
        """
        # Tạo một subquery để đếm số bàn thắng cho mỗi cầu thủ
        goal_subquery = Goal.objects.filter(
            player_id=OuterRef('pk')
        ).values(
            'player_id'
        ).annotate(
            count=Count('id')
        ).values(
            'count'
        )

        queryset = Player.objects.select_related('team').annotate(
            # Sử dụng Coalesce để chuyển null thành 0
            total_goals=Coalesce(
                Subquery(goal_subquery[:1],
                         output_field=models.IntegerField()),
                0,
                output_field=models.IntegerField()
            )
        )

        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        report_tstamp = timezone.now().strftime("%Y-%m-%d %H:%M:%S")

        # Check if response.data is paginated (has 'results' key)
        if hasattr(response.data, 'get') and response.data.get('results') is not None:
            response.data['report_date'] = report_tstamp
        else:
            # For non-paginated or direct list (though usually paginated by default)
            response.data = {
                "report_date": report_tstamp,
                "results": response.data
            }
        return response

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        report_tstamp = timezone.now().strftime("%Y-%m-%d %H:%M:%S")

        return Response({
            "report_date": report_tstamp,
            "player_data": serializer.data
        })
