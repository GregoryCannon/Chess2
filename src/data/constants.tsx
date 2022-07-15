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
  lastMove: Move;
};

export enum Piece {
  wPawn = "P",
  wElephant = "E",
  wCrow = "C",
  wMonke = "M",
  wQueen = "Q",
  wFishQueen = "F",
  wKingWithBanana = "K",
  wKing = "L",
  bPawn = "p",
  bElephant = "e",
  bCrow = "c",
  bMonke = "m",
  bQueen = "q",
  bFishQueen = "f",
  bKingWithBanana = "k",
  bKing = "l",
  Bear = "B",
  Empty = ".",
}

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
  // Row
  Piece.bPawn +
  Piece.bPawn +
  Piece.bElephant +
  Piece.bPawn +
  Piece.bPawn +
  Piece.bElephant +
  Piece.bPawn +
  Piece.bPawn +
  // Row
  emptyRow +
  emptyRow +
  emptyRow +
  emptyRow +
  // Row
  Piece.wPawn +
  Piece.wPawn +
  Piece.wElephant +
  Piece.wPawn +
  Piece.wPawn +
  Piece.wElephant +
  Piece.wPawn +
  Piece.wPawn +
  // Row
  Piece.wCrow +
  Piece.wMonke +
  Piece.wPawn +
  Piece.wQueen +
  Piece.wKingWithBanana +
  Piece.wPawn +
  Piece.wMonke +
  Piece.wCrow +
  // Jail cells
  Piece.Empty +
  Piece.Empty +
  Piece.Empty +
  Piece.Empty +
  // Bear cell
  Piece.Bear;

export const START_STATE: GameState = {
  board: StartBoard,
  crowsActive: false,
  whiteToMove: true,
  lastMove: null,
};
