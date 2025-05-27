import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import s from './style.module.css';

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function TeamModal({ team, onClose, onSave }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    homeStadium: '',
    players: [],
  });

  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    dateOfBirth: '',
    position: 'Forward',
    type: 'domestic',
    notes: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        homeStadium: team.homeStadium || '',
        players: team.players || [],
      });
    }
  }, [team]);

  // Handle change for team name and home stadium
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle when typing in player fields
  const handlePlayerChange = (e) => {
    const { name, value } = e.target;
    setNewPlayer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPlayer = async () => {
    if (newPlayer.name && newPlayer.dateOfBirth) {
      try {
        const playerData = {
          name: newPlayer.name,
          birthdate: newPlayer.dateOfBirth,
          position: newPlayer.position,
          player_type: newPlayer.type,
          note: newPlayer.notes || ""
        };
        console.log(playerData);
        const response = await fetch(`${API_BASE}/api/teams/${team.id}/add_player/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(playerData),
        });

        if (!response.ok) {
          throw new Error('Failed to add player');
        }

        // Fetch updated team data
        const teamResponse = await fetch(`${API_BASE}/api/teams/${team.id}/`);
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setFormData(prev => ({
            ...prev,
            players: teamData.players.map(player => ({
              id: player.id,
              name: player.name,
              dateOfBirth: player.birthdate,
              position: player.position,
              type: player.player_type,
              notes: player.note
            }))
          }));
        }

        toast.success('Thêm cầu thủ thành công!');
        
        setNewPlayer({
          name: '',
          dateOfBirth: '',
          position: 'Forward',
          type: 'domestic',
          notes: ''
        });
      } catch (error) {
        console.error('Error adding player:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi thêm cầu thủ!');
      }
    }
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setNewPlayer({
      id: player.id,
      name: player.name,
      dateOfBirth: player.dateOfBirth,
      position: player.position,
      type: player.type,
      notes: player.notes || ''
    });
  };

  const handleUpdatePlayer = async () => {
    if (editingPlayer) {
      try {
        const playerData = {
          id: newPlayer.id,
          name: newPlayer.name,
          birthdate: newPlayer.dateOfBirth,
          position: newPlayer.position,
          player_type: newPlayer.type,
          note: newPlayer.notes || ""
        };

        const response = await fetch(`${API_BASE}/api/teams/${team.id}/update_player/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(playerData),
        });

        if (!response.ok) {
          throw new Error('Failed to update player');
        }

        // Fetch updated team data
        const teamResponse = await fetch(`${API_BASE}/api/teams/${team.id}/`);
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setFormData(prev => ({
            ...prev,
            players: teamData.players.map(player => ({
              id: player.id,
              name: player.name,
              dateOfBirth: player.birthdate,
              position: player.position,
              type: player.player_type,
              notes: player.note
            }))
          }));
        }

        toast.success('Cập nhật cầu thủ thành công!');

        setEditingPlayer(null);
        setNewPlayer({
          name: '',
          dateOfBirth: '',
          position: 'Forward',
          type: 'domestic',
          notes: ''
        });
      } catch (error) {
        console.error('Error updating player:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi cập nhật cầu thủ!');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setNewPlayer({
      name: '',
      dateOfBirth: '',
      position: 'Forward',
      type: 'domestic',
      notes: ''
    });
  };

  const handleDeletePlayer = async (player) => {
    // Add confirmation dialog
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa cầu thủ ${player.name}?`);
    
    if (!isConfirmed) {
      return;
    }

    try {
      const playerData = {
          player_id: player.id,
          name: player.name,
          birthdate: player.dateOfBirth,
          position: player.position,
          player_type: player.type,
          note: player.notes || ""
        };
      console.log(playerData);
      const response = await fetch(`${API_BASE}/api/teams/${team.id}/remove_player/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        throw response;
      }

      // Fetch updated team data
      const teamResponse = await fetch(`${API_BASE}/api/teams/${team.id}/`);
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        setFormData(prev => ({
          ...prev,
          players: teamData.players.map(player => ({
            id: player.id,
            name: player.name,
            dateOfBirth: player.birthdate,
            position: player.position,
            type: player.player_type,
            notes: player.note
          }))
        }));
      }

      toast.success('Xóa cầu thủ thành công!');
    } catch (error) {
      console.log('Error deleting player:', error);
      toast.error(error || 'Có lỗi xảy ra khi xóa cầu thủ!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Only update if name or stadium has changed
      if (formData.name !== team.name || formData.homeStadium !== team.homeStadium) {
        const teamData = {
          name: formData.name,
          home_stadium: formData.homeStadium
        };

        const response = await fetch(`${API_BASE}/api/teams/${team.id}/update_team_info/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(teamData),
        });

        if (!response.ok) {
          throw new Error('Failed to update team');
        }

        onSave({
          id: team.id,
          name: formData.name,
          homeStadium: formData.homeStadium
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin đội bóng!');
    } finally {
      setIsSaving(false);
    }
  };

  // Position options
  const positionOptions = [
    {value: "Forward", label: "Forward"},
    {value: "Midfielder", label: "Midfielder"},
    {value: "Defender", label: "Defender"},
    {value: "Goalkeeper", label: "Goalkeeper"}
  ];

  // Type options
  const typeOptions = [
    { value: "domestic", label: "domestic" },
    { value: "foreign", label: "foreign" }
  ];

  // Filter players based on search query
  const filteredPlayers = formData.players.filter(player => 
    (player.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={s.modal_overlay}>
      <motion.div
        className={`${s.modal_content} ${isSaving ? s.loading : ''}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {isSaving && (
          <div className={s.loading_overlay}>
            <div className={s.loading_spinner}></div>
          </div>
        )}
        <h2>Chỉnh sửa đội bóng</h2>
        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.formSection}>
            <h3>Thông tin đội bóng</h3>
            <div className={s.gridLayout}>
              <div className={s.formGroup}>
                <label htmlFor="name">Tên đội</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên đội"
                  disabled={isSaving}
                />
              </div>
              <div className={s.formGroup}>
                <label htmlFor="homeStadium">Sân nhà</label>
                <input
                  type="text"
                  id="homeStadium"
                  name="homeStadium"
                  value={formData.homeStadium}
                  onChange={handleChange}
                  required
                  placeholder="Nhập sân nhà"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className={s.formSection}>
            <h3>Quản lý cầu thủ</h3>
            <div className={s.gridLayout}>
              <div className={s.formGroup}>
                <label htmlFor="playerName">Tên cầu thủ</label>
                <input
                  type="text"
                  id="playerName"
                  name="name"
                  value={newPlayer.name}
                  onChange={handlePlayerChange}
                  placeholder="Nhập tên cầu thủ"
                  disabled={isSaving}
                />
              </div>
              <div className={s.formGroup}>
                <label htmlFor="dateOfBirth">Ngày sinh</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={newPlayer.dateOfBirth}
                  onChange={handlePlayerChange}
                  disabled={isSaving}
                />
              </div>
              <div className={s.formGroup}>
                <label htmlFor="playerPosition">Vị trí</label>
                <select
                  id="playerPosition"
                  name="position"
                  value={newPlayer.position}
                  onChange={handlePlayerChange}
                  disabled={isSaving}
                >
                  {positionOptions.map((position) => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={s.formGroup}>
                <label htmlFor="playerType">Loại cầu thủ</label>
                <select
                  id="playerType"
                  name="type"
                  value={newPlayer.type}
                  onChange={handlePlayerChange}
                  disabled={isSaving}
                >
                  {typeOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`${s.formGroup} ${s.playerNotes}`}>
                <label htmlFor="playerNotes">Ghi chú</label>
                <textarea
                  id="playerNotes"
                  name="notes"
                  value={newPlayer.notes}
                  onChange={handlePlayerChange}
                  placeholder="Nhập ghi chú cho cầu thủ"
                  rows={3}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className={s.playerButtonGroup}>
              <button
                type="button"
                className={s.addPlayerButton}
                onClick={editingPlayer ? handleUpdatePlayer : handleAddPlayer}
                disabled={isSaving}
              >
                {editingPlayer ? 'Cập nhật cầu thủ' : 'Thêm cầu thủ'}
              </button>
              {editingPlayer && (
                <button
                  type="button"
                  className={s.cancelEditButton}
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Hủy cập nhật
                </button>
              )}
            </div>

            <div className={s.tableHeaderRow}>
              <div className={s.tableHeaderTitle}>
                Danh sách cầu thủ
              </div>
              <div className={s.searchContainer}>
                <input
                  type="text"
                  className={s.searchInput}
                  placeholder="Tìm kiếm theo tên hoặc vị trí"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className={s.playerTableWrapper}>
              <table className={s.playerTable}>
                <thead>
                  <tr>
                    <th>Tên cầu thủ</th>
                    <th>Ngày sinh</th>
                    <th>Vị trí</th>
                    <th>Loại cầu thủ</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.id}>
                      <td>{player.name}</td>
                      <td>{player.dateOfBirth}</td>
                      <td>{player.position}</td>
                      <td>{player.type}</td>
                      <td className={s.playerActions}>
                        <button
                          type="button"
                          className={s.editPlayerButton}
                          onClick={() => handleEditPlayer(player)}
                          disabled={isSaving}
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className={s.deletePlayerButton}
                          onClick={() => handleDeletePlayer(player)}
                          disabled={isSaving}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.buttonGroup}>
            <button 
              type="submit" 
              className={s.saveButton}
              disabled={isSaving}
            >
              {isSaving ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className={s.cancelButton}
              disabled={isSaving}
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 