import React from "react";
import classNames from "./feedback.module.scss";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { allFeedback } from "../../../assets/data";

const FeedbackCarousal = () => {
  return (
    <div className={classNames.feedback}>
      <div className={classNames.carousalContainer}>
        <Carousel
          swipeable={false}
          draggable={false}
          centerMode={false}
          infinite={true}
          autoPlay={true}
          autoPlaySpeed={3000}
          transitionDuration={600}
          itemClass="carousel-item-padding-40-px"
          containerClass="carousel-container"
          sliderClass="slider-wrapper"
          dotListClass=""
          focusOnSelect={false}
          keyBoardControl
          minimumTouchDrag={80}
          renderArrowsWhenDisabled={false}
          renderButtonGroupOutside
          renderDotsOutside={false}
          responsive={{
            tablet: {
              breakpoint: {
                max: 4000,
                min: 220,
              },
              items: 1,
              partialVisibilityGutter: 30,
            },
          }}
          rewind={false}
          rewindWithAnimation={false}
          rtl={false}
          shouldResetAutoplay
          showDots={false}
          slidesToSlide={1}
        >
          {allFeedback?.map((eachFeedback, index) => {
            return (
              <EachFeedback
                key={eachFeedback?.author}
                eachFeedback={eachFeedback}
              />
            );
          })}
        </Carousel>
      </div>
    </div>
  );
};

export default FeedbackCarousal;

const EachFeedback = ({ eachFeedback }) => {
  return (
    <div className={classNames.eachFeedback}>
      <div className={classNames.card}>
        What people are saying about Fin(Ai)d
      </div>
      <div className={classNames.title}>{eachFeedback?.feedback}</div>
      <div className={classNames.person}>{eachFeedback?.author}</div>
    </div>
  );
};
