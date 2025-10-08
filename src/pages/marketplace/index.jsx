import React, { useState } from "react";
import classNames from "./marketplace.module.scss";
import Navbar from "../../components/navbar";
import Landing from "../../components/marketplace/landing";
import AllAgents from "../../components/marketplace/allAgents";

const MarketPlace = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={classNames.marketPlace}>
      <Navbar />
      <div className={classNames.allComponents}>
        <Landing setSearchQuery={setSearchQuery} />
        <AllAgents searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default MarketPlace;
