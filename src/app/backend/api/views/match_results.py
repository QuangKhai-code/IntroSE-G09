from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import MatchResult, Match, Round, Goal
from ..serializers import MatchResultSerializer, MatchResultCreateSerializer
from django.shortcuts import get_object_or_404
from django.db import transaction


class MatchResultViewSet(viewsets.ModelViewSet):
    """ViewSet cho quản lý kết quả trận đấu"""
    queryset = MatchResult.objects.all()
    serializer_class = MatchResultSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return MatchResultCreateSerializer
        return MatchResultSerializer

    @action(detail=False, methods=['get'], url_path='by-match/(?P<match_id>[^/.]+)')
    def get_result_by_match(self, request, match_id=None):
        """Lấy kết quả của một trận đấu cụ thể"""
        match = get_object_or_404(Match, pk=match_id)
        try:
            result = MatchResult.objects.get(match=match)
            serializer = self.get_serializer(result)
            return Response(serializer.data)
        except MatchResult.DoesNotExist:
            return Response(
                {"detail": "Trận đấu này chưa có kết quả."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], url_path='bm3/(?P<match_id>[^/.]+)')
    def get_match_result_bm3(self, request, match_id=None):
        """Lấy kết quả trận đấu theo định dạng biểu mẫu BM3"""
        match = get_object_or_404(Match, pk=match_id)

        try:
            result = MatchResult.objects.get(match=match)

            # Lấy danh sách bàn thắng và sắp xếp theo thời gian
            goals = Goal.objects.filter(match=match).order_by('minute')
            goals_data = []

            for index, goal in enumerate(goals, 1):
                goals_data.append({
                    "stt": index,
                    "cau_thu": goal.player.name,
                    "doi": goal.player.team.name,
                    "loai_ban_thang": goal.goal_type,
                    "thoi_diem": goal.minute
                })

            # Tạo response theo định dạng BM3
            response_data = {
                "ket_qua_thi_dau": {
                    "doi_1": match.home_team.name,
                    "doi_2": match.away_team.name,
                    "ty_so": f"{result.home_score} - {result.away_score}",
                    "san": match.stadium,
                    "ngay": match.match_date.strftime("%d/%m/%Y"),
                    "gio": match.match_time.strftime("%H:%M")
                },
                "ban_thang": goals_data
            }

            return Response(response_data)

        except MatchResult.DoesNotExist:
            return Response(
                {"detail": "Trận đấu này chưa có kết quả."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], url_path='round/(?P<round_id>[^/.]+)')
    def get_results_by_round(self, request, round_id=None):
        """Lấy tất cả kết quả trận đấu của một vòng đấu"""
        round_obj = get_object_or_404(Round, pk=round_id)

        # Tìm tất cả trận đấu trong vòng đấu
        matches = Match.objects.filter(round=round_obj)

        # Lấy kết quả của các trận đấu đó
        results = MatchResult.objects.filter(match__in=matches)

        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='record/(?P<match_id>[^/.]+)')
    @transaction.atomic
    def record_match_result(self, request, match_id=None):
        """API để ghi nhận kết quả trận đấu theo BM3"""
        match = get_object_or_404(Match, pk=match_id)

        # Kiểm tra xem trận đấu đã có kết quả chưa
        try:
            result = MatchResult.objects.get(match=match)
            # Nếu đã có kết quả, trả về lỗi hoặc update kết quả hiện tại
            return Response(
                {"detail": "Trận đấu này đã có kết quả. Sử dụng API update nếu muốn cập nhật."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except MatchResult.DoesNotExist:
            # Tạo mới kết quả nếu chưa có
            pass

        # Tạo context với match để validate
        serializer = MatchResultCreateSerializer(
            data=request.data, context={'match': match})
        if serializer.is_valid():
            goals_data = serializer.validated_data.pop('goals', [])
            # Tạo MatchResult
            match_result = MatchResult.objects.create(
                match=match,
                home_score=serializer.validated_data.get('home_score', 0),
                away_score=serializer.validated_data.get('away_score', 0)
            )
            # Tạo các Goal
            goals = []
            for goal_data in goals_data:
                # player là đối tượng Player từ PrimaryKeyRelatedField
                goal = Goal.objects.create(
                    match=match,
                    # Đã là đối tượng Player, không cần .id
                    player=goal_data['player'],
                    goal_type=goal_data['goal_type'],
                    minute=goal_data['minute']
                )
                goals.append(goal)

            # # Trả về kết quả đầy đủ
            result_serializer = MatchResultSerializer(match_result)
            return Response(result_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put', 'patch'], url_path='update-result')
    @transaction.atomic
    def update_match_result(self, request, pk=None):
        """API để cập nhật kết quả trận đấu"""
        match_result = self.get_object()
        match = match_result.match

        # Tạo context với match để validate
        serializer = MatchResultCreateSerializer(
            match_result,
            data=request.data,
            context={'match': match},
            partial=True if request.method == 'PATCH' else False
        )

        if serializer.is_valid():
            goals_data = serializer.validated_data.pop('goals', None)

            # Cập nhật MatchResult
            if 'home_score' in serializer.validated_data:
                match_result.home_score = serializer.validated_data['home_score']
            if 'away_score' in serializer.validated_data:
                match_result.away_score = serializer.validated_data['away_score']
            match_result.save()

            # Xử lý goals nếu được cung cấp
            if goals_data is not None:
                # Xóa các goal hiện tại
                Goal.objects.filter(match=match).delete()

                goals_to_create = []
                for goal_data in goals_data:
                    player_object = goal_data.get('player')
                    if not player_object:
                        continue

                    goals_to_create.append(
                        Goal(
                            match=match,
                            player=player_object,
                            goal_type=goal_data['goal_type'],
                            minute=goal_data['minute']
                        )
                    )
                if goals_to_create:
                    Goal.objects.bulk_create(goals_to_create)

            result_serializer = MatchResultSerializer(
                match_result, context={'request': request})  # Thêm context nếu cần
            return Response(result_serializer.data)

    @action(detail=False, methods=['delete'], url_path='delete/(?P<match_id>[^/.]+)')
    @transaction.atomic
    def delete_match_result(self, request, match_id=None):
        """API để xóa kết quả trận đấu"""
        match = get_object_or_404(Match, pk=match_id)

        try:
            result = MatchResult.objects.get(match=match)

            # Xóa tất cả các bàn thắng liên quan đến trận đấu này
            Goal.objects.filter(match=match).delete()

            # Xóa kết quả trận đấu
            result.delete()

            return Response(
                {"detail": "Đã xóa kết quả trận đấu thành công."},
                status=status.HTTP_204_NO_CONTENT
            )
        except MatchResult.DoesNotExist:
            return Response(
                {"detail": "Trận đấu này chưa có kết quả để xóa."},
                status=status.HTTP_404_NOT_FOUND
            )
