import React, { FC } from "react";
import styles from "./index.scss";

interface SpinnerProps {
  value: number;
  textColor: string;
}

const OuterSpinner: FC<SpinnerProps> = ({ textColor, value }) => {
  return (
    <div className={`bp3-spinner ${styles.outerSpinner}`}>
      <svg width="400" height="400" strokeWidth="2" viewBox="2 2 96 96">
        <path
          className="bp3-spinner-track"
          d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
          style={{ stroke: "none" }}
        ></path>
        <path
          className="bp3-spinner-head"
          d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
          pathLength="100"
          strokeDasharray="100 100"
          strokeDashoffset={100 - 100 * value}
          style={{ stroke: textColor }}
        ></path>
      </svg>
    </div>
  );
};

export default OuterSpinner;
