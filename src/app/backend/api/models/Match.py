from django.db import models
from django.core.exceptions import ValidationError


class Match(models.Model):
    """Trận đấu giữa hai đội"""
    round = models.ForeignKey(
        'Round', related_name='matches', on_delete=models.CASCADE, verbose_name="Vòng đấu")
    home_team = models.ForeignKey(
        'Team', related_name='home_matches', on_delete=models.CASCADE, verbose_name="Đội nhà")
    away_team = models.ForeignKey(
        'Team', related_name='away_matches', on_delete=models.CASCADE, verbose_name="Đội khách")
    match_date = models.DateField(verbose_name="Ngày thi đấu")
    match_time = models.TimeField(verbose_name="Giờ thi đấu")
    stadium = models.CharField(max_length=100, verbose_name="Sân vận động")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['round', 'match_date', 'match_time']
        # Không cho phép một đội tham gia nhiều hơn 1 trận trong một vòng đấu
        constraints = [
            models.UniqueConstraint(
                fields=['round', 'home_team'], name='unique_home_team_per_round'),
            models.UniqueConstraint(
                fields=['round', 'away_team'], name='unique_away_team_per_round'),
        ]

    def __str__(self):
        return f"{self.home_team} vs {self.away_team} - Vòng {self.round.number}"

    def clean(self):
        # Kiểm tra ngày thi đấu nằm trong khoảng vòng đấu
        if hasattr(self, 'round') and self.round and hasattr(self, 'match_date'):
            if self.match_date < self.round.start_date or self.match_date > self.round.end_date:
                raise ValidationError(
                    "Ngày thi đấu phải nằm trong khoảng thời gian của vòng đấu")

        # Kiểm tra đội nhà và đội khách không được trùng nhau
        if self.home_team == self.away_team:
            raise ValidationError("Đội nhà và đội khách không được trùng nhau")

        # Đội nhà phải thi đấu trên sân nhà của mình
        if self.home_team.home_stadium != self.stadium:
            raise ValidationError("Đội nhà phải thi đấu trên sân nhà của mình")

        # Kiểm tra nếu 2 đội đã từng thi đấu với nhau 2 lần (không tính trận hiện tại)
        if hasattr(self, 'home_team') and hasattr(self, 'away_team'):
            # Số trận đối đầu giữa hai đội (không tính trận hiện tại)
            previous_matches_count = Match.objects.filter(
                models.Q(home_team=self.home_team, away_team=self.away_team) |
                models.Q(home_team=self.away_team, away_team=self.home_team)
            ).exclude(id=self.id if self.id else None).count()

            if previous_matches_count >= 2:
                raise ValidationError(
                    "Hai đội chỉ được phép đối đầu tối đa 2 lần trong giải")


class MatchResult(models.Model):
    """Kết quả trận đấu"""
    match = models.OneToOneField(
        'Match', related_name='result', on_delete=models.CASCADE, verbose_name="Trận đấu")
    home_score = models.PositiveIntegerField(
        default=0, verbose_name="Bàn thắng đội nhà")
    away_score = models.PositiveIntegerField(
        default=0, verbose_name="Bàn thắng đội khách")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.match.home_team} {self.home_score}-{self.away_score} {self.match.away_team}"

    def clean(self):
        # Kiểm tra tổng số bàn thắng khớp với số bàn được ghi nhận
        if hasattr(self, 'match'):
            from .Goal import Goal
            home_goals_count = Goal.objects.filter(
                match=self.match, player__team=self.match.home_team).count()
            away_goals_count = Goal.objects.filter(
                match=self.match, player__team=self.match.away_team).count()

            if self.home_score != home_goals_count:
                raise ValidationError(
                    f"Số bàn thắng đội nhà ({self.home_score}) không khớp với số bàn thắng đã ghi nhận ({home_goals_count})")
            if self.away_score != away_goals_count:
                raise ValidationError(
                    f"Số bàn thắng đội khách ({self.away_score}) không khớp với số bàn thắng đã ghi nhận ({away_goals_count})")
