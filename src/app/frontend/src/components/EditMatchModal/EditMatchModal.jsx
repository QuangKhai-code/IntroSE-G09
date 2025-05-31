import React, { useState } from 'react';
import { motion } from 'framer-motion';
import s from './style.module.css';

const EditMatchModal = ({ match, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    round: match.round,
    round_number: match.round_number,
    home_team: match.home_team,
    home_team_name: match.home_team_name,
    away_team: match.away_team,
    away_team_name: match.away_team_name,
    match_date: match.match_date,
    match_time: match.match_time,
    stadium: match.stadium,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...match, ...formData });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={s.modal_overlay}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={s.modal_content}
      >
        <div className={s.modal_header}>
          <h2>Chỉnh sửa lịch thi đấu</h2>
          <button onClick={onClose} className={s.close_button}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.form_group}>
            <label>Vòng đấu</label>
            <input
              type="number"
              name="round"
              value={formData.round}
              onChange={handleInputChange}
              required
            />
          </div>
 
          <div className={s.form_group}>
            <label>Đội nhà</label>
            <input
              type="text"
              name="home_team_name"
              value={formData.home_team_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={s.form_group}>
            <label>Đội khách</label>
            <input
              type="text"
              name="away_team_name"
              value={formData.away_team_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={s.form_group}>
            <label>Sấn đấu</label>
            <input
              type="text"
              name="stadium"
              value={formData.stadium}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={s.form_group}>
            <label>Ngày thi đấu</label>
            <input
              type="date"
              name="match_date"
              value={formData.match_date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={s.form_group}>
            <label>Giờ thi đấu</label>
            <input
              type="time"
              name="match_time"
              value={formData.match_time}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={s.modal_footer}>
            <button type="submit" className={s.save_button}>
              Lưu thay đổi
            </button>
            <button type="button" onClick={onClose} className={s.cancel_button}>
              Hủy bỏ
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditMatchModal; 