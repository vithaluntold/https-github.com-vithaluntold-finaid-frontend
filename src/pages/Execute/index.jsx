import React from "react";
import classNames from "./execution.module.scss";
import Navbar from "../../components/navbar";
import SamJR from "../../components/Execute/samjr";
import { useParams } from "react-router-dom";
import SamSr from "../../components/Execute/samsr";
import { allAgents } from "../../assets/data";
import SamJRLatest from "../../components/Execute/samjrLatest";

const Execute = () => {
  const { finaid } = useParams();

  const selectedAgent = allAgents.filter((eachAgent) => {
    return eachAgent?.searchName?.toLowerCase() === finaid;
  });

  return (
    <div className={classNames.execution}>
      <Navbar />
      <div className={classNames.allComponents}>
        {finaid === "saimsr" ? (
          <SamSr selectedAgent={selectedAgent} />
        ) : finaid === "saimjr" ? (
          <SamJRLatest selectedAgent={selectedAgent} />
        ) : (
          <div className={classNames.comingSoon}>Coming soon!</div>
        )}
      </div>
    </div>
  );
};

export default Execute;
