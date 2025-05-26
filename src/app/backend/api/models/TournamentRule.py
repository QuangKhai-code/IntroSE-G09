from django.db import models
from django.core.exceptions import ValidationError
from .Goal import Goal


def get_default_goal_types():
    return Goal.GOAL_TYPES


def get_default_ranking_criteria():
    return []


class TournamentRule(models.Model):
    # QĐ1: Quy định về cầu thủ
    min_player_age = models.IntegerField(default=16)
    max_player_age = models.IntegerField(default=40)
    min_team_players = models.IntegerField(default=11)
    max_team_players = models.IntegerField(default=22)
    max_foreign_players = models.IntegerField(default=3)

    # QĐ3: Quy định về bàn thắng
    # Thời điểm ghi bàn tối đa (phút)
    max_goal_time = models.IntegerField(default=96)
    # Lưu các loại bàn thắng và số lượng
    goal_types = models.JSONField(default=get_default_goal_types)

    # QĐ5: Quy định về điểm số và xếp hạng
    win_points = models.IntegerField(default=3)
    draw_points = models.IntegerField(default=1)
    loss_points = models.IntegerField(default=0)
    ranking_criteria = models.JSONField(
        default=get_default_ranking_criteria)  # Thứ tự ưu tiên khi xếp hạng

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        # Kiểm tra điểm số
        if not (self.win_points > self.draw_points > self.loss_points):
            raise ValidationError(
                "Điểm thắng phải lớn hơn điểm hòa và điểm hòa phải lớn hơn điểm thua")

        # Kiểm tra tuổi
        if self.min_player_age >= self.max_player_age:
            raise ValidationError("Tuổi tối thiểu phải nhỏ hơn tuổi tối đa")

        # Kiểm tra số lượng cầu thủ
        if self.min_team_players >= self.max_team_players:
            raise ValidationError(
                "Số lượng cầu thủ tối thiểu phải nhỏ hơn số lượng tối đa")

        # Kiểm tra số cầu thủ nước ngoài

    def __str__(self):
        return f"Quy định giải đấu (Cập nhật: {self.updated_at.strftime('%d/%m/%Y')})"
