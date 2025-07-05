from django.test import TestCase
from django.core.exceptions import ValidationError
from datetime import date, timedelta
from ..models import Team, Player, TournamentRule
from ..services import TournamentRuleService


class TournamentRuleServiceTest(TestCase):
    def setUp(self):
        # Tạo quy định mặc định cho giải đấu
        self.rules = TournamentRule.objects.create(
            min_player_age=16,
            max_player_age=40,
            min_team_players=15,
            max_team_players=22,
            max_foreign_players=3,
            max_goal_time=96,
            goal_types={'A': 'Loại A', 'B': 'Loại B', 'C': 'Loại C'},
            win_points=3,
            draw_points=1,
            loss_points=0,
            ranking_criteria=['points', 'goal_difference', 'goals_for']
        )

    def test_validate_player_age(self):
        # Test tuổi hợp lệ
        valid_birthdate = date.today() - timedelta(days=365*20)  # 20 tuổi
        try:
            TournamentRuleService.validate_player_age(valid_birthdate)
        except ValidationError:
            self.fail(
                "validate_player_age() raised ValidationError unexpectedly!")

        # Test tuổi quá trẻ
        too_young = date.today() - timedelta(days=365*15)  # 15 tuổi
        with self.assertRaises(ValidationError):
            TournamentRuleService.validate_player_age(too_young)

        # Test tuổi quá già
        too_old = date.today() - timedelta(days=365*41)  # 41 tuổi
        with self.assertRaises(ValidationError):
            TournamentRuleService.validate_player_age(too_old)

    def test_validate_team_players(self):
        # Tạo đội bóng
        team = Team.objects.create(
            name="Test Team", home_stadium="Test Stadium")

        # Test số lượng cầu thủ hợp lệ
        for i in range(15):  # Tạo 15 cầu thủ (tối thiểu)
            Player.objects.create(
                team=team,
                name=f"Player {i}",
                birthdate=date.today() - timedelta(days=365*20),
                player_type='domestic'
            )
        try:
            TournamentRuleService.validate_team_players(team)
        except ValidationError:
            self.fail(
                "validate_team_players() raised ValidationError unexpectedly!")

        # Test số lượng cầu thủ quá ít
        team.players.all().delete()
        for i in range(14):  # Tạo 14 cầu thủ (dưới tối thiểu)
            Player.objects.create(
                team=team,
                name=f"Player {i}",
                birthdate=date.today() - timedelta(days=365*20),
                player_type='domestic'
            )
        with self.assertRaises(ValidationError):
            TournamentRuleService.validate_team_players(team)

        # Test số lượng cầu thủ quá nhiều
        team.players.all().delete()
        for i in range(23):  # Tạo 23 cầu thủ (trên tối đa)
            Player.objects.create(
                team=team,
                name=f"Player {i}",
                birthdate=date.today() - timedelta(days=365*20),
                player_type='domestic'
            )
        with self.assertRaises(ValidationError):
            TournamentRuleService.validate_team_players(team)

    def test_validate_foreign_players(self):
        # Tạo đội bóng
        team = Team.objects.create(
            name="Test Team", home_stadium="Test Stadium")

        # Test số lượng cầu thủ nước ngoài hợp lệ
        for i in range(3):  # Tạo 3 cầu thủ nước ngoài (tối đa)
            Player.objects.create(
                team=team,
                name=f"Foreign Player {i}",
                birthdate=date.today() - timedelta(days=365*20),
                player_type='foreign'
            )
        try:
            TournamentRuleService.validate_foreign_players(team)
        except ValidationError:
            self.fail(
                "validate_foreign_players() raised ValidationError unexpectedly!")

        # Test số lượng cầu thủ nước ngoài quá nhiều
        Player.objects.create(
            team=team,
            name="Extra Foreign Player",
            birthdate=date.today() - timedelta(days=365*20),
            player_type='foreign'
        )
        with self.assertRaises(ValidationError):
            TournamentRuleService.validate_foreign_players(team)

    def test_validate_goal_time(self):
        # Test thời điểm ghi bàn hợp lệ
        try:
            TournamentRuleService.validate_goal_time(45)  # Giữa hiệp 1
            TournamentRuleService.validate_goal_time(90)  # Cuối trận
        except ValidationError:
            self.fail("validate_goal_time() raised ValidationError unexpectedly!")

        # Test thời điểm ghi bàn không hợp lệ
        with self.assertRaises(ValidationError):
            TournamentRuleService.validate_goal_time(
                97)  # Quá thời gian tối đa

    def test_validate_goal_type(self):
        # Test loại bàn thắng hợp lệ
        try:
            TournamentRuleService.validate_goal_type('A')
            TournamentRuleService.validate_goal_type('B')
            TournamentRuleService.validate_goal_type('C')
        except ValidationError:
            self.fail("validate_goal_type() raised ValidationError unexpectedly!")

        # Test loại bàn thắng không hợp lệ
        with self.assertRaises(ValidationError):
            TournamentRuleService.validate_goal_type('D')

    def test_get_points_for_result(self):
        # Test điểm số cho các kết quả
        self.assertEqual(TournamentRuleService.get_points_for_result('win'), 3)
        self.assertEqual(
            TournamentRuleService.get_points_for_result('draw'), 1)
        self.assertEqual(
            TournamentRuleService.get_points_for_result('loss'), 0)
        self.assertEqual(
            TournamentRuleService.get_points_for_result('invalid'), 0)
