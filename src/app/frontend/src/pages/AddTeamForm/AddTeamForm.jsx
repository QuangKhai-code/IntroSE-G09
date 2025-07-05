import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setTeamName, setHomeStadium, clearFormData, clearFormSubmittedFlag, saveTeamAsync } from "../../store/team/team-slice";
import Toast from "../../components/Toast/Toast";
import { toast } from "react-toastify";

import s from "./style.module.css";
import SaveButton from "../../components/SaveButton/SaveButton";
import Input from "../../components/Input/Input";

export default function AddTeamForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teamName, homeStadium, formSubmitted, players } = useSelector((state) => state.teamSlice);
  const [showToast, setShowToast] = useState(false);
  const rules = useSelector((store) => store.rulesSlice.rules);

  // Check if there are unsaved changes
  const hasUnsavedChanges = teamName || homeStadium || players.length > 0;

  // Expose unsaved changes state to window object
  useEffect(() => {
    window.hasUnsavedTeamChanges = hasUnsavedChanges;
    return () => {
      window.hasUnsavedTeamChanges = false;
    };
  }, [hasUnsavedChanges]);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle form clearing from sidebar navigation
  useEffect(() => {
    const handleClearForm = () => {
      dispatch(clearFormData());
    };

    window.addEventListener('clearTeamForm', handleClearForm);
    return () => window.removeEventListener('clearTeamForm', handleClearForm);
  }, [dispatch]);

  // Handle navigation with links
  useEffect(() => {
    const handleClick = (e) => {
      // Check if the clicked element is a link
      const link = e.target.closest('a');
      if (link && hasUnsavedChanges) {
        e.preventDefault();
        const confirmed = window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?');
        if (confirmed) {
          dispatch(clearFormData());
          window.location.href = link.href;
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [hasUnsavedChanges, dispatch]);
  
  // Check if the form was previously submitted and reset the flag
  useEffect(() => {
    if (formSubmitted) {
      dispatch(clearFormSubmittedFlag());
    }
  }, [formSubmitted, dispatch]);

  // Handle successful team save
  useEffect(() => {
    const handleTeamSaved = () => {
      dispatch(clearFormData());
      setShowToast(true);
      // Add a small delay before navigation to allow toast to be seen
      setTimeout(() => {
        navigate('/admin/teams/add');
      }, 1500);
    };

    window.addEventListener('teamSaved', handleTeamSaved);
    return () => window.removeEventListener('teamSaved', handleTeamSaved);
  }, [dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName || !homeStadium) {
      toast.error("Vui lòng nhập đầy đủ thông tin đội bóng!");
      return;
    }
    
    // Only save if there are players added
    if (players.length < rules.min_team_players) {
      toast.error(`Vui lòng nhập ít nhất ${rules.min_team_players} cầu thủ!`);
      return;
    }
    
    try {
      const teamData = {
        name: teamName,
        home_stadium: homeStadium,
        players: players.map(player => ({
          name: player.name,
          birthdate: player.dateOfBirth,
          player_type: player.type.toLowerCase(),
          position: player.position,
          note: player.notes
        }))
      };
      
      await dispatch(saveTeamAsync(teamData)).unwrap();
      toast.success('Đội bóng đã được lưu thành công!');
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error(error.message || 'Lỗi khi lưu đội bóng. Vui lòng thử lại.');
    }
  };

  const handleAddPlayers = () => {
    if (!teamName || !homeStadium) {
      toast.error("Vui lòng nhập tên đội và sân nhà trước khi thêm cầu thủ!");
      return;
    }
    navigate("/admin/teams/add/players");
  };

  return (
    <>
      {showToast && (
        <Toast 
          message="Lưu thông tin đội bóng thành công!" 
          color="#7ff700" 
          onClose={() => setShowToast(false)}
        />
      )}
      <form className={s.form_container} onSubmit={handleSubmit}>
        <div className={s.input_group}>
          <label htmlFor="teamName">Tên đội</label>
          <Input
            id="teamName"
            placeholder="Tên đội"
            value={teamName}
            onTextChange={(value) => dispatch(setTeamName(value))}
          />
        </div>

      <div className={s.input_group}>
        <label htmlFor="homeStadium">Sân nhà</label>
        <Input
          id="homeStadium"
          placeholder="Sân nhà"
          value={homeStadium}
          onTextChange={(value) => dispatch(setHomeStadium(value))}
        />
      </div>

      <div className={s.detail_btn_group}>
        <button 
          type="button" 
          className={s.detail_btn}
          onClick={handleAddPlayers}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className={`bi bi-pencil-fill ${s.icon}`}
            viewBox="0 0 16 16"
          >
            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
          </svg>
          Danh sách cầu thủ ({players.length})
        </button>
      </div>
      
      <SaveButton />
    </form>
    </>
  );
}