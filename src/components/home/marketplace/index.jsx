import React, { useEffect, useState, useRef } from "react";
import classNames from "./marketplace.module.scss";
import { allMarketPlace } from "../../../assets/data";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const MarketPlace = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "center center"],
  });

  const yTransform = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacityTransform = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className={classNames.marketplace} ref={ref}>
      <div className={classNames.marketPlaceCard}>ACCOUNTANTS MARKETPLACE</div>
      <div className={classNames.mainText}>
        Hire your Fin(Ai)d or a team of Fin(Ai)ds now
      </div>
      <div className={classNames.allCards}>
        {allMarketPlace?.map((eachPlace, index) => {
          const isOdd = index % 2 !== 0;

          return (
            <motion.div
              key={eachPlace?.title + index}
              style={isOdd ? { y: yTransform, opacity: opacityTransform } : {}}
              initial={false}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
            >
              <div>{eachPlace?.title}</div>
              <div>{eachPlace?.desc}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketPlace;
