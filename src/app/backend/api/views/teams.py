from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Team, Player, Match, Goal
from ..serializers.team_serializers import TeamSerializer
from ..serializers.player_serializers import PlayerSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.db.models import Q


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

    @transaction.atomic
    @action(detail=True, methods=['delete'])
    def delete_team(self, request, pk=None):
        """
        Xóa đội bóng và tất cả dữ liệu liên quan.
        Chỉ cho phép xóa nếu đội chưa tham gia trận đấu nào.
        """
        team = self.get_object()

        # Kiểm tra xem đội có tham gia trận đấu nào không
        if Match.objects.filter(Q(home_team=team) | Q(away_team=team)).exists():
            return Response(
                {"detail": "Không thể xóa đội bóng vì đã tham gia các trận đấu"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra xem có cầu thủ nào của đội đã ghi bàn không
        if Goal.objects.filter(player__team=team).exists():
            return Response(
                {"detail": "Không thể xóa đội bóng vì có cầu thủ đã ghi bàn"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Xóa tất cả cầu thủ của đội
        team.players.all().delete()

        # Xóa đội bóng
        team.delete()

        return Response(
            {"detail": "Đã xóa đội bóng và tất cả cầu thủ thành công"},
            status=status.HTTP_200_OK
        )

    @transaction.atomic
    @action(detail=True, methods=['patch'])
    def update_team_info(self, request, pk=None):
        """
        Cập nhật thông tin cơ bản của đội bóng (không thay đổi danh sách cầu thủ)
        """
        team = self.get_object()

        # Chỉ cập nhật các trường được gửi trong request
        if 'name' in request.data:
            team.name = request.data['name']
        if 'home_stadium' in request.data:
            team.home_stadium = request.data['home_stadium']

        team.save()
        return Response(TeamSerializer(team).data)

    @transaction.atomic
    @action(detail=True, methods=['post'])
    def add_player(self, request, pk=None):
        """
        Thêm một cầu thủ mới vào đội bóng
        """
        team = self.get_object()

        # Kiểm tra số lượng cầu thủ
        if team.players.count() >= 30:
            return Response(
                {"detail": "Đội bóng đã có đủ 22 cầu thủ, không thể thêm mới"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra số lượng cầu thủ nước ngoài nếu thêm cầu thủ nước ngoài
        if request.data.get('player_type') == 'foreign' and team.players.filter(player_type='foreign').count() >= 3:
            return Response(
                {"detail": "Đội bóng chỉ được có tối đa 3 cầu thủ nước ngoài"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Tạo và lưu cầu thủ mới
        player_serializer = PlayerSerializer(data=request.data)
        if player_serializer.is_valid():
            player_serializer.save(team=team)
            return Response(player_serializer.data, status=status.HTTP_201_CREATED)
        return Response(player_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    @action(detail=True, methods=['delete'])
    def remove_player(self, request, pk=None):
        """
        Xóa một cầu thủ khỏi đội bóng
        """
        team = self.get_object()
        player_id = request.data.get('player_id')

        if not player_id:
            return Response(
                {"detail": "ID cầu thủ không được cung cấp"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            player = team.players.get(id=player_id)
        except Player.DoesNotExist:
            return Response(
                {"detail": "Không tìm thấy cầu thủ trong đội bóng này"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Kiểm tra nếu xóa cầu thủ có làm số lượng cầu thủ giảm xuống dưới 15 không
        if team.players.count() <= 15:
            return Response(
                {"detail": "Không thể xóa cầu thủ vì đội bóng phải có ít nhất 15 cầu thủ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        player.delete()
        return Response({"detail": "Đã xóa cầu thủ khỏi đội bóng"}, status=status.HTTP_200_OK)

    @transaction.atomic
    @action(detail=True, methods=['put', 'patch'])
    def update_player(self, request, pk=None):
        """
        Cập nhật thông tin của một cầu thủ trong đội bóng
        """
        team = self.get_object()
        player_id = request.data.get('id')

        if not player_id:
            return Response(
                {"detail": "ID cầu thủ không được cung cấp"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            player = team.players.get(id=player_id)
        except Player.DoesNotExist:
            return Response(
                {"detail": "Không tìm thấy cầu thủ trong đội bóng này"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Kiểm tra nếu cập nhật làm tăng số lượng cầu thủ nước ngoài quá giới hạn
        current_type = player.player_type
        new_type = request.data.get('player_type')

        if current_type == 'domestic' and new_type == 'foreign':
            foreign_count = team.players.filter(player_type='foreign').count()
            if foreign_count >= 3:
                return Response(
                    {"detail": "Đội bóng chỉ được có tối đa 3 cầu thủ nước ngoài"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Cập nhật thông tin cầu thủ
        player_serializer = PlayerSerializer(
            player, data=request.data, partial=True)
        if player_serializer.is_valid():
            player_serializer.save()
            return Response(player_serializer.data)
        return Response(player_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def team_stats(self, request, pk=None):
        team = self.get_object()
        domestic_count = team.players.filter(player_type='domestic').count()
        foreign_count = team.players.filter(player_type='foreign').count()

        stats = {
            'team_name': team.name,
            'home_stadium': team.home_stadium,
            'total_players': team.players.count(),
            'domestic_players': domestic_count,
            'foreign_players': foreign_count,
        }

        return Response(stats)
