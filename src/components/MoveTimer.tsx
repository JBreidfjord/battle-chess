interface MoveTimerProps {
  time: number;
}

export default function MoveTimer({ time }: MoveTimerProps) {
  const fillStyle = {
    backgroundColor: "#44d492",
    height: `${(time / 7.5) * 100}%`,
    width: "100%",
  };

  return (
    <div className="move-timer">
      <div style={fillStyle} />
    </div>
  );
}
