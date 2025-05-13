import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setTeamName, setHomeStadium, saveTeam } from "../../store/team/team-slice";

import s from "./style.module.css";
import SaveButton from "../../components/SaveButton/SaveButton";
import Input from "../../components/Input/Input";

export default function AddTeamForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teamName, homeStadium } = useSelector((state) => state.teamSlice);

    const handleSubmit = (e) => {
      e.preventDefault();
      dispatch(saveTeam());
      alert("Team saved successfully!");
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
            onClick={() => navigate("/admin/teams/add/players")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class={`bi bi-pencil-fill ${s.icon}`}
              viewBox="0 0 16 16"
            >
              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
            </svg>
            Danh sách cầu thủ
          </button>
        </div>
        
        <SaveButton />
      </form>
    );
}