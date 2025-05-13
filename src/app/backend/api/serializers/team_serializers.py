from rest_framework import serializers
from ..models import Team, Player
from ..models.services import TournamentRuleService
from .player_serializers import PlayerSerializer


class TeamSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True)

    class Meta:
        model = Team
        fields = ['name', 'home_stadium', 'players']

    def validate_players(self, players_data):
        rules = TournamentRuleService.get_current_rules()
        if len(players_data) < rules.min_team_players:
            raise serializers.ValidationError(
                f"Đội bóng phải có ít nhất {rules.min_team_players} cầu thủ")
        if len(players_data) > rules.max_team_players:
            raise serializers.ValidationError(
                f"Đội bóng chỉ được có tối đa {rules.max_team_players} cầu thủ")

        # Đếm số lượng cầu thủ nước ngoài
        foreign_players = sum(
            1 for player in players_data if player.get('player_type') == 'foreign')
        if foreign_players > rules.max_foreign_players:
            raise serializers.ValidationError(
                f"Đội bóng chỉ được có tối đa {rules.max_foreign_players} cầu thủ nước ngoài")

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
        instance.home_stadium = validated_data.get(
            'home_stadium', instance.home_stadium)
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
