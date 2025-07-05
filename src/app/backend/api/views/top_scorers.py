from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from ..models import Player
from ..serializers import TopScorerSerializer
from django.utils import timezone
from django.db.models import Count, OuterRef, Subquery, IntegerField
from django.db.models.functions import Coalesce
from rest_framework import filters as drf_filters
from rest_framework import generics
from ..models import Goal


class TopScorersAPIView(generics.ListAPIView):
    """
    API để lấy danh sách cầu thủ ghi bàn theo BM5.2.
    Sắp xếp mặc định theo số bàn thắng giảm dần.
    """
    serializer_class = TopScorerSerializer
    permission_classes = [AllowAny]
    filter_backends = [drf_filters.OrderingFilter, drf_filters.SearchFilter]
    search_fields = ['name', 'team__name']
    ordering_fields = ['total_goals', 'name', 'team__name']
    ordering = ['-total_goals', 'name']

    def get_queryset(self):
        # Ngày tạo báo cáo, có thể đưa vào response
        report_date = timezone.now().strftime("%Y-%m-%d %H:%M:%S")

        # Subquery để đếm bàn thắng
        goal_subquery = Goal.objects.filter(
            player_id=OuterRef('pk')
        ).values('player_id').annotate(count=Count('id')).values('count')

        queryset = Player.objects.select_related('team').annotate(
            # Sử dụng Coalesce để chuyển null thành 0
            total_goals=Coalesce(
                Subquery(goal_subquery[:1], output_field=IntegerField()),
                0,
                output_field=IntegerField()
            )
        ).filter(
            total_goals__gt=0  # Chỉ lấy những cầu thủ đã ghi ít nhất 1 bàn
        )

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            # Thêm ngày báo cáo vào response của pagination
            paginated_response.data['report_date'] = timezone.now().strftime(
                "%Y-%m-%d %H:%M:%S")
            return paginated_response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "report_date": timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
            "results": serializer.data  # Nếu không dùng pagination
        })