# API Module Structure

The API module has been restructured to better organize the code by separating models and serializers into their own folders with individual files for each component.

## Directory Structure

```
api/
├── __init__.py
├── migrations/
├── models/
│   ├── __init__.py
│   ├── Goal.py
│   ├── Match.py
│   ├── Player.py
│   ├── Round.py
│   ├── services.py
│   ├── Team.py
│   └── TournamentRule.py
├── serializers/
│   ├── __init__.py
│   ├── goal_serializers.py
│   ├── match_serializers.py
│   ├── player_serializers.py
│   ├── round_serializers.py
│   ├── stats_serializers.py
│   ├── team_serializers.py
│   ├── tournament_rule_serializers.py
│   └── user_serializers.py
├── services.py
├── tests/
├── urls.py
└── views/
    ├── __init__.py
    ├── auth.py
    ├── goals.py
    ├── league_standings.py
    ├── matches.py
    ├── match_results.py
    ├── players.py
    ├── rounds.py
    ├── teams.py
    ├── top_scorers.py
    └── tournament_rules.py
```

## Imports

When importing models and serializers, use the following pattern:

```python
# Importing models
from ..models import Team, Player  # If importing multiple models from __init__.py
from ..models.Team import Team  # If importing a specific model directly

# Importing serializers
from ..serializers import TeamSerializer  # If importing from __init__.py
from ..serializers.team_serializers import TeamSerializer  # If importing directly
```

## Migration Notes

You'll need to manually update migrations if they reference any models or functions that have moved to new locations.

For example:
- Update import paths in migration files
- Check for any hardcoded references to old module paths 