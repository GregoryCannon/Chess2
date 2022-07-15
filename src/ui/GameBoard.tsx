import React from "react";
import "./GameBoard.css";
import { BOARD_HEIGHT, BOARD_SIZE, BOARD_WIDTH } from "../data/config";
import { Board, Cell, Piece } from "../data/constants";
import {
  BEAR_CELL,
  boardGet,
  encodeCell,
  getCol,
  getRow,
  WHITE_KING_JAIL,
  WHITE_QUEEN_JAIL,
  BLACK_KING_JAIL,
  BLACK_QUEEN_JAIL,
} from "../calculation/board_functions";

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
  [Piece.bKing, "bKing"],
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
  tertiaryHighlightedCells: Set<Cell>;
  quaternaryHighlightedCells: Set<Cell>;
  isWhite: boolean;
};

export function GameBoard(props: Props) {
  function getHighlightClass(props: Props, cell: Cell): string {
    if (props.selectedCell === cell) {
      return "primary-highlighted ";
    } else if (props.secondaryHighlightedCells.has(cell)) {
      return "secondary-highlighted ";
    } else if (
      props.quaternaryHighlightedCells.has(cell) &&
      props.tertiaryHighlightedCells.has(cell)
    ) {
      return "tert-and-quat-highlighted ";
    } else if (props.quaternaryHighlightedCells.has(cell)) {
      return "quaternary-highlighted ";
    } else if (props.tertiaryHighlightedCells.has(cell)) {
      return "tertiary-highlighted ";
    }
    return "";
  }

  /** Render the contents of one cell based on its coordinates */
  function renderCell(props: Props, cell: Cell): any {
    const cellContents = boardGet(props.board, cell);
    let innerCellClasses = "highlight-layer " + getHighlightClass(props, cell);

    let outerCellClasses;
    if (cell < BOARD_SIZE) {
      // Main board
      const row = getRow(cell);
      const col = getCol(cell);
      outerCellClasses =
        (row + col) % 2 === 0 ? "board-square white" : "board-square black";
    } else if (cell < BOARD_SIZE + 4) {
      // Jail cell
      outerCellClasses = "board-square jail";
    } else {
      // Bear cell
      outerCellClasses = "";
    }
    return (
      <div
        className={outerCellClasses}
        key={cell}
        onClick={() => {
          props.onCellClicked(cell);
        }}
      >
        <div className={innerCellClasses}>
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

  const indices = [0, 1, 2, 3, 4, 5, 6, 7];
  const fileNames = ["a", "b", "c", "d", "e", "f", "g", "h"];
  if (!props.isWhite) {
    indices.reverse();
    fileNames.reverse();
  }

  /**
   * return the whole game board, with row/col labels
   */
  return (
    <div className="game-board-container">
      <div className="game-board">
        {/* Loop through rows */}
        {indices.map((rowIndex) => (
          <div className="board-row" key={rowIndex}>
            {/* Maybe left jail */}
            {rowIndex === 3 ? (
              renderCell(props, WHITE_QUEEN_JAIL)
            ) : rowIndex === 4 ? (
              renderCell(props, WHITE_KING_JAIL)
            ) : (
              <div className="jail-spacer"></div>
            )}

            {/* File label */}
            <div className="label-vertical">{BOARD_HEIGHT - rowIndex}</div>

            {/* Loop through columns */}
            {indices.map((colIndex) =>
              renderCell(props, encodeCell(rowIndex, colIndex))
            )}

            {/* Dummy label just used as a spacer */}
            <div className="label-vertical">{}</div>

            {/* Maybe right jail */}
            {rowIndex === 3 ? (
              renderCell(props, BLACK_QUEEN_JAIL)
            ) : rowIndex === 4 ? (
              renderCell(props, BLACK_KING_JAIL)
            ) : (
              <div className="jail-spacer"></div>
            )}
          </div>
        ))}
        <div className="label-row">
          <div className="jail-spacer"></div>
          <div className="label-vertical"></div>
          {fileNames.slice(0, BOARD_WIDTH).map((val) => (
            <div className="label-horizontal" key={val}>
              {val}
            </div>
          ))}
        </div>
      </div>

      {boardGet(props.board, BEAR_CELL) === Piece.Bear && (
        <img
          className={"bear-cell " + getHighlightClass(props, BEAR_CELL)}
          src="/piece-assets/Bear.png"
          onClick={() => {
            props.onCellClicked(BEAR_CELL);
          }}
        ></img>
      )}
    </div>
  );
}

export default GameBoard;
