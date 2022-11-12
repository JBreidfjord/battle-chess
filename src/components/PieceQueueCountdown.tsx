interface PieceQueueCountdownProps {
  count: number;
}

export default function PieceQueueCountdown({ count }: PieceQueueCountdownProps) {
  return (
    <div className="piece-queue-countdown">
      {count === 1 ? <span className="red">Next turn</span> : `${count} turns`}
    </div>
  );
}
