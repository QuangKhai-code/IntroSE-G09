from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User 
from rest_framework import generics
from .serializers import UserSerializer, TeamSerializer, PlayerSerializer, MatchSerializer, MatchListSerializer, RoundSerializer, RoundWithMatchesSerializer, MatchResultSerializer, MatchResultCreateSerializer, GoalSerializer, GoalCreateSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Team, Player, Round, Match, Goal, MatchResult
from datetime import datetime, timedelta

            
class CreateUserView(generics.CreateAPIView): 
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

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
        if team.players.count() >= 22:
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
        player_serializer = PlayerSerializer(player, data=request.data, partial=True)
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

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [AllowAny] 

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
            end_date = current_date + timedelta(days=6)  # Mỗi vòng kéo dài 1 tuần
            round_obj = Round.objects.create(
                number=round_num,
                start_date=current_date,
                end_date=end_date
            )
            rounds.append(round_obj)
            current_date = end_date + timedelta(days=1)  # Ngày bắt đầu vòng tiếp theo
        
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
                match_date = round_obj.start_date + timedelta(days=(match.match_date - first_leg_round.start_date).days)
                
                Match.objects.create(
                    round=round_obj,
                    home_team=match.away_team,
                    away_team=match.home_team,
                    match_date=match_date,
                    match_time=match.match_time,
                    stadium=match.away_team.home_stadium
                )
        
        return Response({"detail": f"Đã tạo lịch thi đấu với {total_rounds} vòng đấu"})

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
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop('partial', False))
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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
    
    # @action(detail=False, methods=['get'], url_path='team/(?P<team_id>[^/.]+)')
    # def get_results_by_team(self, request, team_id=None):
    #     """Lấy tất cả kết quả trận đấu của một đội"""
    #     team = get_object_or_404(Team, pk=team_id)
        
    #     # Tìm tất cả trận đấu của đội
    #     matches = Match.objects.filter(models.Q(home_team=team) | models.Q(away_team=team))
        
    #     # Lấy kết quả của các trận đấu đó
    #     results = MatchResult.objects.filter(match__in=matches)
        
    #     serializer = self.get_serializer(results, many=True)
    #     return Response(serializer.data)
        
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
        serializer = MatchResultCreateSerializer(data=request.data, context={'match': match})
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
                    player=goal_data['player'],  # Đã là đối tượng Player, không cần .id
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

                # --- SỬA PHẦN TẠO GOAL ---
                goals_to_create = []
                for goal_data in goals_data:
                    # Lấy đối tượng Player từ validated_data
                    player_object = goal_data.get('player')

                    # Kiểm tra cơ bản (nên được validate chặt hơn ở serializer)
                    if not player_object:
                        continue # Bỏ qua nếu không có player

                    goals_to_create.append(
                        Goal( # Tạo instance, chưa save
                            match=match,
                            player=player_object,       # Gán đối tượng Player
                            goal_type=goal_data['goal_type'],
                            minute=goal_data['minute']
                        )
                    )

                # Dùng bulk_create để tạo hiệu quả
                if goals_to_create:
                    Goal.objects.bulk_create(goals_to_create)

            result_serializer = MatchResultSerializer(match_result, context={'request': request}) # Thêm context nếu cần
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
        goals = Goal.objects.filter(player=player).order_by('match__match_date', 'minute')
        
        serializer = self.get_serializer(goals, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'], url_path='team/(?P<team_id>[^/.]+)')
    def get_goals_by_team(self, request, team_id=None):
        """Lấy tất cả bàn thắng của một đội cụ thể"""
        team = get_object_or_404(Team, pk=team_id)
        
        # Lấy danh sách cầu thủ của đội
        players = Player.objects.filter(team=team)
        
        # Lấy tất cả bàn thắng của các cầu thủ trong đội
        goals = Goal.objects.filter(player__in=players).order_by('match__match_date', 'minute')
        
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
            player = get_object_or_404(Player, pk=serializer.validated_data['player'].id)
            
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