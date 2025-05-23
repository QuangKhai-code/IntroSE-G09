import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRules, saveRules, updateRulesLocally } from "../../store/rules/rules-slice";
import s from "./style.module.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import RuleUpdateModal from "../../components/RuleUpdateModal/RuleUpdateModal";

export default function RuleUpdateForm() {
  const dispatch = useDispatch();
  const rules = useSelector((store) => store.rulesSlice.rules);
  const loading = useSelector((store) => store.rulesSlice.loading);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch rules on mount
  useEffect(() => {
    if (!rules || Object.keys(rules).length === 0) {
      dispatch(fetchRules());
    }
  }, [dispatch, rules]);

  // Handle save from modal
  const handleSave = async (updatedRules) => {
    try {
      await dispatch(saveRules(updatedRules)).unwrap();
      toast.success("Cập nhật thành công!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setModalOpen(false);
    } catch (error) {
      toast.error(error, {
        position: "top-center",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  if (!rules) return null;

  return (
    <>
      <div className={s.container}>
        <div className={s.header}>
          <h2 className={s.title}>Quy định giải đấu</h2>
          <button 
            className={s.modifyButton}
            onClick={() => setModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
            </svg>
            Chỉnh sửa
          </button>
        </div>

        <div className={s.rulesTable}>
          <div className={s.tableRow}>
            <div className={s.tableCell}>
              <div className={s.label}>Số cầu thủ tối đa:</div>
              <div className={s.value}>{rules.max_team_players}</div>
            </div>
            <div className={s.tableCell}>
              <div className={s.label}>Số cầu thủ tối thiểu:</div>
              <div className={s.value}>{rules.min_team_players}</div>
            </div>
          </div>

          <div className={s.tableRow}>
            <div className={s.tableCell}>
              <div className={s.label}>Độ tuổi tối đa:</div>
              <div className={s.value}>{rules.max_player_age}</div>
            </div>
            <div className={s.tableCell}>
              <div className={s.label}>Độ tuổi tối thiểu:</div>
              <div className={s.value}>{rules.min_player_age}</div>
            </div>
          </div>

          <div className={s.tableRow}>
            <div className={s.tableCell}>
              <div className={s.label}>Điểm trận thắng:</div>
              <div className={s.value}>{rules.win_points}</div>
            </div>
            <div className={s.tableCell}>
              <div className={s.label}>Điểm trận thua:</div>
              <div className={s.value}>{rules.loss_points}</div>
            </div>
          </div>

          <div className={s.tableRow}>
            <div className={s.tableCell}>
              <div className={s.label}>Điểm trận hòa:</div>
              <div className={s.value}>{rules.draw_points}</div>
            </div>
            <div className={s.tableCell}>
              <div className={s.label}>Số loại bàn thắng:</div>
              <div className={s.value}>{rules.goal_types?.length || 0}</div>
            </div>
          </div>

          <div className={s.tableRow}>
            <div className={s.tableCell}>
              <div className={s.label}>Thời gian ghi bàn tối đa:</div>
              <div className={s.value}>{rules.max_goal_time}</div>
            </div>
            <div className={s.tableCell}>
              <div className={s.label}>Số cầu thủ nước ngoài tối đa:</div>
              <div className={s.value}>{rules.max_foreign_players}</div>
            </div>
          </div>
        </div>


      </div>
      <RuleUpdateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rules={rules}
        onSave={handleSave}
      />
    </>

  );
}
