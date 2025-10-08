import React, { useState } from "react";
import classNames from "./allagents.module.scss";

//assets
import samJR from "../../../assets/images/home/samjr.svg";
import { useHistory } from "react-router-dom";
import { allAgents } from "../../../assets/data";

const AllAgents = ({ searchQuery }) => {
  const history = useHistory();

  return (
    <div className={classNames.allCards}>
      {allAgents
        ?.filter((eachItem) =>
          eachItem?.searchName
            ?.toLowerCase()
            ?.includes(searchQuery?.toLowerCase())
        )
        ?.map((eachAgent, index) => {
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
  );
};

export default AllAgents;
