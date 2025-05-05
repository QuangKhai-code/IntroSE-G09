from django.contrib.auth.models import User 
from rest_framework import serializers 
from .models import Player, Team, Round, Match, MatchResult, Goal
from datetime import datetime
import pytz

class UserSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = User 
        fields = ("id", "username", "password",)
        extra_kwargs = {"password": {"write_only": True}}
   
    def create(self, validated_data):
        password = validated_data.pop("password")  
        user = User(**validated_data)
        user.set_password(password)  
        user.save()
        return user

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'name', 'birthdate', 'player_type', 'note']
    
    def validate_birthdate(self, value):
        today = datetime.now(pytz.utc).date()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 16 or age > 40:
            raise serializers.ValidationError("Tuổi cầu thủ phải từ 16 đến 40")
        return value

class TeamSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True)
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'home_stadium', 'players']
    
    def validate_players(self, players_data):
        if len(players_data) < 15:
            raise serializers.ValidationError("Đội bóng phải có ít nhất 15 cầu thủ")
        if len(players_data) > 22:
            raise serializers.ValidationError("Đội bóng chỉ được có tối đa 22 cầu thủ")
        
        # Đếm số lượng cầu thủ nước ngoài
        foreign_players = sum(1 for player in players_data if player.get('player_type') == 'foreign')
        if foreign_players > 3:
            raise serializers.ValidationError("Đội bóng chỉ được có tối đa 3 cầu thủ nước ngoài")
        
        return players_data
    
    def create(self, validated_data):
        players_data = validated_data.pop('players')
        team = Team.objects.create(**validated_data)
        
        for player_data in players_data:
            Player.objects.create(team=team, **player_data)
        
        return team
    
    def update(self, instance, validated_data):
        players_data = validated_data.pop('players', None)
        
        # Cập nhật thông tin đội
        instance.name = validated_data.get('name', instance.name)
        instance.home_stadium = validated_data.get('home_stadium', instance.home_stadium)
        instance.save()
        
        if players_data is not None:
            # Xóa tất cả cầu thủ cũ
            instance.players.all().delete()
            
            # Tạo cầu thủ mới
            for player_data in players_data:
                Player.objects.create(team=instance, **player_data)
        
        return instance

class TeamBasicInfoSerializer(serializers.ModelSerializer):
    """Serializer chỉ dành cho thông tin cơ bản của Team"""
    class Meta:
        model = Team
        fields = ['id', 'name', 'home_stadium']

class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = ['id', 'number', 'start_date', 'end_date']
    
    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("Ngày bắt đầu phải trước ngày kết thúc vòng đấu")
        return data

