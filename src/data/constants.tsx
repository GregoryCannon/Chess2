import { Piece } from "./pieces";

export enum TurnState {
  NotStarted,
  GameOver,
  WhiteTurn,
  BlackTurn,
}

export enum GameResult {
  None,
  WhiteWin,
  BlackWin,
  Draw,
}

export type LobbyData = {
  name: string;
  whitePlayerId: string;
  blackPlayerId: string;
  id: number;
};

export type MoveMap = Map<Cell, Set<Cell>>;

export interface Move {
  start: Cell;
  end: Cell;
}

/**
 * Encoded so that each cell is one character. Goes top to bottom, left to right.
 *
 * Special cells are included in a 9th row at the end:
 * Left Jail Upper = 0
 * Left Jail Lower = 1
 * Right Jail Upper = 2
 * Right Jail Lower = 3
 * Bear Cell = 4
 */
export type Board = string;

/**
 * A cell coordinate encoded into a 2-digit number.
 * This number will equal the index into the board string.
 */
export type Cell = number;

export type GameState = {
  whiteToMove: boolean;
  board: Board;
  crowsActive: boolean;
};

const emptyRow: string = "........";
export const StartBoard: string =
  Piece.bCrow +
  Piece.bMonke +
  Piece.bPawn +
  Piece.bQueen +
  Piece.bKingWithBanana +
  Piece.bPawn +
  Piece.bMonke +
  Piece.bCrow +
  // row
  Piece.bPawn +
  Piece.bPawn +
  Piece.bElephant +
  Piece.bPawn +
  Piece.bPawn +
  Piece.bElephant +
  Piece.bPawn +
  Piece.bPawn +
  // row
  emptyRow +
  emptyRow +
  emptyRow +
  emptyRow +
  // row
  Piece.wPawn +
  Piece.wPawn +
  Piece.wElephant +
  Piece.wPawn +
  Piece.wPawn +
  Piece.wElephant +
  Piece.wPawn +
  Piece.wPawn +
  // row
  Piece.wCrow +
  Piece.wMonke +
  Piece.wPawn +
  Piece.wQueen +
  Piece.wKingWithBanana +
  Piece.wPawn +
  Piece.wMonke +
  Piece.wCrow;

export const START_STATE = {
  board: StartBoard,
  crowsActive: false,
  whiteToMove: true,
};
