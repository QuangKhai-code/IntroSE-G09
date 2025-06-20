import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import s from "./style.module.css";

const RuleUpdateModal = ({ open, onClose, rules, onSave }) => {
  const [formData, setFormData] = useState({});
  const [localGoalTypes, setLocalGoalTypes] = useState([]);
  const [newGoalType, setNewGoalType] = useState({ name: '', description: '' });
  const [editingGoalType, setEditingGoalType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rules) {
      setFormData({
        maxPlayer: rules.max_team_players ?? "",
        minPlayer: rules.min_team_players ?? "",
        maxAge: rules.max_player_age ?? "",
        minAge: rules.min_player_age ?? "",
        win_score: rules.win_points ?? "",
        lose_score: rules.loss_points ?? "",
        draw_score: rules.draw_points ?? "",
        max_goal_time: rules.max_goal_time ?? "",
        max_foreign_player: rules.max_foreign_players ?? "",
      });
      setLocalGoalTypes(rules.goal_types || []);
    }
  }, [rules, open]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGoalTypeChange = (e) => {
    const { name, value } = e.target;
    setNewGoalType(prev => ({ ...prev, [name]: value }));
  };

  const handleAddGoalType = () => {
    if (newGoalType.code && newGoalType.description) {
      setLocalGoalTypes(prev => [...prev, { ...newGoalType, id: Date.now() }]);
      setNewGoalType({ code: '', description: '' });
    }
  };

  const handleEditGoalType = (goalType) => {
    setEditingGoalType(goalType);
    setNewGoalType(goalType);
  };

  const handleUpdateGoalType = () => {
    if (editingGoalType) {
      if (newGoalType.code && newGoalType.description) {
        setLocalGoalTypes(prev => 
          prev.map(gt => gt.id === editingGoalType.id ? { ...newGoalType, id: gt.id } : gt)
        );
        setEditingGoalType(null);
        setNewGoalType({ code: '', description: '' });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingGoalType(null);
    setNewGoalType({ code: '', description: '' });
  };

  const handleDeleteGoalType = (goalTypeId) => {
    setLocalGoalTypes(prev => prev.filter(gt => gt.id !== goalTypeId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedRules = {
        max_team_players: formData.maxPlayer,
        min_team_players: formData.minPlayer,
        max_player_age: formData.maxAge,
        min_player_age: formData.minAge,
        win_points: formData.win_score,
        loss_points: formData.lose_score,
        draw_points: formData.draw_score,
        goal_types: localGoalTypes,
        max_goal_time: formData.max_goal_time,
        max_foreign_players: formData.max_foreign_player,
      };
      await onSave(updatedRules);
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

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
        <h2>Chỉnh sửa quy định</h2>
        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.formSection}>
            <h3>Thông tin cơ bản</h3>
            <div className={s.gridLayout}>
              <div className={s.formGroup}>
                <label htmlFor="maxPlayer">Số cầu thủ tối đa</label>
                <input
                  type="number"
                  id="maxPlayer"
                  value={formData.maxPlayer}
                  onChange={handleChange}
                  min={1}
                  required
                />
              </div>

              <div className={s.formGroup}>
                <label htmlFor="minPlayer">Số cầu thủ tối thiểu</label>
                <input
                  type="number"
                  id="minPlayer"
                  value={formData.minPlayer}
                  onChange={handleChange}
                  min={1}
                  required
                />
              </div>

              <div className={s.formGroup}>
                <label htmlFor="maxAge">Độ tuổi tối đa</label>
                <input
                  type="number"
                  id="maxAge"
                  value={formData.maxAge}
                  onChange={handleChange}
                  min={1}
                  required
                />
              </div>

              <div className={s.formGroup}>
                <label htmlFor="minAge">Độ tuổi tối thiểu</label>
                <input
                  type="number"
                  id="minAge"
                  value={formData.minAge}
                  onChange={handleChange}
                  min={1}
                  required
                />
              </div>

              <div className={s.formGroup}>
                <label htmlFor="win_score">Điểm trận thắng</label>
                <input
                  type="number"
                  id="win_score"
                  value={formData.win_score}
                  onChange={handleChange}
                  min={0}
                  required
                />
              </div>

              <div className={s.formGroup}>
                <label htmlFor="lose_score">Điểm trận thua</label>
                <input
                  type="number"
                  id="lose_score"
                  value={formData.lose_score}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={s.formGroup}>
                <label htmlFor="draw_score">Điểm trận hòa</label>
                <input
                  type="number"
                  id="draw_score"
                  value={formData.draw_score}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={s.formGroup}>
                <label htmlFor="max_goal_time">Thời gian ghi bàn tối đa</label>
                <input
                  type="number"
                  id="max_goal_time"
                  value={formData.max_goal_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={s.formGroup}>
                <label htmlFor="max_foreign_player">Số cầu thủ nước ngoài tối đa</label>
                <input
                  type="number"
                  id="max_foreign_player"
                  value={formData.max_foreign_player}
                  onChange={handleChange}
                  min={0}
                  required
                />
              </div>
            </div>
          </div>

          <div className={s.formSection}>
            <h3>Quản lý loại bàn thắng</h3>
            <div className={s.goalTypeForm}>
              <div className={s.formGroup}>
                <label htmlFor="goalTypeCode">Mã bàn thắng</label>
                <input
                  type="text"
                  id="goalTypeCode"
                  name="code"
                  value={newGoalType.code}
                  onChange={handleGoalTypeChange}
                  placeholder="Nhập mã bàn thắng"
                  // required
                />
              </div>
              <div className={s.formGroup}>
                <label htmlFor="goalTypeDescription">Mô tả</label>
                <input
                  type="text"
                  id="goalTypeDescription"
                  name="description"
                  value={newGoalType.description}
                  onChange={handleGoalTypeChange}
                  placeholder="Nhập mô tả"
                  // required
                />
              </div>
              <div className={s.buttonGroup}>
                {editingGoalType ? (
                  <>
                    <button
                      type="button"
                      className={s.addButton}
                      onClick={handleUpdateGoalType}
                    >
                      Cập nhật
                    </button>
                    <button
                      type="button"
                      className={s.cancelButton}
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={s.addButton}
                    onClick={handleAddGoalType}
                  >
                    Thêm mới
                  </button>
                )}
              </div>
            </div>

            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Mã bàn thắng</th>
                    <th>Mô tả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {localGoalTypes.map((goalType) => (
                    <tr key={goalType.id || goalType.code}>
                      <td>{goalType.code}</td>
                      <td>{goalType.description || "Không có mô tả"}</td>
                      <td className={s.actions}>
                        <button
                          type="button"
                          className={s.editButton}
                          onClick={() => handleEditGoalType(goalType)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className={s.deleteButton}
                          onClick={() => handleDeleteGoalType(goalType.id)}
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
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
};

export default RuleUpdateModal;