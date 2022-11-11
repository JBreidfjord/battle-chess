export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export interface ClientMessage {
  move: Move;
}

export interface StateUpdate {
  fen: string;
  ready: boolean;
  moveTime: number;
  queue: number[];
}

export type ClientState = StateUpdate & {
  id: string;
};

export interface ServerMessage {}
