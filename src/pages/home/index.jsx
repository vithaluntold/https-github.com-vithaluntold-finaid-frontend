import React from "react";
import classNames from "./home.module.scss";
import Navbar from "../../components/navbar";
import Landing from "../../components/home/landing";
import MarketPlace from "../../components/home/marketplace";
import AgentMarketplace from "../../components/home/agentmarketplace";
import FeedbackCarousal from "../../components/home/feedback";
import Footer from "../../components/home/footer";

const Home = () => {
  return (
    <div className={classNames.home}>
      <Navbar />
      <div className={classNames.allComponents}>
        <Landing />
        <MarketPlace />
        <AgentMarketplace />
      </div>
      <FeedbackCarousal />
      <Footer />
    </div>
  );
};

export default Home;
