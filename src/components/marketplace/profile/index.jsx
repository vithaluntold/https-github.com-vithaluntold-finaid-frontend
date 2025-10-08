import React, { useState } from "react";
import classNames from "./profile.module.scss";

//assets
import csvIcon from "../../../assets/images/icons/csv.svg";
import { useParams } from "react-router-dom";
import { allAgents, allStepsSamjr } from "../../../assets/data";
import { useHistory } from "react-router-dom";
import { Steps } from "antd";

const { Step } = Steps;

const allSections = ["About", "Workflow", "Input", "Output", "Integrations"];

const Profile = () => {
  const history = useHistory();
  const { agentid } = useParams();
  const [selectedSection, setSelectedSection] = useState("About");
  const selectedAgent = allAgents.filter((eachAgent) => {
    return eachAgent?.searchName?.toLowerCase() === agentid;
  });

  return (
    <div className={classNames.profile}>
      <div className={classNames.leftContainer}>
        <div className={`${classNames.boxContainer} ${classNames.mainCard}`}>
          <div className={classNames.topCard}></div>
          <div className={classNames.bottomCard}>
            <img
              src={selectedAgent?.length > 0 && selectedAgent[0]?.profilePic}
              alt={selectedAgent?.length > 0 && selectedAgent[0]?.name}
            />
            <div>
              <div className={classNames.profileContainer}>
                <div className={classNames.name}>
                  {selectedAgent?.length > 0 && selectedAgent[0]?.name}
                </div>
                <div>
                  Created & Trained By <span>@Finace</span>
                </div>
                <div>Hyderabad, India</div>
              </div>
              <div className={classNames.otherDetails}>
                <div className={classNames.btnsContainer}>
                  <div>Demo</div>
                  <div
                    onClick={() => {
                      if (agentid === "zaickjr" || agentid === "zaicksr") {
                        window.open("https://studio.finaid.io/");
                      } else {
                        history.push(`/execute/${agentid}`);
                      }
                    }}
                  >
                    Execute
                  </div>
                </div>
                <div className={classNames.allCounts}>
                  <div>
                    <div>0</div>
                    <div>Hires</div>
                  </div>
                  <div>
                    <div>0</div>
                    <div>Executions</div>
                  </div>
                  <div>
                    <div>$2.00</div>
                    <div>Per Execution</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`${classNames.boxContainer} ${classNames.fullDetails}`}>
          <div className={classNames.allDetailsSection}>
            {allSections?.map((eachSection, index) => {
              return (
                <div
                  className={
                    selectedSection === eachSection &&
                    classNames.selectedSection
                  }
                  key={eachSection + index}
                  onClick={() => setSelectedSection(eachSection)}
                >
                  {eachSection}
                </div>
              );
            })}
          </div>
          {selectedSection === "Input" || selectedSection === "Output" ? (
            <div className={classNames.inputOutputDiv}>
              <div className={classNames.box}>
                <div>
                  <img src={csvIcon} alt="csvIcon" />
                </div>
                <div className={classNames.title}>Spreadsheet</div>
              </div>
            </div>
          ) : selectedSection === "Workflow" ? (
            agentid === "saimjr" && (
              <div className={classNames.workFlow}>
                {allStepsSamjr?.map((eachStep, index) => {
                  return (
                    <div className={classNames.eachDiv}>
                      <div className={classNames.title}>{eachStep?.step}</div>
                      <div className={classNames.desc}>{eachStep?.desc}</div>
                      {eachStep?.notification && (
                        <div className={classNames.optionalBtn}>
                          {eachStep?.notification}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : selectedSection === "About" ? (
            <div className={classNames.aboutSection}>
              <div>{selectedAgent?.length > 0 && selectedAgent[0]?.desc}</div>
              <div>{selectedAgent?.length > 0 && selectedAgent[0]?.desc2}</div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className={classNames.rightContainer}>
        <div className={classNames.boxContainer}>
          <div className={classNames.title}>Rating</div>
          {/* <div>5/5</div> */}
        </div>
        <div className={classNames.boxContainer}>
          <div className={classNames.title}>Accute Users</div>
        </div>
        <div className={classNames.boxContainer}>
          <div className={classNames.title}>Accountants.io Users</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