class MatchSerializer(serializers.ModelSerializer):
    home_team_name = serializers.CharField(source='home_team.name', read_only=True)
    away_team_name = serializers.CharField(source='away_team.name', read_only=True)
    round_number = serializers.IntegerField(source='round.number', read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'round', 'round_number', 'home_team', 'home_team_name', 'away_team', 
                  'away_team_name', 'match_date', 'match_time', 'stadium']
    
    def validate(self, data):
        # Kiểm tra đội nhà và đội khách
        if 'home_team' in data and 'away_team' in data and data['home_team'] == data['away_team']:
            raise serializers.ValidationError("Đội nhà và đội khách không được trùng nhau")
        
        # Kiểm tra sân vận động có phù hợp với đội nhà
        if 'home_team' in data and 'stadium' in data:
            if data['home_team'].home_stadium != data['stadium']:
                raise serializers.ValidationError("Đội nhà phải thi đấu trên sân nhà của mình")
        
        # Kiểm tra ngày thi đấu nằm trong khoảng vòng đấu
        if 'round' in data and 'match_date' in data:
            round_obj = data['round']
            if data['match_date'] < round_obj.start_date or data['match_date'] > round_obj.end_date:
                raise serializers.ValidationError("Ngày thi đấu phải nằm trong khoảng thời gian của vòng đấu")
        
        # Kiểm tra mỗi đội chỉ thi đấu 1 trận trong 1 vòng
        if 'round' in data and 'home_team' in data and 'away_team' in data:
            round_obj = data['round']
            home_team = data['home_team']
            away_team = data['away_team']
            
            # Kiểm tra đội nhà đã có trận nào trong vòng đấu này chưa
            home_team_matches = Match.objects.filter(
                models.Q(home_team=home_team) | models.Q(away_team=home_team),
                round=round_obj
            )
            
            if self.instance:
                home_team_matches = home_team_matches.exclude(id=self.instance.id)
                
            if home_team_matches.exists():
                raise serializers.ValidationError(f"Đội {home_team.name} đã có trận đấu khác trong vòng này")
            
            # Kiểm tra đội khách đã có trận nào trong vòng đấu này chưa
            away_team_matches = Match.objects.filter(
                models.Q(home_team=away_team) | models.Q(away_team=away_team),
                round=round_obj
            )
            
            if self.instance:
                away_team_matches = away_team_matches.exclude(id=self.instance.id)
                
            if away_team_matches.exists():
                raise serializers.ValidationError(f"Đội {away_team.name} đã có trận đấu khác trong vòng này")
            
            # Kiểm tra 2 đội chỉ đấu tối đa 2 lần trong cả giải
            previous_matches = Match.objects.filter(
                models.Q(home_team=home_team, away_team=away_team) | 
                models.Q(home_team=away_team, away_team=home_team)
            )
            
            if self.instance:
                previous_matches = previous_matches.exclude(id=self.instance.id)
                
            if previous_matches.count() >= 2:
                raise serializers.ValidationError("Hai đội chỉ được phép đối đầu tối đa 2 lần trong giải")
        
        return data

class MatchListSerializer(serializers.ModelSerializer):
    """Serializer đơn giản hơn cho danh sách trận đấu theo vòng"""
    home_team_name = serializers.CharField(source='home_team.name', read_only=True)
    away_team_name = serializers.CharField(source='away_team.name', read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'home_team_name', 'away_team_name', 'match_date', 'match_time', 'stadium']

class RoundWithMatchesSerializer(serializers.ModelSerializer):
    """Serializer cho vòng đấu kèm danh sách trận"""
    matches = MatchListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Round
        fields = ['id', 'number', 'start_date', 'end_date', 'matches']

class PlayerMinSerializer(serializers.ModelSerializer):
    """Serializer tối giản cho Player để sử dụng trong Goal"""
    team_name = serializers.CharField(source='team.name', read_only=True)
    
    class Meta:
        model = Player
        fields = ['id', 'name', 'team_name']

class GoalSerializer(serializers.ModelSerializer):
    """Serializer cho Goal - bàn thắng trong trận đấu"""
    player_name = serializers.CharField(source='player.name', read_only=True)
    team_name = serializers.CharField(source='player.team.name', read_only=True)
    
    class Meta:
        model = Goal
        fields = ['id', 'player', 'player_name', 'goal_type', 'minute', 'team_name']
        
    def validate(self, data):
        """Kiểm tra cầu thủ phải thuộc một trong hai đội thi đấu"""
        player = data.get('player')
        match = data.get('match')
        
        if player and match:
            if player.team != match.home_team and player.team != match.away_team:
                raise serializers.ValidationError("Cầu thủ ghi bàn phải thuộc một trong hai đội thi đấu")
        
        return data

class GoalCreateSerializer(serializers.ModelSerializer):
    """Serializer để tạo mới bàn thắng"""
    player = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all())
    
    class Meta:
        model = Goal
        fields = ['player', 'goal_type', 'minute']
    
    def validate_minute(self, value):
        """Kiểm tra thời điểm ghi bàn từ 0-96 phút"""
        if value < 0 or value > 96:
            raise serializers.ValidationError("Thời điểm ghi bàn phải nằm trong khoảng từ 0 đến 96 phút")
        return value

