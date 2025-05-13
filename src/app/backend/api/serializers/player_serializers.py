from rest_framework import serializers
from ..models import Player
from ..models.services import TournamentRuleService


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'name', 'birthdate', 'player_type', 'note']

    def validate_birthdate(self, value):
        TournamentRuleService.validate_player_age(value)
        return value


class PlayerMinSerializer(serializers.ModelSerializer):
    """Serializer tối giản cho Player để sử dụng trong Goal"""
    team_name = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model = Player
        fields = ['id', 'name', 'team_name']


class PlayerWithGoalStatsSerializer(serializers.ModelSerializer):
    """
    Serializer để hiển thị danh sách cầu thủ kèm theo tổng số bàn thắng.
    Theo Biểu mẫu 4.
    """
    team_name = serializers.CharField(source='team.name', read_only=True)
    player_type_display = serializers.CharField(
        source='get_player_type_display', read_only=True)
    total_goals = serializers.IntegerField(read_only=True)  # Sẽ được annotate

    class Meta:
        model = Player
        fields = [
            'id',                 # STT có thể được xử lý ở frontend
            'name',               # Tên Cầu Thủ
            # ID của Đội (để có thể click vào xem chi tiết đội)
            'team',
            'team_name',          # Tên Đội
            'player_type',        # Mã Loại Cầu Thủ (để filter)
            'player_type_display',  # Hiển thị Loại Cầu Thủ
            'birthdate',          # Có thể thêm ngày sinh nếu cần
            'note',               # Có thể thêm ghi chú nếu cần
            'total_goals'         # Tổng số bàn thắng
        ]
        read_only_fields = ['team_name', 'player_type_display', 'total_goals']


class TopScorerSerializer(serializers.ModelSerializer):
    """
    Serializer cho danh sách cầu thủ ghi bàn theo BM5.2.
    """
    team_name = serializers.CharField(source='team.name', read_only=True)
    player_type_display = serializers.CharField(
        source='get_player_type_display', read_only=True)
    total_goals = serializers.IntegerField(read_only=True)  # Sẽ được annotate

    class Meta:
        model = Player
        fields = [
            'id', 'name', 'team', 'team_name',
            'player_type', 'player_type_display',
            'birthdate', 'total_goals'
        ]
        read_only_fields = ['team_name', 'player_type_display', 'total_goals'] 