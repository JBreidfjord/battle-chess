import { useEffect, useState } from "react";

interface MoveTimerProps {
  time: number;
  maxTime: number;
}

const gradientColors = [
  "#fa233e",
  "#f92430",
  "#f82725",
  "#f73625",
  "#f64526",
  "#f55427",
  "#f46228",
  "#f37029",
  "#f27e2a",
  "#f18c2a",
  "#f0992b",
  "#efa72c",
  "#eeb32d",
  "#eec02e",
  "#edcd2f",
  "#ecd92f",
  "#ebe530",
  "#e3ea31",
  "#d5e932",
  "#c8e833",
  "#bbe734",
  "#afe635",
  "#a2e535",
  "#96e436",
  "#8ae337",
  "#7fe238",
  "#73e139",
  "#68e03a",
  "#5ddf3b",
  "#52de3b",
  "#48dd3c",
  "#3edc3d",
  "#3edb48",
  "#3fda53",
  "#40d95e",
  "#41d869",
  "#41d774",
  "#42d67e",
  "#43d588",
  "#44d492",
];

const getGradientColor = (pct: number) => {
  const index = Math.floor(pct * (gradientColors.length - 1));
  return gradientColors[index];
};

export default function MoveTimer({ time, maxTime }: MoveTimerProps) {
  const [pct, setPct] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPct(() => {
        const remainingTime = time - Date.now() / 1000;
        const pct = remainingTime / maxTime;
        return pct;
      });
    }, 1000 / 60); // 60 fps
    return () => clearInterval(interval);
  }, [time, maxTime]);

  return (
    <div className="move-timer">
      <div
        style={{
          backgroundColor: getGradientColor(pct),
          height: `${pct * 100}%`,
          width: "100%",
        }}
      />
    </div>
  );
}
