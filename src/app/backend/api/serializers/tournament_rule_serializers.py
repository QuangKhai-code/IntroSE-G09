from rest_framework import serializers
from ..models import TournamentRule


class TournamentRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentRule
        fields = [
            'min_player_age', 'max_player_age',
            'min_team_players', 'max_team_players', 'max_foreign_players',
            'max_goal_time', 'goal_types',
            'win_points', 'draw_points', 'loss_points',
            'ranking_criteria',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        # Kiểm tra điểm số
        if not (data.get('win_points', 3) > data.get('draw_points', 1) > data.get('loss_points', 0)):
            raise serializers.ValidationError(
                "Điểm thắng phải lớn hơn điểm hòa và điểm hòa phải lớn hơn điểm thua")

        # Kiểm tra tuổi
        if data.get('min_player_age', 16) >= data.get('max_player_age', 40):
            raise serializers.ValidationError(
                "Tuổi tối thiểu phải nhỏ hơn tuổi tối đa")

        # Kiểm tra số lượng cầu thủ
        if data.get('min_team_players', 15) >= data.get('max_team_players', 22):
            raise serializers.ValidationError(
                "Số lượng cầu thủ tối thiểu phải nhỏ hơn số lượng tối đa")

        return data
