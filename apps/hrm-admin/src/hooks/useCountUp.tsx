import React, { useEffect, useState } from "react";

export const useCountUp = () => {
  const [count, setCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (count < targetCount) {
      const step = Math.ceil(targetCount / ((5 * 1000) / 100));
      interval = setInterval(() => {
        setCount((prevCount) => Math.min(prevCount + step, targetCount));
      }, 100);
    }

    return () => {
      clearInterval(interval);
    };
  }, [targetCount]);

  const countUp = (countNumber: number) => {
    setTargetCount(countNumber);
  };

  return {
    count,
    countUp,
  };
};
