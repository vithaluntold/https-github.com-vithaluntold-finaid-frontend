import React, { useState } from "react";
import classNames from "./landing.module.scss";
import { EachCustomDropdown } from "../../custom";
import { filter } from "framer-motion/client";

const Landing = ({ setSearchQuery }) => {
  const [filterQuery, setFilterQuery] = useState({});

  return (
    <div className={classNames.landing}>
      <div className={classNames.mainText}>
        <div>Explore from the Network of AI Accountants</div>
      </div>
      <div className={classNames.desc}>
        <div>
          A marketplace for professional accountants with a twist. Discover
          Fin(Ai)ds, our
        </div>
        <div>professional AI enabled Accountants and hire them.</div>
      </div>
      <div>
        <div className={classNames.searchByAgent}>
          <input
            type="text"
            placeholder="Search by agent name.."
            onChange={(event) => setSearchQuery(event?.target.value)}
          />
        </div>
        <div className={classNames.filterByAgent}>
          <EachCustomDropdown
            title="Integration"
            dropdown={[
              "Zoho",
              "QuickBooks",
              "Xero",
              "Microsoft Dynamics 365",
              "NetSuite",
              "Sage Intacct",
              "Microsoft Excel",
              "Google Sheet",
            ]}
            name="integration"
            stateValue={filterQuery}
            setState={setFilterQuery}
            typee="single"
          />
          <EachCustomDropdown
            title="Function"
            dropdown={["Invoicing", "Expense", "bills", "Bank categorization"]}
            name="function"
            stateValue={filterQuery}
            setState={setFilterQuery}
            typee="single"
          />
          <EachCustomDropdown
            title="Method"
            dropdown={["Accural", "Cash"]}
            name="method"
            stateValue={filterQuery}
            setState={setFilterQuery}
            typee="single"
          />
          <EachCustomDropdown
            title="Industry"
            dropdown={[
              "Ecommerce",
              "IT Staffing",
              "Hospitality",
              "Health Care",
            ]}
            name="industry"
            stateValue={filterQuery}
            setState={setFilterQuery}
            typee="single"
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
