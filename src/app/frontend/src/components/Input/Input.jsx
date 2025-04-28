import React from "react";
import s from "./style.module.css";

export default function Input(props) {
  return (
    <>
      <input className={s.input}
        type={`text || ${props.type}`}
        placeholder={props.placeholder}
        onChange={(e) => {
          props.onTextChange(e.target.value);
        }}
      />
    </>
  );
}
