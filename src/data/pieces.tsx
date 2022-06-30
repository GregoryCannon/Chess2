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
