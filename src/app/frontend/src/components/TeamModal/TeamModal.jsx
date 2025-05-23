import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import s from './style.module.css';

export default function TeamModal({ team, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    homeStadium: '',
    players: [],
  });

  const [editingPlayer, setEditingPlayer] = useState(null);
  
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    dateOfBirth: '',
    position: '',
    type: 'Trong nước',
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

  const handleAddPlayer = () => {
    if (newPlayer.name && newPlayer.dateOfBirth) {
      setFormData((prev) => ({
        ...prev,
        players: [...prev.players, { ...newPlayer, id: Date.now() }],
      }));
      setNewPlayer({
        name: '',
        dateOfBirth: '',
        position: '',
        type: 'Trong nước',
        notes: ''
      });
    }
  };

  // handle when click on edit button of player
  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setNewPlayer(player);
  };

  const handleUpdatePlayer = () => {
    if (editingPlayer) {
      setFormData((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === editingPlayer.id ? { ...newPlayer, id: p.id } : p
        ),
      }));
      setEditingPlayer(null);
      setNewPlayer({
        name: '',
        dateOfBirth: '',
        position: '',
        type: 'Trong nước',
        notes: ''
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setNewPlayer({
      name: '',
      dateOfBirth: '',
      position: '',
      type: 'Trong nước',
      notes: ''
    });
  };

  const handleDeletePlayer = (playerId) => {
    setFormData((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== playerId),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...team, ...formData });
  };

  // Position options
  const positionOptions = [
    "Forward",
    "Midfielder",
    "Defender",
    "Goalkeeper"
  ];

  // Type options
  const typeOptions = ["foreign", "domestic"];

  // Filter players based on search query
  const filteredPlayers = formData.players.filter(player => 
    (player.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.position || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={s.modal_overlay}>
      <motion.div
        className={s.modal_content}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
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
                  required
                />
              </div>
              <div className={s.formGroup}>
                <label htmlFor="playerPosition">Vị trí</label>
                <select
                  id="playerPosition"
                  name="position"
                  value={newPlayer.position}
                  onChange={handlePlayerChange}
                >
                  <option value="">Chọn vị trí</option>
                  {positionOptions.map((position) => (
                    <option key={position} value={position}>
                      {position}
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
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                />
              </div>
            </div>

            <div className={s.playerButtonGroup}>
              <button
                type="button"
                className={s.addPlayerButton}
                onClick={editingPlayer ? handleUpdatePlayer : handleAddPlayer}
              >
                {editingPlayer ? 'Cập nhật cầu thủ' : 'Thêm cầu thủ'}
              </button>
              {editingPlayer && (
                <button
                  type="button"
                  className={s.cancelEditButton}
                  onClick={handleCancelEdit}
                >
                  Hủy chỉnh sửa
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
                  placeholder="Tìm kiếm theo tên hoặc vị trí..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                      <td>{player.position || "Chưa có"}</td>
                      <td>{player.type || "Trong nước"}</td>
                      <td className={s.playerActions}>
                        <button
                          type="button"
                          className={s.editPlayerButton}
                          onClick={() => handleEditPlayer(player)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className={s.deletePlayerButton}
                          onClick={() => handleDeletePlayer(player.id)}
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
            <button type="submit" className={s.saveButton}>
              Cập nhật
            </button>
            <button type="button" onClick={onClose} className={s.cancelButton}>
              Hủy bỏ
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
} 