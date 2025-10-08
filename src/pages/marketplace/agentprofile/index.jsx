import React from "react";
import classNames from "./agentprofile.module.scss";
import Navbar from "../../../components/navbar";
import Profile from "../../../components/marketplace/profile";

const AgentProfile = () => {
  return (
    <div className={classNames.agentProfile}>
      <Navbar />
      <div className={classNames.allComponents}>
        <Profile />
      </div>
    </div>
  );
};

export default AgentProfile;
