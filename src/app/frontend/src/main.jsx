import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {Provider} from "react-redux";
import {store, persistor} from "./store/index";
import { PersistGate } from 'redux-persist/integration/react';
import App from "./App";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import {Admin, ProtectedAdmin} from "./pages/Admin/Admin";
import AddTeamForm from "./pages/AddTeamForm/AddTeamForm";
import NotFound from "./pages/NotFound/NotFound";
import RuleUpdateForm from "./pages/RuleUpdateForm/RuleUpdateForm";
import MatchRecordForm from "./pages/MatchRecordForm/MatchRecordForm";
import ManualMatchSetupForm from "./pages/ManualMatchSetupForm/ManualMatchSetupForm";
import PlayersTable from "./components/PlayersTable/PlayersTable";
import PlayerPage from "./pages/PlayerPage/PlayerPage";
import MatchSchedule from "./pages/MatchSchedule/MatchSchedule";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/players" element={<PlayerPage />} />
            <Route path="/schedule" element={<MatchSchedule />} />

            <Route path="/admin" element={<ProtectedAdmin />}>
              <Route index element={<Navigate to="rules"/>} />
              <Route path="teams/add" element={<AddTeamForm />} />
              <Route path="rules" element={<RuleUpdateForm />} />
              <Route path="schedule/manual" element={<ManualMatchSetupForm />} />
              <Route path="match-results/add" element={<MatchRecordForm />}/>
            </Route>
            <Route path="/admin/teams/add/players" element={<PlayersTable />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
