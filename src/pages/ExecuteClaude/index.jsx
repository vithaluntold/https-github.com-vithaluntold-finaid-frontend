import React from "react";
import classNames from "./execution.module.scss";
import Navbar from "../../components/navbar";
import { useParams } from "react-router-dom";
import { allAgents } from "../../assets/data";
import SamJRClaude from "../../components/ClaudeExecute/samjr";
import SamSRClaude from "../../components/ClaudeExecute/samsr";
import SamSuperSRClaude from "../../components/ClaudeExecute/samsupersr";

const ExecuteClaude = () => {
  const { finaid } = useParams();

  const selectedAgent = allAgents.filter((eachAgent) => {
    return eachAgent?.searchName?.toLowerCase() === finaid;
  });

  return (
    <div className={classNames.execution}>
      <Navbar />
      <div className={classNames.allComponents}>
        {finaid === "saimsupersr" ? (
          <SamSuperSRClaude selectedAgent={selectedAgent} />
        ) : finaid === "saimsr" ? (
          <SamSRClaude selectedAgent={selectedAgent} />
        ) : finaid === "saimjr" ? (
          <SamJRClaude selectedAgent={selectedAgent} />
        ) : (
          <div className={classNames.comingSoon}>Coming soon!</div>
        )}
      </div>
    </div>
  );
};

export default ExecuteClaude;
