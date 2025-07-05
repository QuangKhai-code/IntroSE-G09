import React, { useEffect } from "react";
import s from "./style.module.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SaveButton from "../../components/SaveButton/SaveButton";
import Input from "../../components/Input/Input";
import { fetchTeams } from "../../store/team/teamList-slice";
import { createMatch } from "../../store/matches/matches-slice";
import { toast } from "react-toastify";

export default function ManualMatchSetupForm() {
  const dispatch = useDispatch();
  const { teams, status: teamsStatus } = useSelector((state) => state.teamListSlice);

  const [formData, setFormData] = useState({
    round: "",
    stadium: "",
    home_team: "",
    away_team: "",
    match_date: "",
    match_time: "",
  });

  useEffect(() => {
    if (teamsStatus === 'idle') {
      dispatch(fetchTeams());
    }
  }, [dispatch, teamsStatus]);

  const handleInputChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const getTeamId = (teamName) => {
    const team = teams.find(t => t.name === teamName);
    return team?.id;
  };

  // Get unique stadiums from teams data
  const uniqueStadiums = [...new Set(teams.map(team => team.homeStadium))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.round || !formData.stadium || !formData.home_team || 
        !formData.away_team || !formData.match_date || !formData.match_time) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.home_team === formData.away_team) {
      alert("Hai đội không được trùng nhau");
      return;
    }

    try {
      const matchData = {
        round: parseInt(formData.round),
        home_team: getTeamId(formData.home_team),
        away_team: getTeamId(formData.away_team),
        match_date: formData.match_date,
        match_time: formData.match_time,
        stadium: formData.stadium
      };

      await dispatch(createMatch(matchData)).unwrap();
      alert("Tạo trận đấu thành công!");
      
      // Reset form
      setFormData({
        round: "",
        stadium: "",
        home_team: "",
        away_team: "",
        match_date: "",
        match_time: "",
      });
    } catch (error) {
      console.log("lỗi: ", error);
      toast.error("Có lỗi xảy ra khi tạo trận đấu");
    }
  };

  const inputFields = [
    { id: "round", type: "number", label: "Vòng thi đấu", placeholder: "Vòng đấu" },
    { id: "stadium", type: "text", label: "Sân đấu", placeholder: "Tên Sân" },
    { id: "match_date", type: "date", label: "Ngày", placeholder: "YYYY-MM-DD" },
    { id: "match_time", type: "time", label: "Giờ", placeholder: "HH:MM" },
  ];

  return (
    <form className={`${s.form_container}`} onSubmit={handleSubmit}>
      <div className={s.content}>
        {inputFields.map((field) => (
          <div className={s.input_group} key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              list={field.id === "stadium" ? "stadium-list" : undefined}
              value={formData[field.id]}
              onTextChange={(value) => handleInputChange(field.id, value)}
              handleChange={(e) => handleInputChange(field.id, e.target.value)}
            />
            {field.id === "stadium" && (
              <datalist id="stadium-list">
                {uniqueStadiums.map((stadium) => (
                  <option key={stadium} value={stadium} />
                ))}
              </datalist>
            )}
          </div>
        ))}

        <div className={s.input_group}>
          <label htmlFor="home_team">Đội 1</label>
          <Input
            id="home_team"
            list="teams-list"
            placeholder="Chọn đội 1"
            value={formData.home_team}
            onTextChange={(value) => handleInputChange("home_team", value)}
            handleChange={(e) => handleInputChange("home_team", e.target.value)}
          />
          <datalist id="teams-list">
            {teams.map((team) => (
              <option key={team.id} value={team.name} />
            ))}
          </datalist>
        </div>

        <div className={s.input_group}>
          <label htmlFor="away_team">Đội 2</label>
          <Input
            id="away_team"
            list="teams-list"
            placeholder="Chọn đội 2"
            value={formData.away_team}
            onTextChange={(value) => handleInputChange("away_team", value)}
            handleChange={(e) => handleInputChange("away_team", e.target.value)}
          />
        </div>
      </div>

      <SaveButton />
    </form>
  );
}