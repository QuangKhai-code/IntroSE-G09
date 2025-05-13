from rest_framework import serializers
from ..models import Goal, Player
from ..models.services import TournamentRuleService


class GoalSerializer(serializers.ModelSerializer):
    """Serializer cho Goal - bàn thắng trong trận đấu"""
    player_name = serializers.CharField(source='player.name', read_only=True)
    team_name = serializers.CharField(
        source='player.team.name', read_only=True)

    class Meta:
        model = Goal
        fields = ['id', 'player', 'player_name',
                  'goal_type', 'minute', 'team_name']

    def validate_minute(self, value):
        TournamentRuleService.validate_goal_time(value)
        return value

    def validate_goal_type(self, value):
        TournamentRuleService.validate_goal_type(value)
        return value

    def validate(self, data):
        """Kiểm tra cầu thủ phải thuộc một trong hai đội thi đấu"""
        player = data.get('player')
        match = data.get('match')

        if player and match:
            if player.team != match.home_team and player.team != match.away_team:
                raise serializers.ValidationError(
                    "Cầu thủ ghi bàn phải thuộc một trong hai đội thi đấu")

        return data


class GoalCreateSerializer(serializers.ModelSerializer):
    """Serializer để tạo mới bàn thắng"""
    player = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all())

    class Meta:
        model = Goal
        fields = ['player', 'goal_type', 'minute']

    def validate_minute(self, value):
        TournamentRuleService.validate_goal_time(value)
        return value

    def validate_goal_type(self, value):
        TournamentRuleService.validate_goal_type(value)
        return value
