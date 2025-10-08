import React from "react";
import classNames from "./agentmarketplace.module.scss";
import { allAgents } from "../../../assets/data";
import { useHistory } from "react-router-dom";

const AgentMarketplace = () => {
  const history = useHistory();

  return (
    <div className={classNames.agentMarketplace}>
      <div className={classNames.mainText}>AGENT MARKETPLACE</div>
      <div className={classNames.allCards}>
        {allAgents?.map((eachAgent, index) => {
          return (
            <div>
              <img src={eachAgent?.profilePic} alt="" />
              <div className={classNames.title}>{eachAgent?.name}</div>
              <div className={classNames.desc}>
                <div>{eachAgent?.desc}</div>
                <div>{eachAgent?.desc2}</div>
              </div>
              <div
                className={classNames.startBtn}
                onClick={() =>
                  history.push(
                    `/marketplace/${eachAgent.searchName?.toLowerCase()}`
                  )
                }
              >
                Hire Now
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentMarketplace;
