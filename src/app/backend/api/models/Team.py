from django.db import models
from django.core.exceptions import ValidationError
from .services import TournamentRuleService


class Team(models.Model):
    name = models.CharField(
        max_length=100, verbose_name="Tên đội", unique=True)
    home_stadium = models.CharField(max_length=100, verbose_name="Sân nhà")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def clean(self):
        TournamentRuleService.validate_team_players(self)
        TournamentRuleService.validate_foreign_players(self)

    def delete_team(self):
        """
        Xóa đội bóng và tất cả dữ liệu liên quan.
        Chỉ cho phép xóa nếu đội chưa tham gia trận đấu nào.
        """
        # Kiểm tra xem đội có trận đấu nào không
        if self.home_matches.exists() or self.away_matches.exists():
            raise ValidationError(
                "Không thể xóa đội đã tham gia trận đấu. Vui lòng xóa các trận đấu trước.")

        # Xóa tất cả cầu thủ của đội
        self.players.all().delete()

        # Xóa đội
        self.delete()
