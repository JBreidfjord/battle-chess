interface PieceQueueCountdownProps {
  count: number;
}

export default function PieceQueueCountdown({ count }: PieceQueueCountdownProps) {
  return <div className="piece-queue-countdown">{count}</div>;
}
