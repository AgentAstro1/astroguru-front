import React from "react";
import "../static/styles/anim.scss";

export const LoadAnimation: React.FC<{}> = () => {
  return (
    <div className="animation">
      <div className="windows8">
        <div className="wBall" id="wBall_1">
          <div className="wInnerBall"></div>
        </div>
        <div className="wBall" id="wBall_2">
          <div className="wInnerBall"></div>
        </div>
        <div className="wBall" id="wBall_3">
          <div className="wInnerBall"></div>
        </div>
        <div className="wBall" id="wBall_4">
          <div className="wInnerBall"></div>
        </div>
        <div className="wBall" id="wBall_5">
          <div className="wInnerBall"></div>
        </div>
      </div>
      <div className="animation-loading-text">
        Нейроастролог создаёт вашу консультацию, подождите 1 минуту
      </div>
    </div>
  );
};
