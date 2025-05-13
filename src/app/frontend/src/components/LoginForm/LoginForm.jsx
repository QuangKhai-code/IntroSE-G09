import React from "react";
import s from "./style.module.css";
import Input from "../Input/Input";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/auth/auth-slice"; 
import { useNavigate } from "react-router-dom"; 

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  const submit = async (e) => {
    e.preventDefault();
    alert(`Username: ${username}, Password: ${password}`);  

    try {
      // API call to login
      // const user = await .....
      // dispatch(setUser(user));
      alert("Login successful!");
      navigate("/"); 
    }
    catch (error) {
      alert("Login failed. Please try again.");
    }
  }

  return (
    <form className={s.form_container} onSubmit={submit}>
      <div className={s.input_container}>
        <div className={s.input_group}>
          <div className={s.icon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />{" "}
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Username"
            onTextChange={setUsername}
            className={`${s.input_text}`}
          />
        </div>

        <div className={s.input_group}>
          <div className={s.icon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5" />{" "}
              <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />{" "}
            </svg>
          </div>
          <Input
            type="password"
            placeholder="Password"
            onTextChange={setPassword}
            className={`${s.input_text}`}
          />
        </div>
      </div>

      <div className={s.submit_container}>
        <button type="submit">Login</button>
      </div>
    </form>
  );
}