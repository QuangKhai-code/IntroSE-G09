from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import Round, Match, Team
from ..serializers import RoundSerializer, MatchListSerializer, RoundWithMatchesSerializer
from datetime import datetime, timedelta
from django.db import transaction


class RoundViewSet(viewsets.ModelViewSet):
    queryset = Round.objects.all().order_by('number')
    serializer_class = RoundSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        """Xem danh sách các trận đấu trong một vòng"""
        round_instance = self.get_object()
        matches = round_instance.matches.all().order_by('match_date', 'match_time')
        serializer = MatchListSerializer(matches, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def all_with_matches(self, request):
        """Xem tất cả các vòng đấu kèm danh sách trận đấu"""
        rounds = Round.objects.all().order_by('number')
        serializer = RoundWithMatchesSerializer(rounds, many=True)
        return Response(serializer.data)

    @transaction.atomic
    @action(detail=False, methods=['post'])
    def generate_schedule(self, request):
        """Tự động tạo lịch thi đấu cho toàn bộ giải"""
        # Xóa tất cả các vòng đấu và trận đấu cũ nếu có
        Match.objects.all().delete()
        Round.objects.all().delete()

        # Lấy danh sách đội bóng
        teams = Team.objects.all()
        team_count = teams.count()

        if team_count < 2:
            return Response(
                {"detail": "Cần ít nhất 2 đội bóng để tạo lịch thi đấu"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Nếu số đội là lẻ, thêm một "đội nghỉ"
        if team_count % 2 != 0:
            team_count += 1

        # Số vòng đấu cần thiết để mỗi đội gặp mỗi đội khác đúng 2 lần
        total_rounds = (team_count - 1) * 2

        # Thông tin vòng đấu từ request
        start_date = request.data.get('start_date')
        days_between_rounds = request.data.get('days_between_rounds', 7)

        if not start_date:
            return Response(
                {"detail": "Cần cung cấp ngày bắt đầu giải đấu"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Tạo các vòng đấu
        rounds = []
        current_date = datetime.strptime(start_date, '%Y-%m-%d').date()

        for round_num in range(1, total_rounds + 1):
            # Mỗi vòng kéo dài 1 tuần
            end_date = current_date + timedelta(days=6)
            round_obj = Round.objects.create(
                number=round_num,
                start_date=current_date,
                end_date=end_date
            )
            rounds.append(round_obj)
            # Ngày bắt đầu vòng tiếp theo
            current_date = end_date + timedelta(days=1)

        # Tạo các cặp đấu
        teams_list = list(teams)
        if len(teams_list) % 2 != 0:
            teams_list.append(None)  # Thêm đội "bye" (nghỉ)

        n = len(teams_list)
        matches = []

        # Vòng đi
        for round_idx in range(n-1):
            round_obj = rounds[round_idx]
            for i in range(n//2):
                team1 = teams_list[i]
                team2 = teams_list[n-1-i]

                # Bỏ qua nếu có đội nghỉ
                if team1 is None or team2 is None:
                    continue

                # Tạo trận đấu với team1 là chủ nhà
                match_date = round_obj.start_date + timedelta(days=i % 7)
                match_time = f"{12 + (i % 6)}:00"  # Giờ đấu từ 12:00 đến 17:00

                Match.objects.create(
                    round=round_obj,
                    home_team=team1,
                    away_team=team2,
                    match_date=match_date,
                    match_time=match_time,
                    stadium=team1.home_stadium
                )

            # Xoay vòng đội
            teams_list.insert(1, teams_list.pop())

        # Vòng về (đảo ngược sân)
        for round_idx in range(n-1):
            round_obj = rounds[round_idx + n - 1]
            # Lấy các trận đấu của vòng đi tương ứng
            first_leg_round = rounds[round_idx]
            first_leg_matches = Match.objects.filter(round=first_leg_round)

            for match in first_leg_matches:
                # Đảo ngược sân
                match_date = round_obj.start_date + \
                    timedelta(days=(match.match_date -
                              first_leg_round.start_date).days)

                Match.objects.create(
                    round=round_obj,
                    home_team=match.away_team,
                    away_team=match.home_team,
                    match_date=match_date,
                    match_time=match.match_time,
                    stadium=match.away_team.home_stadium
                )

        return Response({"detail": f"Đã tạo lịch thi đấu với {total_rounds} vòng đấu"})
