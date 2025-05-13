from rest_framework import viewsets, status, filters as drf_filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import Team, Player, Match, Goal, MatchResult
from ..serializers import GoalSerializer, GoalCreateSerializer
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action


class GoalViewSet(viewsets.ModelViewSet):
    """ViewSet cho quản lý bàn thắng"""
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return GoalCreateSerializer
        return GoalSerializer

    @action(detail=False, methods=['get'], url_path='match/(?P<match_id>[^/.]+)')
    def get_goals_by_match(self, request, match_id=None):
        """Lấy tất cả bàn thắng của một trận đấu cụ thể"""
        match = get_object_or_404(Match, pk=match_id)
        goals = Goal.objects.filter(match=match).order_by('minute')

        serializer = self.get_serializer(goals, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='player/(?P<player_id>[^/.]+)')
    def get_goals_by_player(self, request, player_id=None):
        """Lấy tất cả bàn thắng của một cầu thủ cụ thể"""
        player = get_object_or_404(Player, pk=player_id)
        goals = Goal.objects.filter(player=player).order_by(
            'match__match_date', 'minute')

        serializer = self.get_serializer(goals, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='team/(?P<team_id>[^/.]+)')
    def get_goals_by_team(self, request, team_id=None):
        """Lấy tất cả bàn thắng của một đội cụ thể"""
        team = get_object_or_404(Team, pk=team_id)

        # Lấy danh sách cầu thủ của đội
        players = Player.objects.filter(team=team)

        # Lấy tất cả bàn thắng của các cầu thủ trong đội
        goals = Goal.objects.filter(player__in=players).order_by(
            'match__match_date', 'minute')

        serializer = self.get_serializer(goals, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='add-to-match/(?P<match_id>[^/.]+)')
    def add_goal_to_match(self, request, match_id=None):
        """API để thêm bàn thắng vào trận đấu"""
        match = get_object_or_404(Match, pk=match_id)

        # Kiểm tra xem trận đấu đã có kết quả chưa
        try:
            match_result = MatchResult.objects.get(match=match)
        except MatchResult.DoesNotExist:
            return Response(
                {"detail": "Cần tạo kết quả trận đấu trước khi thêm bàn thắng."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = GoalCreateSerializer(data=request.data)

        if serializer.is_valid():
            player = get_object_or_404(
                Player, pk=serializer.validated_data['player'].id)

            # Kiểm tra cầu thủ phải thuộc một trong hai đội
            if player.team != match.home_team and player.team != match.away_team:
                return Response(
                    {"detail": "Cầu thủ ghi bàn phải thuộc một trong hai đội thi đấu"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            goal = Goal.objects.create(
                match=match,
                player=player,
                goal_type=serializer.validated_data['goal_type'],
                minute=serializer.validated_data['minute']
            )

            # Cập nhật tỷ số
            if player.team == match.home_team:
                match_result.home_score += 1
            else:
                match_result.away_score += 1
            match_result.save()

            response_serializer = GoalSerializer(goal)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
