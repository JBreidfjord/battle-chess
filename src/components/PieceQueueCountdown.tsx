interface PieceQueueCountdownProps {
  count: number;
  tightLayout?: boolean;
}

export default function PieceQueueCountdown({ count, tightLayout }: PieceQueueCountdownProps) {
  if (tightLayout) {
    return (
      <div className="piece-queue-countdown">
        {count === 1 ? <span className="red">1</span> : count}
      </div>
    );
  }

  return (
    <div className="piece-queue-countdown">
      {count === 1 ? <span className="red">Next turn</span> : `${count} turns`}
    </div>
  );
}
