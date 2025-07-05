from django.test import TestCase
from django.core.exceptions import ValidationError
from datetime import date, timedelta, time
from ..models import Team, Player, Match, Goal, TournamentRule, MatchResult, Round


class TeamModelTest(TestCase):
    def setUp(self):
        self.team = Team.objects.create(
            name="Test Team",
            home_stadium="Test Stadium"
        )
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

    def test_team_creation(self):
        self.assertEqual(self.team.name, "Test Team")
        self.assertEqual(self.team.home_stadium, "Test Stadium")
        self.assertIsNotNone(self.team.created_at)
        self.assertIsNotNone(self.team.updated_at)

    def test_team_validation(self):
        # Test số lượng cầu thủ hợp lệ
        for i in range(15):
            Player.objects.create(
                team=self.team,
                name=f"Player {i}",
                birthdate=date.today() - timedelta(days=365*20),
                player_type='domestic'
            )
        try:
            self.team.full_clean()
        except ValidationError:
            self.fail("Team validation failed unexpectedly!")

        # Test số lượng cầu thủ quá ít
        self.team.players.all().delete()
        for i in range(14):
            Player.objects.create(
                team=self.team,
                name=f"Player {i}",
                birthdate=date.today() - timedelta(days=365*20),
                player_type='domestic'
            )
        with self.assertRaises(ValidationError):
            self.team.full_clean()

    def test_delete_team(self):
        # Tạo một số cầu thủ cho đội
        for i in range(15):
            Player.objects.create(
                team=self.team,
                name=f"Player {i}",
                birthdate=date.today() - timedelta(days=365*20),
                player_type='domestic'
            )

        # Test xóa đội thành công
        self.team.delete_team()
        self.assertFalse(Team.objects.filter(id=self.team.id).exists())
        self.assertEqual(Player.objects.filter(
            team_id=self.team.id).count(), 0)

        # Tạo đội mới và trận đấu
        team = Team.objects.create(name="New Team", home_stadium="New Stadium")
        other_team = Team.objects.create(
            name="Other Team", home_stadium="Other Stadium")
        round = Round.objects.create(
            number=1,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7)
        )
        match = Match.objects.create(
            home_team=team,
            away_team=other_team,
            match_date=date.today(),
            match_time=time(15, 0),
            stadium=team.home_stadium,
            round=round
        )

        # Test không thể xóa đội đã có trận đấu
        with self.assertRaises(ValidationError):
            team.delete_team()


class PlayerModelTest(TestCase):
    def setUp(self):
        self.team = Team.objects.create(
            name="Test Team",
            home_stadium="Test Stadium"
        )
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

    def test_player_creation(self):
        player = Player.objects.create(
            team=self.team,
            name="Test Player",
            birthdate=date.today() - timedelta(days=365*20),
            player_type='domestic'
        )
        self.assertEqual(player.name, "Test Player")
        self.assertEqual(player.team, self.team)
        self.assertEqual(player.player_type, 'domestic')
        self.assertIsNotNone(player.created_at)
        self.assertIsNotNone(player.updated_at)

    def test_player_validation(self):
        # Test tuổi hợp lệ
        valid_player = Player(
            team=self.team,
            name="Valid Player",
            birthdate=date.today() - timedelta(days=365*20),
            player_type='domestic'
        )
        try:
            valid_player.full_clean()
        except ValidationError:
            self.fail("Player validation failed unexpectedly!")

        # Test tuổi không hợp lệ
        invalid_player = Player(
            team=self.team,
            name="Invalid Player",
            birthdate=date.today() - timedelta(days=365*15),
            player_type='domestic'
        )
        with self.assertRaises(ValidationError):
            invalid_player.full_clean()


class MatchModelTest(TestCase):
    def setUp(self):
        self.home_team = Team.objects.create(
            name="Home Team",
            home_stadium="Home Stadium"
        )
        self.away_team = Team.objects.create(
            name="Away Team",
            home_stadium="Away Stadium"
        )
        self.round = Round.objects.create(
            number=1,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7)
        )
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

    def test_match_creation(self):
        match = Match.objects.create(
            home_team=self.home_team,
            away_team=self.away_team,
            match_date=date.today(),
            match_time=time(15, 0),  # 15:00
            stadium=self.home_team.home_stadium,
            round=self.round
        )
        self.assertEqual(match.home_team, self.home_team)
        self.assertEqual(match.away_team, self.away_team)
        self.assertEqual(match.match_date, date.today())
        self.assertEqual(match.match_time, time(15, 0))
        self.assertEqual(match.stadium, self.home_team.home_stadium)
        self.assertEqual(match.round, self.round)
        self.assertIsNotNone(match.created_at)
        self.assertIsNotNone(match.updated_at)

    def test_match_validation(self):
        # Test trận đấu hợp lệ
        valid_match = Match(
            home_team=self.home_team,
            away_team=self.away_team,
            match_date=date.today(),
            match_time=time(15, 0),
            stadium=self.home_team.home_stadium,
            round=self.round
        )
        try:
            valid_match.full_clean()
        except ValidationError:
            self.fail("Match validation failed unexpectedly!")

        # Test trận đấu không hợp lệ (đội nhà và đội khách giống nhau)
        invalid_match = Match(
            home_team=self.home_team,
            away_team=self.home_team,
            match_date=date.today(),
            match_time=time(15, 0),
            stadium=self.home_team.home_stadium,
            round=self.round
        )
        with self.assertRaises(ValidationError):
            invalid_match.full_clean()


class GoalModelTest(TestCase):
    def setUp(self):
        self.home_team = Team.objects.create(
            name="Home Team",
            home_stadium="Home Stadium"
        )
        self.away_team = Team.objects.create(
            name="Away Team",
            home_stadium="Away Stadium"
        )
        self.round = Round.objects.create(
            number=1,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7)
        )
        self.match = Match.objects.create(
            home_team=self.home_team,
            away_team=self.away_team,
            match_date=date.today(),
            match_time=time(15, 0),
            stadium=self.home_team.home_stadium,
            round=self.round
        )
        self.player = Player.objects.create(
            team=self.home_team,
            name="Test Player",
            birthdate=date.today() - timedelta(days=365*20),
            player_type='domestic'
        )
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

    def test_goal_creation(self):
        goal = Goal.objects.create(
            match=self.match,
            player=self.player,
            goal_type='A',
            minute=45
        )
        self.assertEqual(goal.match, self.match)
        self.assertEqual(goal.player, self.player)
        self.assertEqual(goal.goal_type, 'A')
        self.assertEqual(goal.minute, 45)
        self.assertIsNotNone(goal.created_at)
        self.assertIsNotNone(goal.updated_at)

    def test_goal_validation(self):
        # Test bàn thắng hợp lệ
        valid_goal = Goal(
            match=self.match,
            player=self.player,
            goal_type='A',
            minute=45
        )
        try:
            valid_goal.full_clean()
        except ValidationError:
            self.fail("Goal validation failed unexpectedly!")

        # Test bàn thắng không hợp lệ (thời điểm ghi bàn)
        invalid_goal = Goal(
            match=self.match,
            player=self.player,
            goal_type='A',
            minute=97
        )
        with self.assertRaises(ValidationError):
            invalid_goal.full_clean()

        # Test bàn thắng không hợp lệ (loại bàn thắng)
        invalid_goal = Goal(
            match=self.match,
            player=self.player,
            goal_type='D',
            minute=45
        )
        with self.assertRaises(ValidationError):
            invalid_goal.full_clean()
