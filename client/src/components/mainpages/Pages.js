import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard"
import Import from "./import/Import"
import Returned from "./returned/Returned"
import Statistical from "./statistical/Statistical"
import About from "./about/About"
import Login from "../auth/Login";
import Register from "../auth/Register";
import NotFound from "../utils/not_found/NotFound";

import { GlobalState } from "../../GlobalState";

const Pages = () => {
  const state = useContext(GlobalState);
  const [isLogged] = state.userAPI.isLogged;
  const [isAdmin] = state.userAPI.isAdmin;
  return (
    <Routes>
      <Route
        path="/login"
        exact
        element={<Login />}
      />

      <Route
        path="/dashboard"
        exact
        element={isLogged ? <Dashboard /> : <Login />}
      />
      <Route
        path="/register"
        exact
        element={<Register />}
      />
      <Route
        path="/import"
        exact
        element={isLogged ? <Import /> : <Login />}
      />
      <Route
        path="/returned"
        exact
        element={isLogged ? <Returned /> : <Login />}
      />
      {/* <Route
        path="/statistical"
        exact
        element={<Statistical />}
      /> */}
      <Route
        path="/about"
        exact
        element={isLogged ? <About /> : <Login />}
      />
    </Routes>
  )
}

export default Pages