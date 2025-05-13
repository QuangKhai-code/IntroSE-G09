from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from .services import TournamentRuleService


class Goal(models.Model):
    """Bàn thắng trong trận đấu"""
    GOAL_TYPES = [
        ('A', 'Loại A'),
        ('B', 'Loại B'),
        ('C', 'Loại C'),
    ]

    match = models.ForeignKey(
        'Match', related_name='goals', on_delete=models.CASCADE, verbose_name="Trận đấu")
    player = models.ForeignKey('Player', related_name='goals',
                               on_delete=models.CASCADE, verbose_name="Cầu thủ ghi bàn")
    goal_type = models.CharField(
        max_length=1, choices=GOAL_TYPES, verbose_name="Loại bàn thắng")
    minute = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(96)],
        verbose_name="Thời điểm ghi bàn (phút)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['match', 'minute']

    def __str__(self):
        return f"{self.player.name} - phút {self.minute} - {self.get_goal_type_display()}"

    def clean(self):
        # Kiểm tra cầu thủ phải thuộc một trong hai đội thi đấu
        if hasattr(self, 'match') and hasattr(self, 'player'):
            if self.player.team != self.match.home_team and self.player.team != self.match.away_team:
                raise ValidationError(
                    "Cầu thủ ghi bàn phải thuộc một trong hai đội thi đấu")

        # Validate thời điểm ghi bàn
        TournamentRuleService.validate_goal_time(self.minute)
        # Validate loại bàn thắng
        TournamentRuleService.validate_goal_type(self.goal_type)
