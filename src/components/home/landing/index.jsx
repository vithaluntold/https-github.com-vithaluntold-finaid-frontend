import React, { useEffect } from "react";
import classNames from "./landing.module.scss";
import { motion, useScroll, useTransform } from "framer-motion";
//assets
import gentleman from "../../../assets/images/home/gentleman.webp";
import starIcon from "../../../assets/images/global/star.svg";
import { useHistory } from "react-router-dom";

const Landing = () => {
  const history = useHistory();
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 2]);

  return (
    <div className={classNames.landing}>
      <div className={classNames.mainText}>
        <div>Explore from the Network of AI</div>
        <div>Accountants</div>
      </div>
      <div className={classNames.desc}>
        <div>
          A marketplace for professional accountants with a twist. Discover
          Fin(Ai)ds, our
        </div>
        <div>professional AI enabled Accountants and hire them.</div>
      </div>
      <div
        className={classNames.hireBtn}
        onClick={() => history.push("/marketplace")}
      >
        Hire Now!
      </div>
      <motion.div className={classNames.mobileContainer} style={{ scale }}>
        <img src={gentleman} alt="gentleman" />
        <div className={classNames.detailsContainer}>
          <div className={classNames.name}>(Ai)dam</div>
          <div className={classNames.details}>
            <div>Packages</div>
            <div>QBO, Xero, Zoho</div>
          </div>
          <div className={classNames.details}>
            <div>Tasks</div>
            <div>
              <div>Invoiving</div>
              <div>Expense Categorization</div>
            </div>
          </div>
          <div className={classNames.details}>
            <div>Hires</div>
            <div>31.6k</div>
          </div>
          <div className={classNames.details}>
            <div>Rating</div>
            <div>4.3 out of 5</div>
          </div>
          <div className={classNames.details}>
            <div>Status</div>
            <div>Legend</div>
          </div>
          <div className={classNames.getStartedBtn}>Get Started</div>
        </div>
        <div className={classNames.hireCard}>Hire this Fin(Ai)d</div>
        <div className={classNames.starCard}>
          <img src={starIcon} alt="starIcon" />
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
