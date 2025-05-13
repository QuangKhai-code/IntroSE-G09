import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {Provider} from "react-redux";
import {store} from "./store/index";
import App from "./App";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import Admin from "./pages/Admin/Admin";
import AddTeamForm from "./pages/AddTeamForm/AddTeamForm";
import NotFound from "./pages/NotFound/NotFound";
import RuleUpdateForm from "./pages/RuleUpdateForm/RuleUpdateForm";
import MatchRecordForm from "./pages/MatchRecordForm/MatchRecordForm";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={<Admin />}>
            <Route index element={<Navigate to="newteam"/>} />
            <Route path="newteam" element={<AddTeamForm />} />
            <Route path="rules" element={<RuleUpdateForm />} />
            <Route path="newrecord" element={<MatchRecordForm />}/>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
