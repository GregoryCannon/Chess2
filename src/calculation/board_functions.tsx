import { Board, Cell, Move } from "../data/constants";
import { Piece } from "../data/pieces";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../data/config";

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

export const LeftJailUpper = BOARD_WIDTH * BOARD_HEIGHT + 0;
export const LeftJailLower = BOARD_WIDTH * BOARD_HEIGHT + 1;
export const RightJailUpper = BOARD_WIDTH * BOARD_HEIGHT + 2;
export const RightJailLower = BOARD_WIDTH * BOARD_HEIGHT + 3;
export const BearCell = BOARD_WIDTH * BOARD_HEIGHT + 4;

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
