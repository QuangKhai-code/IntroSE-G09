import React from "react";
import s from "./style.module.css";
import { useState } from "react";
import SaveButton from "../../components/SaveButton/SaveButton";
import Input from "../../components/Input/Input";

export default function MatchRecordForm() {
  const [formData, setFormData] = useState({
    team1: "",
    team2: "",
    result: "",
    stadium: "",
    date: "",
    time: "",
  });

  const inputFields = [
    { id: "team1", label: "Đội 1", placeholder: "Tên đội 1" },
    { id: "team2", label: "Đội 2", placeholder: "Tên đội 2" },
    { id: "result", label: "Tỷ số", placeholder: "Ex: 1-2" },
    { id: "stadium", label: "Sân", placeholder: "Tên sân" },
    { id: "date", label: "Ngày", placeholder: "Ex: 23/05/2023" },
    { id: "time", label: "Giờ", placeholder: "Ex: 14:00" },
  ];

  const handleInputChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    alert("Form submitted:");
    // TODO: API call and clear state
  };

  return (
    <form className={`${s.form_container}`} onSubmit={submit}>
      <div className={s.content}>
        {inputFields.map((field) => (
          <div className={s.input_group} key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <Input
              id={field.id}
              type={
                field.id === "date"
                  ? "date"
                  : field.id === "time"
                  ? "time"
                  : "text"
              }              
              placeholder={field.placeholder} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className={s.detail_btn_group}>
        <button className={s.detail_btn}>
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
          Chi tiết bàn thắng
        </button>
      </div>

      <SaveButton />
    </form>
  );
}
