from django.db import models
from .services import TournamentRuleService


def validate_player_age(birthdate):
    TournamentRuleService.validate_player_age(birthdate)


class Player(models.Model):
    PLAYER_TYPES = [
        ('domestic', 'Trong nước'),
        ('foreign', 'Ngoài nước'),
    ]

    team = models.ForeignKey(
        'Team', related_name='players', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, verbose_name="Tên cầu thủ")
    birthdate = models.DateField(
        verbose_name="Ngày sinh", validators=[validate_player_age])
    player_type = models.CharField(
        max_length=10, choices=PLAYER_TYPES, verbose_name="Loại cầu thủ")
    note = models.TextField(verbose_name="Ghi chú", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
