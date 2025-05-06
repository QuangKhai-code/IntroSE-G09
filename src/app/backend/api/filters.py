# api/filters.py
import django_filters
from .models import Player, Team

class PlayerFilter(django_filters.FilterSet):
    # Tìm kiếm không phân biệt chữ hoa/thường theo tên cầu thủ
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains', label='Tên cầu thủ')
    # Lọc chính xác theo ID đội
    team_id = django_filters.NumberFilter(field_name='team__id', label='ID Đội')
    # Lọc chính xác theo tên đội (không phân biệt chữ hoa/thường)
    team_name = django_filters.CharFilter(field_name='team__name', lookup_expr='icontains', label='Tên Đội')
    # Lọc chính xác theo loại cầu thủ
    player_type = django_filters.ChoiceFilter(field_name='player_type', choices=Player.PLAYER_TYPES, label='Loại cầu thủ')

    # Sắp xếp
    # DRF đã hỗ trợ OrderingFilter, chúng ta sẽ dùng nó trực tiếp trong ViewSet
    # Nhưng nếu muốn tùy chỉnh tên param, có thể định nghĩa ở đây
    # o = django_filters.OrderingFilter(
    #     fields=(
    #         ('name', 'name'),
    #         ('team__name', 'team_name'),
    #         ('player_type', 'player_type'),
    #         ('total_goals', 'total_goals'), # Sắp xếp theo trường annotate
    #     ),
    #     field_labels={
    #         'name': 'Tên cầu thủ',
    #         'team_name': 'Tên đội',
    #         # ...
    #     }
    # )


    class Meta:
        model = Player
        fields = ['name', 'team_id', 'team_name', 'player_type'] # Các trường có thể filter trực tiếp