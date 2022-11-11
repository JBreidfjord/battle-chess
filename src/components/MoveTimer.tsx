interface MoveTimerProps {
  time: number;
}

export default function MoveTimer({ time }: MoveTimerProps) {
  return <div className="move-timer">{time}</div>;
}
