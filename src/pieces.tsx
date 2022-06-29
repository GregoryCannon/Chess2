export enum Piece {
  wPawn = "P",
  wElephant = "E",
  wCrow = "C",
  wMonke = "M",
  wQueen = "Q",
  wFishQueen = "F",
  wKingWithBanana = "K",
  wKingNoBanana = "L",
  bPawn = "p",
  bElephant = "e",
  bCrow = "c",
  bMonke = "m",
  bQueen = "q",
  bFishQueen = "f",
  bKingWithBanana = "l",
  Bear = "B",
  Empty = ".",
}

export function isWhite(piece: Piece) {
  return piece.length > 0 && piece === piece.toUpperCase();
}

export function isBlack(piece: Piece) {
  return piece.length > 0 && piece === piece.toUpperCase();
}
