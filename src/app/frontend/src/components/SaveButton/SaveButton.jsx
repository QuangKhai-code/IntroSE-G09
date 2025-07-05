import React from "react";
import s from "./style.module.css";

export default function SaveButton( props ) {
    return (
      <div className={`${s.submit_container} ${props.className || ""}`}>
        <button type="submit" onClick={props.onClick}>
          Save
        </button>
      </div>
    );
}

        
