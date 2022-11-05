export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export interface ClientMessage {
  clientId?: number;
  move: Move;
}

export interface ServerMessage {
}