from django.contrib.auth.models import User 
from rest_framework import serializers 
from .models import Note, Player, Team 
from datetime import datetime
import pytz

class UserSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = User 
        fields = ("id", "username", "password",)
        extra_kwargs = {"password": {"write_only": True}}
   
    def create(self, validated_data):
        password = validated_data.pop("password")  # Extract password
        user = User(**validated_data)
        user.set_password(password)  # Hash password
        user.save()
        return user

class NoteSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Note 
        fields = ("id", "title", "content", "created_at", "author",)
        extra_kwargs = {"author": {"read_only": True}}

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
