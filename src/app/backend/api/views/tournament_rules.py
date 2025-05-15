from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from ..models.TournamentRule import TournamentRule
from ..serializers.tournament_rule_serializers import TournamentRuleSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class TournamentRuleViewSet(viewsets.ModelViewSet):
    queryset = TournamentRule.objects.all()
    serializer_class = TournamentRuleSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Lấy quy định hiện tại của giải đấu"""
        # Lấy quy định mới nhất
        current_rule = self.get_queryset().order_by('-updated_at').first()
        if current_rule:
            serializer = self.get_serializer(current_rule)
            return Response(serializer.data)

        # Nếu chưa có quy định nào, tạo mới và trả về
        instance = TournamentRule.objects.create()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Tạo quy định mới
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # Cập nhật quy định
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
