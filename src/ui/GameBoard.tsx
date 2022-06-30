import React from "react";
import "./GameBoard.css";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../data/config";
import { Board, Cell } from "../data/constants";
import { boardGet, encodeCell } from "../calculation/board_functions";
import { Piece } from "../data/pieces";

function cellIsSelected(
  rowIndex: number,
  colIndex: number,
  selectedCell?: Cell
): boolean {
  return selectedCell === encodeCell(rowIndex, colIndex);
}

// wPawn = "P",
//   wElephant = "E",
//   wCrow = "C",
//   wMonke = "M",
//   wQueen = "Q",
//   wFishQueen = "F",
//   wKingWithBanana = "K",
//   wKing = "L",
//   bPawn = "p",
//   bElephant = "e",
//   bCrow = "c",
//   bMonke = "m",
//   bQueen = "q",
//   bFishQueen = "f",
//   bKingWithBanana = "k",
//   bKing = "l",
//   Bear = "B",
//   Empty = ".",

const PIECE_IMAGES = new Map([
  [Piece.wPawn, "wPawn"],
  [Piece.wElephant, "wElephant"],
  [Piece.wCrow, "wCrow"],
  [Piece.wMonke, "wMonke"],
  [Piece.wQueen, "wQueen"],
  [Piece.wFishQueen, "wFishQueen"],
  [Piece.wKingWithBanana, "wKing"],
  [Piece.wKing, "wKing"],
  [Piece.bPawn, "bPawn"],
  [Piece.bElephant, "bElephant"],
  [Piece.bCrow, "bCrow"],
  [Piece.bMonke, "bMonke"],
  [Piece.bQueen, "bQueen"],
  [Piece.bFishQueen, "bFishQueen"],
  [Piece.bKingWithBanana, "bKing"],
  [Piece.wKing, "bKing"],
  [Piece.Bear, "Bear"],
]);

function getImageForPiece(piece: Piece): string {
  return `/piece-assets/${PIECE_IMAGES.get(piece)}.png`;
}

// function getAltTextForPiece(piece: Piece): string {
//   switch (piece) {
//     case Piece.KingBlack:
//       return "BlackKing.png";
//     case Piece.QueenBlack:
//       return "BlackQueen.png";
//     case Piece.RookBlack:
//       return "BlackRook.png";
//     case Piece.BishopBlack:
//       return "BlackBishop.png";
//     case Piece.KnightBlack:
//       return "BlackKnight.png";
//     case Piece.PawnBlack:
//       return "BlackPawn.png";
//     case Piece.KingWhite:
//       return "WhiteKing.png";
//     case Piece.QueenWhite:
//       return "WhiteQueen.png";
//     case Piece.RookWhite:
//       return "WhiteRook.png";
//     case Piece.BishopWhite:
//       return "WhiteBishop.png";
//     case Piece.KnightWhite:
//       return "WhiteKnight.png";
//     case Piece.PawnWhite:
//       return "WhitePawn.png";
//   }
// }

type Props = {
  board: Board;
  onCellClicked: Function;
  selectedCell?: Cell;
  secondaryHighlightedCells: Set<Cell>;
};

export function GameBoard(props: Props) {
  /** Render the contents of one cell based on its coordinates */
  function renderCell(props: Props, row: number, col: number): any {
    const cell = encodeCell(row, col);
    const cellContents = boardGet(props.board, cell);
    return (
      <div
        className={
          (row + col) % 2 === 0 ? "board-square white" : "board-square black"
        }
        key={row + "," + col}
        onClick={() => {
          props.onCellClicked(encodeCell(row, col));
        }}
      >
        <div
          className={
            cellIsSelected(row, col, props.selectedCell)
              ? "highlight-layer primary-highlighted"
              : props.secondaryHighlightedCells.has(cell)
              ? "highlight-layer secondary-highlighted"
              : "highlight-layer"
          }
        >
          {cellContents && cellContents !== Piece.Empty && (
            <img
              className="contents"
              src={getImageForPiece(cellContents)}
            ></img>
          )}
        </div>
      </div>
    );
  }

  /**
   * return the whole game board, with row/col labels
   */
  return (
    <div className="game-board">
      {/* Loop through rows */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((rowIndex) => (
        <div className="board-row" key={rowIndex}>
          {/* File label */}
          <div className="label-vertical">{BOARD_HEIGHT - rowIndex}</div>

          {/* Loop through columns */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((colIndex) =>
            renderCell(props, rowIndex, colIndex)
          )}
        </div>
      ))}
      <div className="label-row">
        <div className="label-vertical"></div>
        {["a", "b", "c", "d", "e", "f", "g", "h"]
          .slice(0, BOARD_WIDTH)
          .map((val) => (
            <div className="label-horizontal" key={val}>
              {val}
            </div>
          ))}
      </div>
    </div>
  );
}

export default GameBoard;
