import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TeamsTable from '../../components/TeamsTable/TeamsTable';
import { toast } from 'react-toastify';
import { fetchTeams, updateTeamLocally } from '../../store/team/teamList-slice';
import s from './style.module.css';

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function EditTeamForm() {
  const dispatch = useDispatch();
  const teams = useSelector(state => state.teamListSlice.teams);
  const status = useSelector(state => state.teamListSlice.status);
  const error = useSelector(state => state.teamListSlice.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTeams());
    }
  }, [status, dispatch]);

  const handleDelete = async (teamId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đội bóng này?')) {
      try {
        const response = await fetch(`${API_BASE}/api/teams/${teamId}/delete_team/`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete team');
        }

        // Refresh teams list after deletion
        dispatch(fetchTeams());
        alert('Xóa đội bóng thành công!');
      } catch (error) {
        console.error('Error deleting team:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa đội bóng!');
      }
    }
  };

  const handleUpdate = async (updatedTeam) => {
    try {
      const response = await fetch(`${API_BASE}/api/teams/${updatedTeam.id}/update_team_info/`, {
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

      // Refresh the entire teams list to get updated data
      dispatch(fetchTeams());

      toast.success('Cập nhật thông tin đội bóng thành công!',
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin đội bóng!');
    }
  };

  if (status === 'loading') {
    return(
      <div className={s.loading_overlay}>
        <div className={s.loading_spinner}></div>
      </div>
    )
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

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