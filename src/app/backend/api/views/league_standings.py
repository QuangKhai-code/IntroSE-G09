from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from ..models import MatchResult, Match, Team
from ..serializers import TeamStandingSerializer
from django.db.models import Q
import functools
from collections import defaultdict

class LeagueStandingsAPIView(APIView):
    """
    API để lấy bảng xếp hạng giải đấu theo BM5.1.
    Dữ liệu tỷ số được lấy từ model MatchResult.
    """
    permission_classes = [AllowAny]
    queryset = None  # Để tránh lỗi AssertionError với APIView

    def get(self, request, *args, **kwargs):
        report_date = timezone.now().strftime("%Y-%m-%d %H:%M:%S")

        # Lấy tất cả các MatchResult (nghĩa là các trận đã có kết quả)
        # Và select_related để lấy thông tin Match và các Team liên quan trong 1 query
        completed_match_results = MatchResult.objects.select_related(
            'match',
            'match__home_team',
            'match__away_team'
        ).all()

        team_stats = defaultdict(lambda: {
            'id': 0, 'name': '', 'played': 0, 'won': 0, 'drawn': 0, 'lost': 0,
            'goals_for': 0, 'goals_against': 0, 'points': 0
        })

        all_teams = Team.objects.all()
        for team in all_teams:
            team_stats[team.id]['id'] = team.id
            team_stats[team.id]['name'] = team.name

        # Tính toán chỉ số từ các MatchResult
        for result in completed_match_results:
            match = result.match  # Lấy đối tượng Match từ MatchResult
            home_team_id = match.home_team_id
            away_team_id = match.away_team_id
            home_score = result.home_score  # Lấy tỷ số từ MatchResult
            away_score = result.away_score  # Lấy tỷ số từ MatchResult

            # Cập nhật cho đội nhà
            team_stats[home_team_id]['played'] += 1
            team_stats[home_team_id]['goals_for'] += home_score
            team_stats[home_team_id]['goals_against'] += away_score

            # Cập nhật cho đội khách
            team_stats[away_team_id]['played'] += 1
            team_stats[away_team_id]['goals_for'] += away_score
            team_stats[away_team_id]['goals_against'] += home_score

            # Xác định kết quả và cập nhật điểm, thắng/hòa/thua
            if home_score > away_score:  # Đội nhà thắng
                team_stats[home_team_id]['won'] += 1
                team_stats[home_team_id]['points'] += 3
                team_stats[away_team_id]['lost'] += 1
            elif home_score < away_score:  # Đội khách thắng
                team_stats[away_team_id]['won'] += 1
                team_stats[away_team_id]['points'] += 3
                team_stats[home_team_id]['lost'] += 1
            else:  # Hòa
                team_stats[home_team_id]['drawn'] += 1
                team_stats[home_team_id]['points'] += 1
                team_stats[away_team_id]['drawn'] += 1
                team_stats[away_team_id]['points'] += 1

        standings_data = []
        for team_id, stats in team_stats.items():
            stats['goal_difference'] = stats['goals_for'] - \
                stats['goals_against']
            standings_data.append(stats)

        # --- Logic Sắp xếp theo QĐ5 ---
        def compare_teams_for_ranking(team1_stats, team2_stats):
            # 1. Điểm
            if team1_stats['points'] != team2_stats['points']:
                return team2_stats['points'] - team1_stats['points']
            # 2. Hiệu số
            if team1_stats['goal_difference'] != team2_stats['goal_difference']:
                return team2_stats['goal_difference'] - team1_stats['goal_difference']
            # 3. Tổng bàn thắng
            if team1_stats['goals_for'] != team2_stats['goals_for']:
                return team2_stats['goals_for'] - team1_stats['goals_for']

            # 4. Đối đầu (Head-to-Head)
            # Để implement đối đầu, bạn cần truy vấn lại MatchResult dựa trên team1_id và team2_id
            # Lấy tất cả các trận đấu (Match) giữa hai đội này
            matches_between_teams = Match.objects.filter(
                (Q(home_team_id=team1_stats['id'], away_team_id=team2_stats['id'])) |
                (Q(home_team_id=team2_stats['id'],
                 away_team_id=team1_stats['id']))
            ).prefetch_related('result')  # prefetch_related 'result' (MatchResult)

            t1_h2h_pts = 0
            t2_h2h_pts = 0
            t1_h2h_gf = 0
            t2_h2h_gf = 0
            t1_h2h_ga = 0
            t2_h2h_ga = 0

            for h2h_match in matches_between_teams:
                if hasattr(h2h_match, 'result') and h2h_match.result:  # Kiểm tra có kết quả không
                    h2h_result = h2h_match.result
                    h2h_home_score = h2h_result.home_score
                    h2h_away_score = h2h_result.away_score

                    # team1 là đội nhà
                    if h2h_match.home_team_id == team1_stats['id']:
                        t1_h2h_gf += h2h_home_score
                        t1_h2h_ga += h2h_away_score
                        t2_h2h_gf += h2h_away_score
                        t2_h2h_ga += h2h_home_score
                        if h2h_home_score > h2h_away_score:
                            t1_h2h_pts += 3
                        elif h2h_home_score < h2h_away_score:
                            t2_h2h_pts += 3
                        else:
                            t1_h2h_pts += 1
                            t2_h2h_pts += 1
                    else:  # team1 là đội khách (team2 là đội nhà)
                        t1_h2h_gf += h2h_away_score
                        t1_h2h_ga += h2h_home_score
                        t2_h2h_gf += h2h_home_score
                        t2_h2h_ga += h2h_away_score
                        if h2h_away_score > h2h_home_score:
                            t1_h2h_pts += 3
                        elif h2h_away_score < h2h_home_score:
                            t2_h2h_pts += 3
                        else:
                            t1_h2h_pts += 1
                            t2_h2h_pts += 1

            if t1_h2h_pts != t2_h2h_pts:
                return t2_h2h_pts - t1_h2h_pts

            # Nếu điểm đối đầu bằng nhau, xét hiệu số đối đầu
            t1_h2h_gd = t1_h2h_gf - t1_h2h_ga
            t2_h2h_gd = t2_h2h_gf - t2_h2h_ga
            if t1_h2h_gd != t2_h2h_gd:
                return t2_h2h_gd - t1_h2h_gd

            # Nếu hiệu số đối đầu bằng nhau, xét bàn thắng đối đầu
            if t1_h2h_gf != t2_h2h_gf:
                return t2_h2h_gf - t1_h2h_gf

            # 5. Theo tên đội (alphabetical) nếu tất cả bằng nhau
            if team1_stats['name'] < team2_stats['name']:
                return -1
            if team1_stats['name'] > team2_stats['name']:
                return 1
            return 0

        standings_data.sort(key=functools.cmp_to_key(
            compare_teams_for_ranking))

        serializer = TeamStandingSerializer(standings_data, many=True)
        return Response({
            "report_date": report_date,
            "standings": serializer.data
        }, status=status.HTTP_200_OK)