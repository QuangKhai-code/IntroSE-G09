import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setTeamName, setHomeStadium, saveTeam, clearFormData, clearFormSubmittedFlag } from "../../store/team/team-slice";

import s from "./style.module.css";
import SaveButton from "../../components/SaveButton/SaveButton";
import Input from "../../components/Input/Input";

export default function AddTeamForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teamName, homeStadium, formSubmitted, players } = useSelector((state) => state.teamSlice);

  // Check if the form was previously submitted and reset the flag
  useEffect(() => {
    if (formSubmitted) {
      // If form was successfully submitted, clear the data
      dispatch(clearFormData());
    }
  }, [formSubmitted, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName || !homeStadium) {
      alert("Vui lòng nhập đầy đủ thông tin đội bóng!");
      return;
    }
    
    // Only save if there are players added
    if (players.length === 0) {
      alert("Vui lòng thêm ít nhất một cầu thủ!");
      return;
    }
    
    dispatch(saveTeam());
    alert("Lưu thông tin đội bóng thành công!");
  };

  const handleAddPlayers = () => {
    if (!teamName || !homeStadium) {
      alert("Vui lòng nhập tên đội và sân nhà trước khi thêm cầu thủ!");
      return;
    }
    navigate("/admin/teams/add/players");
  };

  return (
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
  );
}