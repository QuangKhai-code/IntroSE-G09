from django.db import models
from django.contrib.auth.models import User 
from django.core.exceptions import ValidationError
from datetime import datetime 
import pytz 

# Create your models here.
class Note(models.Model): 
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title

def validate_player_age(birthdate):
    today = datetime.now(pytz.utc).date()
    age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    if age < 16 or age > 40:
        raise ValidationError("Tuổi cầu thủ phải từ 16 đến 40")

class Team(models.Model):
    name = models.CharField(max_length=100, verbose_name="Tên đội")
    home_stadium = models.CharField(max_length=100, verbose_name="Sân nhà")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    def clean(self):
        # Kiểm tra số lượng cầu thủ
        player_count = self.players.count()
        if player_count < 15:
            raise ValidationError("Đội bóng phải có ít nhất 15 cầu thủ")
        if player_count > 22:
            raise ValidationError("Đội bóng chỉ được có tối đa 22 cầu thủ")
        
        # Kiểm tra số lượng cầu thủ nước ngoài
        foreign_players = self.players.filter(player_type='foreign').count()
        if foreign_players > 3:
            raise ValidationError("Đội bóng chỉ được có tối đa 3 cầu thủ nước ngoài")

class Player(models.Model):
    PLAYER_TYPES = [
        ('domestic', 'Trong nước'),
        ('foreign', 'Ngoài nước'),
    ]
    
    team = models.ForeignKey(Team, related_name='players', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, verbose_name="Tên cầu thủ")
    birthdate = models.DateField(verbose_name="Ngày sinh", validators=[validate_player_age])
    player_type = models.CharField(max_length=10, choices=PLAYER_TYPES, verbose_name="Loại cầu thủ")
    note = models.TextField(verbose_name="Ghi chú", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
