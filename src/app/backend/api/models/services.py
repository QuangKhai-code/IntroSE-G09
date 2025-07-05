from django.core.exceptions import ValidationError
from datetime import datetime
import pytz
from .Goal import Goal


class TournamentRuleService:
    @staticmethod
    def get_current_rules():
        """Lấy quy định hiện tại của giải đấu"""
        from .TournamentRule import TournamentRule
        return TournamentRule.objects.order_by('-updated_at').first() or TournamentRule.objects.create()

    @staticmethod
    def validate_player_age(birthdate):
        """Validate tuổi cầu thủ theo quy định"""
        rules = TournamentRuleService.get_current_rules()
        today = datetime.now(pytz.utc).date()
        age = today.year - birthdate.year - \
            ((today.month, today.day) < (birthdate.month, birthdate.day))
        if age < rules.min_player_age or age > rules.max_player_age:
            raise ValidationError(
                f"Tuổi cầu thủ phải từ {rules.min_player_age} đến {rules.max_player_age}")

    @staticmethod
    def validate_team_players(team):
        """Validate số lượng cầu thủ của đội"""
        rules = TournamentRuleService.get_current_rules()
        player_count = team.players.count()
        if player_count < rules.min_team_players:
            raise ValidationError(
                f"Đội bóng phải có ít nhất {rules.min_team_players} cầu thủ")
        if player_count > rules.max_team_players:
            raise ValidationError(
                f"Đội bóng chỉ được có tối đa {rules.max_team_players} cầu thủ")

    @staticmethod
    def validate_foreign_players(team):
        """Validate số lượng cầu thủ nước ngoài"""
        rules = TournamentRuleService.get_current_rules()
        foreign_players = team.players.filter(player_type='foreign').count()
        if foreign_players > rules.max_foreign_players:
            raise ValidationError(
                f"Đội bóng chỉ được có tối đa {rules.max_foreign_players} cầu thủ nước ngoài")

    @staticmethod
    def validate_goal_time(minute):
        """Validate thời điểm ghi bàn"""
        rules = TournamentRuleService.get_current_rules()
        if minute < 0 or minute > rules.max_goal_time:
            raise ValidationError(
                f"Thời điểm ghi bàn phải nằm trong khoảng từ 0 đến {rules.max_goal_time} phút")

    @staticmethod
    def validate_goal_type(goal_type_value):
        """Validate loại bàn thắng using Goal.GOAL_TYPES as the authoritative source."""
        defined_goal_types = [gt[0] for gt in Goal.GOAL_TYPES]
        if goal_type_value not in defined_goal_types:
            raise ValidationError(
                f"Loại bàn thắng không hợp lệ. Các loại hợp lệ: {defined_goal_types}")

    @staticmethod
    def get_ranking_criteria():
        """Lấy tiêu chí xếp hạng hiện tại"""
        rules = TournamentRuleService.get_current_rules()
        return rules.ranking_criteria

    @staticmethod
    def get_points_for_result(result):
        """Lấy điểm số cho kết quả trận đấu"""
        rules = TournamentRuleService.get_current_rules()
        if result == 'win':
            return rules.win_points
        elif result == 'draw':
            return rules.draw_points
        elif result == 'loss':
            return rules.loss_points
        return 0
