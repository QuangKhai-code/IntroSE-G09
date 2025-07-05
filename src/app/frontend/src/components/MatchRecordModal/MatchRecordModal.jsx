import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import s from './style.module.css';

const API_BASE = import.meta.env.VITE_API_URL || "";

const MatchRecordModal = ({ match, onClose, onSave, rules, isEditing }) => {
  const [formData, setFormData] = useState({
    home_score: match.home_score || 0,
    away_score: match.away_score || 0,
    goals: match.goals || []
  });

  const [newGoal, setNewGoal] = useState({
    player: '',
    goal_type: rules?.goal_types?.[0]?.code || 'A',
    minute: ''
  });

  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const [homeResponse, awayResponse] = await Promise.all([
          fetch(`${API_BASE}/api/teams/${match.home_team}`),
          fetch(`${API_BASE}/api/teams/${match.away_team}`)
        ]);

        if (!homeResponse.ok || !awayResponse.ok) {
          throw new Error('Failed to fetch team data');
        }

        const [homeData, awayData] = await Promise.all([
          homeResponse.json(),
          awayResponse.json()
        ]);

        setHomeTeam(homeData);
        setAwayTeam(awayData);
      } catch (error) {
        console.error('Error fetching team data:', error);
        toast.error('Có lỗi xảy ra khi tải thông tin đội bóng!');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [match]);

  const handleScoreChange = (team, value) => {
    setFormData(prev => ({
      ...prev,
      [team]: parseInt(value) || 0
    }));
  };

  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddGoal = () => {
    if (!newGoal.player || !newGoal.minute) {
      toast.error('Vui lòng điền đầy đủ thông tin bàn thắng!');
      return;
    }

    if (parseInt(newGoal.minute) > rules?.max_goal_time) {
      toast.error(`Thời gian ghi bàn không được vượt quá ${rules.max_goal_time} phút!`);
      return;
    }

    const totalGoals = formData.home_score + formData.away_score;
    if (formData.goals.length >= totalGoals) {
      toast.error('Số bàn thắng không được vượt quá tổng tỷ số!');
      return;
    }

    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, { ...newGoal, player: parseInt(newGoal.player) }]
    }));

    setNewGoal({
      player: '',
      goal_type: rules?.goal_types?.[0]?.code || 'A',
      minute: ''
    });
  };

  const handleRemoveGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.goals.length === 0) {
      toast.error('Vui lòng thêm ít nhất một bàn thắng!');
      return;
    }

    const totalGoals = formData.goals.length;
    if (totalGoals !== (formData.home_score + formData.away_score)) {
      toast.error('Tổng số bàn thắng không khớp với tỷ số!');
      return;
    }

    onSave(formData);
  };

  const getGoalTypeName = (typeId) => {
    const goalType = rules?.goal_types?.find(type => type.code === typeId);
    return goalType ? goalType.description : 'Không xác định';
  };

  const getPlayerName = (playerId) => {
    const homePlayer = homeTeam?.players?.find(p => p.id === playerId);
    const awayPlayer = awayTeam?.players?.find(p => p.id === playerId);
    const player = homePlayer || awayPlayer;
    return player ? player.name : `Cầu thủ #${playerId}`;
  };

  if (loading) {
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
          <div className={s.loading}>Đang tải dữ liệu...</div>
        </motion.div>
      </motion.div>
    );
  }

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
          <h2>{isEditing ? 'Chỉnh sửa kết quả trận đấu' : 'Ghi nhận kết quả trận đấu'}</h2>
          <button onClick={onClose} className={s.close_button}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className={s.match_info}>
          <h3>{`${match.home_team_name} - ${match.away_team_name}`}</h3>
          <p>Sân: {match.stadium}</p>
          <p>Ngày: {new Date(match.match_date).toLocaleDateString('vi-VN')}</p>
          <p>Giờ: {match.match_time}</p>
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.score_section}>
            <div className={s.score_input}>
              <label>{match.home_team_name}</label>
              <input
                type="number"
                min="0"
                value={formData.home_score}
                onChange={(e) => handleScoreChange('home_score', e.target.value)}
              />
            </div>
            <div className={s.score_input}>
              <label>{match.away_team_name}</label>
              <input
                type="number"
                min="0"
                value={formData.away_score}
                onChange={(e) => handleScoreChange('away_score', e.target.value)}
              />
            </div>
          </div>

          <div className={s.goals_section}>
            <h3>Danh sách bàn thắng</h3>
            
            <div className={s.goal_form}>
              <select
                name="player"
                value={newGoal.player}
                onChange={handleGoalChange}
              >
                <option value="">Chọn cầu thủ</option>
                
                <optgroup label={match.home_team_name}>
                  {homeTeam?.players?.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.position})
                    </option>
                  ))}
                </optgroup>

                <optgroup label={match.away_team_name}>
                  {awayTeam?.players?.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.position})
                    </option>
                  ))}
                </optgroup>
              </select>
              
              <select
                name="goal_type"
                value={newGoal.goal_type}
                onChange={handleGoalChange}
              >
                {rules?.goal_types?.map(type => (
                  <option key={type.code} value={type.code}>
                    {type.description}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                name="minute"
                placeholder="Phút ghi bàn"
                min="1"
                max={rules?.max_goal_time || 90}
                value={newGoal.minute}
                onChange={handleGoalChange}
              />
             
             <button type="button" onClick={handleAddGoal} className={s.add_button}>
                Thêm
              </button>
            </div>

            <div className={s.goals_list}>
              {formData.goals.map((goal, index) => (
                <div key={index} className={s.goal_item}>
                  <span>{getPlayerName(goal.player)}</span>
                  <span>{getGoalTypeName(goal.goal_type)}</span>
                  <span>Phút {goal.minute}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(index)}
                    className={s.remove_button}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={s.modal_footer}>
            <button type="submit" className={s.save_button}>
              {isEditing ? 'Cập nhật kết quả' : 'Thêm kết quả'}
            </button>
            <button type="button" onClick={onClose} className={s.cancel_button}>
              Hủy
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default MatchRecordModal;