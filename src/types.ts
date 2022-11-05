export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export interface ClientMessage {
  move: Move;
}

export interface ServerMessage {
}