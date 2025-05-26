import React from "react";
import s from "./style.module.css";

export default function Input(props) {
  return (
    <>
      <input 
        className={`${s.input} ${props.className || ""}`}
        type={props.type || "text"}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => {
          props.onTextChange(e.target.value);
          props.handleChange(e);
        }}
      />
    </>
  );
}
