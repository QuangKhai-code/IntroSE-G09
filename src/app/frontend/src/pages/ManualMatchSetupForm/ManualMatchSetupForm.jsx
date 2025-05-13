import React from "react";
import s from "./style.module.css";
import { useState } from "react";
import SaveButton from "../../components/SaveButton/SaveButton";
import Input from "../../components/Input/Input";

export default function ManualMatchSetupForm() {
  const [formData, setFormData] = useState({
    round: "",
    stadium: "",
    team1: "",
    team2: "",
    date: "",
    time: "",
});

  const inputFields = [
    { id: "round", label: "Vòng thi đấu", placeholder: "Vòng đấu" },
    { id: "stadium", label: "Sân đấu", placeholder: "Tên Sân" },
    { id: "team1", label: "Đội 1", placeholder: "Tên đội 1" },
    { id: "team2", label: "Đội 2", placeholder: "Tên đội 2" },
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
              placeholder={field.placeholder} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      <SaveButton />
    </form>
  );
}