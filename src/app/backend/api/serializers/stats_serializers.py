from rest_framework import serializers


class TeamStandingSerializer(serializers.Serializer):
    # id = serializers.IntegerField() # ID của đội, không bắt buộc hiển thị nhưng hữu ích
    team_name = serializers.CharField(source='name')  # Tên Đội
    played = serializers.IntegerField()              # Số trận đã đấu
    won = serializers.IntegerField()                 # Thắng
    drawn = serializers.IntegerField()               # Hòa
    lost = serializers.IntegerField()                # Thua
    goals_for = serializers.IntegerField()           # Bàn thắng
    goals_against = serializers.IntegerField()       # Bàn thua
    goal_difference = serializers.IntegerField()     # Hiệu số
    points = serializers.IntegerField()              # Điểm
