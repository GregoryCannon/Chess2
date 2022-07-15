import { Piece } from "../data/constants";

export function isAllied(piece: Piece, whiteToMove: boolean) {
  return whiteToMove ? isWhite(piece) : isBlack(piece);
}

export function isWhite(piece: Piece) {
  return (
    piece.length > 0 &&
    piece === piece.toUpperCase() &&
    piece !== Piece.Empty &&
    piece !== Piece.Bear
  );
}

export function isBlack(piece: Piece) {
  return (
    piece.length > 0 &&
    piece !== piece.toUpperCase() &&
    piece !== Piece.Empty &&
    piece !== Piece.Bear
  );
}
