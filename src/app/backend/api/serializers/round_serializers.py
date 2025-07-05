from rest_framework import serializers
from ..models import Round
from .match_serializers import MatchListSerializer


class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = ['id', 'number', 'start_date', 'end_date']

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError(
                "Ngày bắt đầu phải trước ngày kết thúc vòng đấu")
        return data


class RoundWithMatchesSerializer(serializers.ModelSerializer):
    """Serializer cho vòng đấu kèm danh sách trận"""
    matches = MatchListSerializer(many=True, read_only=True)

    class Meta:
        model = Round
        fields = ['id', 'number', 'start_date', 'end_date', 'matches']
