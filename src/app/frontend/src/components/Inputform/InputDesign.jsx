"use client";
import React, {useState} from "react";
import styles from "./InputDesign.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Home icon component
const HomeIcon = () => {
  return (
    <div className={styles.homeIconWrapper}>
      <div>
        <svg
          width="62"
          height="62"
          viewBox="0 0 62 62"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.homeIconBg}
        >
          <path
            d="M0.5 20C0.5 9.23045 9.23045 0.5 20 0.5H42C52.7696 0.5 61.5 9.23045 61.5 20V42C61.5 52.7696 52.7696 61.5 42 61.5H20C9.23045 61.5 0.5 52.7696 0.5 42V20Z"
            fill="#90FF17"
            stroke="black"
          />
        </svg>
      </div>
      <div className={styles.homeIconInner}>
        <div>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.homeIcon}
          >
            <g clipPath="url(#clip0_133_83)">
              <path
                d="M12 14.9918C10.3432 14.9918 9 16.3349 9 17.9918V23.9918H15V17.9918C15 16.3349 13.6568 14.9918 12 14.9918Z"
                fill="#0F0F0F"
              />
              <path
                d="M17 17.9922V23.9922H21C22.6568 23.9922 24 22.649 24 20.9922V11.8712C24.0002 11.3517 23.7983 10.8525 23.437 10.4792L14.939 1.29218C13.4396 -0.330162 10.9089 -0.429771 9.28655 1.06967C9.20949 1.14092 9.13523 1.21512 9.06403 1.29218L0.581016 10.4762C0.208734 10.851 -0.000140554 11.3579 7.09607e-08 11.8862V20.9922C7.09607e-08 22.649 1.34316 23.9922 3 23.9922H6.99998V17.9922C7.01869 15.2654 9.22027 13.0386 11.8784 12.9745C14.6255 12.9082 16.9791 15.1729 17 17.9922Z"
                fill="#0F0F0F"
              />
              <path
                d="M12 14.9918C10.3432 14.9918 9 16.3349 9 17.9918V23.9918H15V17.9918C15 16.3349 13.6568 14.9918 12 14.9918Z"
                fill="#0F0F0F"
              />
            </g>
            <defs>
              <clipPath id="clip0_133_83">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};

// Input field component with icon
const InputField = ({ type, placeholder, onChange, icon }) => {
  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputIconWrapper}>
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className={styles.input}
        onChange={onChange}
        aria-label={placeholder}
      />
    </div>
  );
};

// Button component
const ActionButton = ({ text, className }) => {
  return (
    <button className={className}>
      {text}
    </button>
  );
};

function InputDesign() {
  const navigate = useNavigate();  // Initialize navigation
  const [username, setUsername] = useState("abc");
  const [password, setPassword] = useState("*****************");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle login logic here
    try {
    console.log("Sending request with:", { username, password });
    const response = await axios.post("http://127.0.0.1:8000/api/token/", {
      username: username, // Django expects "username" instead of "email"
      password: password,
    });

    const { access, refresh } = response.data;

    // Store tokens in local storage
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    console.log("Login successful:", response.data);
    alert("Login successful!");

    // Redirect or update UI as needed
    } catch (err) {
        setError(err.response?.data?.detail || "Login failed");
      }
    console.log({ username, password, rememberMe });
  };

  const userIcon = (
    <svg
      width="26"
      height="24"
      viewBox="0 0 26 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.inputIcon}
    >
      <path
        d="M21.7009 21.7306H19.6201V19.7603C19.6201 18.1281 18.2228 16.805 16.499 16.805H10.2568C8.53305 16.805 7.13568 18.1281 7.13568 19.7603V21.7306H5.05493V19.7603C5.05493 17.04 7.38389 14.8347 10.2568 14.8347H16.499C19.3719 14.8347 21.7009 17.04 21.7009 19.7603V21.7306ZM13.3779 12.8645C9.93042 12.8645 7.13568 10.2181 7.13568 6.95371C7.13568 3.6893 9.93042 1.04297 13.3779 1.04297C16.8254 1.04297 19.6201 3.6893 19.6201 6.95371C19.6201 10.2181 16.8254 12.8645 13.3779 12.8645ZM13.3779 10.8942C15.6762 10.8942 17.5394 9.12999 17.5394 6.95371C17.5394 4.77744 15.6762 3.01322 13.3779 3.01322C11.0796 3.01322 9.21642 4.77744 9.21642 6.95371C9.21642 9.12999 11.0796 10.8942 13.3779 10.8942Z"
        fill="#1C1C1C"
      />
    </svg>
  );

  // Lock icon for password input
  const lockIcon = (
    <svg
      width="26"
      height="25"
      viewBox="0 0 26 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.inputIcon}
    >
      <path
        d="M7.13576 8.8529V7.86777C7.13576 4.60336 9.93051 1.95703 13.378 1.95703C16.8255 1.95703 19.6202 4.60336 19.6202 7.86777V8.8529H21.701C22.2756 8.8529 22.7413 9.29396 22.7413 9.83802V21.6595C22.7413 22.2036 22.2756 22.6446 21.701 22.6446H5.05502C4.48044 22.6446 4.01465 22.2036 4.01465 21.6595V9.83802C4.01465 9.29396 4.48044 8.8529 5.05502 8.8529H7.13576ZM20.6606 10.8231H6.09539V20.6744H20.6606V10.8231ZM12.3376 16.4703C11.7157 16.1296 11.2973 15.4929 11.2973 14.7636C11.2973 13.6755 12.2288 12.7934 13.378 12.7934C14.5272 12.7934 15.4587 13.6755 15.4587 14.7636C15.4587 15.4929 15.0403 16.1296 14.4184 16.4703V18.7041H12.3376V16.4703ZM9.21651 8.8529H17.5395V7.86777C17.5395 5.6915 15.6763 3.92728 13.378 3.92728C11.0797 3.92728 9.21651 5.6915 9.21651 7.86777V8.8529Z"
        fill="#1C1C1C"
      />
    </svg>
  );

  return (
    <main className={styles.loginPage}>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/0e95dd8030ef69c576d05913de4d2a046f208d65"
        alt="Background"
        className={styles.backgroundImage}
      />
      <section className={styles.loginContainer}>
        <h1 className={styles.loginTitle}>Đăng nhập</h1>
        <HomeIcon />
        <form onSubmit={handleSubmit}>
          <InputField
            type="text"
            value = {username}
            onChange={(e) => setUsername(e.target.value)}
            icon={userIcon}
          />
          <InputField
            type="password"
            value = {password}
            onChange={(e) => setPassword(e.target.value)}
            icon={lockIcon}
          />
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
          <button type="button" className={styles.signupButton} onClick={() => navigate("/register")}>Sign up </button>
        </form>
      </section>
    </main>
  );
}

export default InputDesign;
