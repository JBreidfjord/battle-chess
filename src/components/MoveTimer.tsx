interface MoveTimerProps {
  time: number;
  maxTime: number;
}

export default function MoveTimer({ time, maxTime }: MoveTimerProps) {
  const fillStyle = {
    backgroundColor: "#44d492",
    height: `${(time / maxTime) * 100}%`,
    width: "100%",
  };

  return (
    <div className="move-timer">
      <div style={fillStyle} />
    </div>
  );
}
