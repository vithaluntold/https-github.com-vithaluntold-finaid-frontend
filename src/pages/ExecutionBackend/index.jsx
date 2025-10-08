import React from "react";
import classNames from "./execution.module.scss";
import Navbar from "../../components/navbar";
import { useParams } from "react-router-dom";
import { allAgents } from "../../assets/data";
import SamJRBackend from "../../components/ExecutionBackend/samjr";
import SamSRBackend from "../../components/ExecutionBackend/samsr";
import SamSuperSRBackend from "../../components/ExecutionBackend/samsupersr";

const ExecutionBackend = () => {
  const { finaid } = useParams();

  const selectedAgent = allAgents.filter((eachAgent) => {
    return eachAgent?.searchName?.toLowerCase() === finaid;
  });

  return (
    <div className={classNames.execution}>
      <Navbar />
      <div className={classNames.allComponents}>
        {finaid === "saimsupersr" ? (
          <SamSuperSRBackend selectedAgent={selectedAgent} />
        ) : finaid === "saimsr" ? (
          <SamSRBackend selectedAgent={selectedAgent} />
        ) : finaid === "saimjr" ? (
          <SamJRBackend selectedAgent={selectedAgent} />
        ) : (
          <div className={classNames.comingSoon}>Coming soon!</div>
        )}
      </div>
    </div>
  );
};

export default ExecutionBackend;
