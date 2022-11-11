export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export interface ClientMessage {
  move: Move;
}

export interface ClientState {
  id: string;
  fen: string;
  ready: boolean;
  moveTime: number;
}

export interface StateUpdate {
  fen: string;
  ready: boolean;
  moveTime: number;
}

export interface ServerMessage {}
