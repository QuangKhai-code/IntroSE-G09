from rest_framework import serializers
from django.db import models
from ..models import Match, MatchResult
from .goal_serializers import GoalSerializer, GoalCreateSerializer


class MatchSerializer(serializers.ModelSerializer):
    home_team_name = serializers.CharField(
        source='home_team.name', read_only=True)
    away_team_name = serializers.CharField(
        source='away_team.name', read_only=True)
    round_number = serializers.IntegerField(
        source='round.number', read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'round', 'round_number', 'home_team', 'home_team_name', 'away_team',
                  'away_team_name', 'match_date', 'match_time', 'stadium']

    def validate(self, data):
        # Kiểm tra đội nhà và đội khách
        if 'home_team' in data and 'away_team' in data and data['home_team'] == data['away_team']:
            raise serializers.ValidationError(
                "Đội nhà và đội khách không được trùng nhau")

        # Kiểm tra sân vận động có phù hợp với đội nhà
        if 'home_team' in data and 'stadium' in data:
            if data['home_team'].home_stadium != data['stadium']:
                raise serializers.ValidationError(
                    "Đội nhà phải thi đấu trên sân nhà của mình")

        # Kiểm tra ngày thi đấu nằm trong khoảng vòng đấu
        if 'round' in data and 'match_date' in data:
            round_obj = data['round']
            if data['match_date'] < round_obj.start_date or data['match_date'] > round_obj.end_date:
                raise serializers.ValidationError(
                    "Ngày thi đấu phải nằm trong khoảng thời gian của vòng đấu")

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
                home_team_matches = home_team_matches.exclude(
                    id=self.instance.id)

            if home_team_matches.exists():
                raise serializers.ValidationError(
                    f"Đội {home_team.name} đã có trận đấu khác trong vòng này")

            # Kiểm tra đội khách đã có trận nào trong vòng đấu này chưa
            away_team_matches = Match.objects.filter(
                models.Q(home_team=away_team) | models.Q(away_team=away_team),
                round=round_obj
            )

            if self.instance:
                away_team_matches = away_team_matches.exclude(
                    id=self.instance.id)

            if away_team_matches.exists():
                raise serializers.ValidationError(
                    f"Đội {away_team.name} đã có trận đấu khác trong vòng này")

            # Kiểm tra 2 đội chỉ đấu tối đa 2 lần trong cả giải
            previous_matches = Match.objects.filter(
                models.Q(home_team=home_team, away_team=away_team) |
                models.Q(home_team=away_team, away_team=home_team)
            )

            if self.instance:
                previous_matches = previous_matches.exclude(
                    id=self.instance.id)

            if previous_matches.count() >= 2:
                raise serializers.ValidationError(
                    "Hai đội chỉ được phép đối đầu tối đa 2 lần trong giải")

        return data


class MatchListSerializer(serializers.ModelSerializer):
    """Serializer đơn giản hơn cho danh sách trận đấu theo vòng"""
    home_team_name = serializers.CharField(
        source='home_team.name', read_only=True)
    away_team_name = serializers.CharField(
        source='away_team.name', read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'home_team_name', 'away_team_name',
                  'match_date', 'match_time', 'stadium']


class MatchResultSerializer(serializers.ModelSerializer):
    """Serializer cho kết quả trận đấu"""
    goals = GoalSerializer(source='match.goals', many=True, read_only=True)
    home_team = serializers.CharField(
        source='match.home_team.name', read_only=True)
    away_team = serializers.CharField(
        source='match.away_team.name', read_only=True)
    stadium = serializers.CharField(source='match.stadium', read_only=True)
    match_date = serializers.DateField(
        source='match.match_date', read_only=True)
    match_time = serializers.TimeField(
        source='match.match_time', read_only=True)

    class Meta:
        model = MatchResult
        fields = ['id', 'match', 'home_team', 'away_team', 'home_score', 'away_score',
                  'stadium', 'match_date', 'match_time', 'goals']
        read_only_fields = ['match']


class MatchResultCreateSerializer(serializers.ModelSerializer):
    """Serializer để tạo mới kết quả trận đấu (ĐÃ SỬA LỖI)"""
    # Sử dụng GoalCreateSerializer đã định nghĩa ở trên
    goals = GoalCreateSerializer(
        many=True, required=False, write_only=True)

    class Meta:
        model = MatchResult
        fields = ['home_score', 'away_score', 'goals']

    def validate(self, data):
        # Lấy match từ context
        match = self.context.get('match')
        if not match:
            raise serializers.ValidationError("Match is required")

        # Kiểm tra số lượng bàn thắng
        home_score = data.get('home_score', 0)
        away_score = data.get('away_score', 0)
        # 'goals' in data now contains a list of dictionaries,
        # where each dictionary's 'player' key holds a Player *instance*
        # due to GoalCreateSerializer's PrimaryKeyRelatedField.
        goals_input_data = data.get('goals', [])

        home_team_goals_count = 0
        away_team_goals_count = 0

        if goals_input_data:
            for goal_item in goals_input_data:
                # goal_item['player'] is already a Player instance.
                player_object = goal_item.get('player')

                if not player_object:  # Should not happen if input is valid and PKRelatedField worked
                    raise serializers.ValidationError(
                        "Dữ liệu bàn thắng không hợp lệ: thiếu thông tin cầu thủ.")

                # No need to Player.objects.get(id=player_object) - this was the error source.
                # We directly use player_object.

                if player_object.team == match.home_team:
                    home_team_goals_count += 1
                elif player_object.team == match.away_team:
                    away_team_goals_count += 1
                else:
                    # Ensure player_object has a 'name' attribute for the error message
                    player_name = getattr(player_object, 'name', 'Không rõ')
                    raise serializers.ValidationError(
                        f"Cầu thủ {player_name} (ID: {player_object.id}) không thuộc đội nhà hoặc đội khách của trận đấu này.")

            # Kiểm tra tổng số bàn thắng với input scores
            if home_score != home_team_goals_count:
                raise serializers.ValidationError(
                    f"Số bàn thắng đội nhà ({home_score}) không khớp với số bàn thắng được khai báo từ các cầu thủ ({home_team_goals_count}).")
            if away_score != away_team_goals_count:
                raise serializers.ValidationError(
                    f"Số bàn thắng đội khách ({away_score}) không khớp với số bàn thắng được khai báo từ các cầu thủ ({away_team_goals_count}).")

        return data

    def create(self, validated_data):
        match = self.context.get('match')
        goals_data = validated_data.pop('goals', [])

        # Kiểm tra xem đã có kết quả chưa
        try:
            result = MatchResult.objects.get(match=match)
            # Cập nhật kết quả hiện có
            result.home_score = validated_data.get('home_score', 0)
            result.away_score = validated_data.get('away_score', 0)
            result.save()
        except MatchResult.DoesNotExist:
            # Tạo mới kết quả
            result = MatchResult.objects.create(
                match=match, **validated_data)

        # Xóa tất cả bàn thắng cũ
        from ..models import Goal
        Goal.objects.filter(match=match).delete()

        # Tạo bàn thắng mới
        for goal_data in goals_data:
            Goal.objects.create(match=match, **goal_data)

        return result
