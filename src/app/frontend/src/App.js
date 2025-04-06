import React from "react"; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import InputDesign from "./components/Inputform/InputDesign.jsx"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<InputDesign />} />
      </Routes>
    </Router>
  );
}

export default App;