class MatchResultSerializer(serializers.ModelSerializer):
    """Serializer cho kết quả trận đấu"""
    goals = GoalSerializer(source='match.goals', many=True, read_only=True)
    home_team = serializers.CharField(source='match.home_team.name', read_only=True)
    away_team = serializers.CharField(source='match.away_team.name', read_only=True)
    stadium = serializers.CharField(source='match.stadium', read_only=True)
    match_date = serializers.DateField(source='match.match_date', read_only=True)
    match_time = serializers.TimeField(source='match.match_time', read_only=True)
    
    class Meta:
        model = MatchResult
        fields = ['id', 'match', 'home_team', 'away_team', 'home_score', 'away_score', 
                 'stadium', 'match_date', 'match_time', 'goals']
        read_only_fields = ['match']

class MatchResultCreateSerializer(serializers.ModelSerializer): # Vẫn kế thừa ModelSerializer vì dùng Meta.model
    """Serializer để tạo mới kết quả trận đấu (ĐÃ SỬA LỖI)"""
    # Sử dụng GoalCreateSerializer đã định nghĩa ở trên
    goals = GoalCreateSerializer(many=True, required=False, allow_empty=True, default=list)

    class Meta:
        model = MatchResult
        fields = ['home_score', 'away_score', 'goals']
        # Lưu ý: 'match' không cần trong fields vì nó sẽ được gán trong view,
        # nhưng nó cần thiết trong context để validate.

    def validate(self, data):
        """
        Kiểm tra:
        1. Cầu thủ ghi bàn phải thuộc 1 trong 2 đội của trận đấu.
        2. Số bàn thắng nhập vào phải khớp với số bàn thắng được ghi nhận trong list goals.
        """
        home_score_input = data.get('home_score', 0)
        away_score_input = data.get('away_score', 0)
        goals_input = data.get('goals', [])

        match = self.context.get('match')
        if not match:
            # Lỗi này không nên xảy ra nếu view luôn truyền context đúng
            raise serializers.ValidationError("Lỗi hệ thống: Thiếu thông tin trận đấu để validate.")

        calculated_home_goals = 0
        calculated_away_goals = 0
        valid_team_ids = {match.home_team_id, match.away_team_id}

        for i, goal_data in enumerate(goals_input):
            # Lấy đối tượng Player trực tiếp từ dữ liệu đã validate của GoalCreateSerializer
            # Đổi tên biến cho đỡ nhầm lẫn
            player_object = goal_data.get('player')

            if not player_object:
                 # Trường hợp rất hiếm nếu PrimaryKeyRelatedField không required
                 raise serializers.ValidationError({'goals': f"Bàn thắng thứ {i+1}: Thiếu thông tin cầu thủ."})

            # 1. Kiểm tra cầu thủ có thuộc đội tham gia trận đấu không
            if player_object.team_id not in valid_team_ids:
                raise serializers.ValidationError({
                    'goals': f"Bàn thắng thứ {i+1}: Cầu thủ '{player_object.name}' (Đội: {player_object.team.name}) không thuộc đội '{match.home_team.name}' hoặc '{match.away_team.name}' trong trận này."
                })

            # 2. Tính toán tỷ số dựa trên team của cầu thủ
            if player_object.team_id == match.home_team_id:
                calculated_home_goals += 1
            # Không cần elif nữa vì đã kiểm tra thuộc 1 trong 2 đội ở trên
            else: # player_object.team_id == match.away_team_id
                calculated_away_goals += 1

        # 3. So sánh tỷ số nhập vào với tỷ số tính được
        if home_score_input != calculated_home_goals:
            raise serializers.ValidationError(
                f"Tỷ số Đội nhà ({home_score_input}) không khớp với số bàn thắng được ghi nhận ({calculated_home_goals})."
            )

        if away_score_input != calculated_away_goals:
            raise serializers.ValidationError(
                 f"Tỷ số Đội khách ({away_score_input}) không khớp với số bàn thắng được ghi nhận ({calculated_away_goals})."
                 # {'away_score': f"Tỷ số nhập vào ({away_score_input}) không khớp với số bàn thắng ({calculated_away_goals})."}
            )

        return data 