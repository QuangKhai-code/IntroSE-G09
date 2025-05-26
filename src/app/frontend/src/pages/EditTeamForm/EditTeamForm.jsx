import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TeamsTable from '../../components/TeamsTable/TeamsTable';
import s from './style.module.css';

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function EditTeamForm() {
  const dispatch = useDispatch();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/teams/`);
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        // Transform the API data to match our component's expected format
        const transformedTeams = data.map(team => ({
          id: team.id || Math.random(), // Use existing id or generate a random one
          name: team.name,
          homeStadium: team.home_stadium,
          players: team.players.map(player => ({
            id: player.id,
            name: player.name,
            dateOfBirth: player.birthdate,
            position: player.position,
            type: player.player_type,
            notes: player.note
          }))
        }));
        setTeams(transformedTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
        alert('Có lỗi xảy ra khi tải danh sách đội bóng!');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleDelete = async (teamId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đội bóng này?')) {
      try {
        const response = await fetch(`/api/teams/${teamId}/delete_team/`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete team');
        }

        setTeams(teams.filter(team => team.id !== teamId));
        alert('Xóa đội bóng thành công!');
      } catch (error) {
        console.error('Error deleting team:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa đội bóng!');
      }
    }
  };

  const handleUpdate = async (updatedTeam) => {
    try {
      const response = await fetch(`/api/teams/${updatedTeam.id}/update_team_info/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedTeam.name,
          home_stadium: updatedTeam.homeStadium,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update team');
      }

      const updatedTeamData = await response.json();
      setTeams(teams.map(team => 
        team.id === updatedTeam.id ? { ...team, ...updatedTeamData } : team
      ));
      alert('Cập nhật thông tin đội bóng thành công!');
    } catch (error) {
      console.error('Error updating team:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật thông tin đội bóng!');
    }
  };

  const handleUpdatePlayers = async (teamId, updatedPlayers) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          players: updatedPlayers.map(player => ({
            name: player.name,
            birthdate: player.dateOfBirth,
            player_type: player.type === 'Foreign' ? 'foreign' : 'domestic',
            note: player.position
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update players');
      }

      const updatedTeamData = await response.json();
      setTeams(teams.map(team => 
        team.id === teamId 
          ? { 
              ...team, 
              players: updatedTeamData.players.map(player => ({
                id: player.id,
                name: player.name,
                dateOfBirth: player.birthdate,
                position: player.position,
                type: player.player_type === 'foreign' ? 'Foreign' : 'Domestic',
                notes: player.note
              }))
            }
          : team
      ));
      alert('Cập nhật danh sách cầu thủ thành công!');
    } catch (error) {
      console.error('Error updating players:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật danh sách cầu thủ!');
    }
  };

  return (
    <div className={s.container}>
      <TeamsTable
        teams={teams}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
} 