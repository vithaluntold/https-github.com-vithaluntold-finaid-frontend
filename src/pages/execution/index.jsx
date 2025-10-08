import React from "react";
import classNames from "./execution.module.scss";
import Navbar from "../../components/navbar";
import UploadSheet from "../../components/execution/uploadsheet";
import { useParams } from "react-router-dom";
import SamSr from "../../components/execution/samsr";
import { allAgents } from "../../assets/data";

const Execution = () => {
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
          <UploadSheet selectedAgent={selectedAgent} />
        ) : (
          <div className={classNames.comingSoon}>Coming soon!</div>
        )}
      </div>
    </div>
  );
};

export default Execution;
