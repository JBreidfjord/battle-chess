interface ReadyToggleProps {
  hasStarted: boolean;
  ready: boolean;
  isInteractive?: boolean;
  sendMessage?: (message: string) => void;
}

export default function ReadyToggle({
  hasStarted,
  ready,
  isInteractive,
  sendMessage,
}: ReadyToggleProps) {
  if (hasStarted) return null;

  const onReadyToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!sendMessage || !isInteractive) return;
    sendMessage(e.target.checked ? "ready" : "unready");
  };

  return (
    <div className={`ready-toggle ${ready ? "checked" : ""}`}>
      <label className={isInteractive ? "interactive" : ""}>
        {ready ? "Ready" : "Not Ready"}
        <input type="checkbox" disabled={!isInteractive} checked={ready} onChange={onReadyToggle} />
      </label>
    </div>
  );
}
