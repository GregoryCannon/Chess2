import { Board, Cell, Move, Piece } from "../data/constants";
import { BOARD_HEIGHT, BOARD_SIZE, BOARD_WIDTH } from "../data/config";

export function prettyPrintCell(cell: Cell) {
  const row = getRow(cell);
  const col = getCol(cell);
  return ["a", "b", "c", "d", "e", "f", "g", "h"][col] + (BOARD_HEIGHT - row);
}

export function boardGet(board: Board, cell: Cell): Piece {
  return board.charAt(cell) as Piece;
}

export function boardSet(board: Board, cell: Cell, newVal: Piece): Board {
  return board.substring(0, cell) + newVal + board.substring(cell + 1);
}

export function encodeCell(row: number, col: number): number {
  return row * BOARD_WIDTH + col;
}

export function getRow(cell: Cell): number {
  return Math.floor(cell / BOARD_WIDTH);
}

export function getCol(cell: Cell): number {
  return cell % BOARD_WIDTH;
}

export const BLACK_MONKEY_RESCUE_START_CELL = 39;
export const WHITE_MONKEY_RESCUE_START_CELL = 24;
export const WHITE_QUEEN_JAIL = BOARD_SIZE + 0;
export const WHITE_KING_JAIL = BOARD_SIZE + 1;
export const BLACK_QUEEN_JAIL = BOARD_SIZE + 2;
export const BLACK_KING_JAIL = BOARD_SIZE + 3;
export const BEAR_CELL = BOARD_SIZE + 4;

/** Advances the board state as per the provided move. Assumes that the previous move was legal. */
export function getBoardAfterMove(move: Move, board: Board): Board {
  let piece = boardGet(board, move.start);

  const endRow = getRow(move.end);

  // Promote pawns to queens if needed
  if (piece === Piece.wPawn && endRow === 0) {
    piece = Piece.wFishQueen;
  } else if (piece === Piece.bPawn && endRow === BOARD_HEIGHT - 1) {
    piece = Piece.bFishQueen;
  }

  board = boardSet(board, move.start, Piece.Empty);
  return boardSet(board, move.end, piece);
}
