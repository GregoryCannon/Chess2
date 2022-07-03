import { Board, Cell, GameState, Move, MoveMap } from "../data/constants";
import { isAllied } from "./piece_functions";
import {
  boardGet,
  encodeCell,
  getCol,
  getRow,
  prettyPrintCell,
} from "./board_functions";
import { BOARD_HEIGHT, BOARD_SIZE, BOARD_WIDTH } from "../data/config";
import { Piece } from "../data/pieces";

const MAIN_8_DIRECTIONS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

export function generatePossibleMoves(gameState: GameState): Array<Move> {
  let moveList = [];

  for (let startCell = 0; startCell < BOARD_SIZE; startCell++) {
    const piece = boardGet(gameState.board, startCell);
    if (isAllied(piece, gameState.whiteToMove)) {
      // Move search
      switch (piece) {
        case Piece.wPawn:
        case Piece.bPawn:
          _pawnMoveSearch(gameState, startCell, moveList);
          break;
        case Piece.wElephant:
        case Piece.bElephant:
          _elephantMoveSearch(gameState, startCell, moveList);
          break;
        case Piece.wMonke:
        case Piece.bMonke:
          _monkeMoveSearch(gameState, startCell, moveList);
          break;
        case Piece.wKing:
        case Piece.bKing:
        case Piece.wKingWithBanana:
        case Piece.bKingWithBanana:
          _kingMoveSearch(gameState, startCell, moveList);
          break;
        case Piece.wCrow:
        case Piece.bCrow:
          _ravenMoveSearch(gameState, startCell, moveList);
          break;
        case Piece.wQueen:
        case Piece.bQueen:
        case Piece.wFishQueen:
        case Piece.bFishQueen:
          _queenMoveSearch(gameState, startCell, moveList);
          break;
      }
    }
  }

  return moveList;
}

/**
 * Checks if the target square is available for a move or capture,
 * and if so, adds that move to the running list (in-place).
 */
function _moveOrTake(
  board,
  start,
  endRow,
  endCol,
  whiteToMove,
  moveList: Move[]
) {
  if (
    endRow < 0 ||
    endRow >= BOARD_HEIGHT ||
    endCol < 0 ||
    endCol >= BOARD_WIDTH
  ) {
    return false;
  }
  const end = encodeCell(endRow, endCol);
  if (!isAllied(boardGet(board, end), whiteToMove)) {
    moveList.push({ start, end });
    return true;
  }
  return false;
}

function _moveOnly(
  board,
  start,
  endRow,
  endCol,
  whiteToMove,
  moveList: Move[]
) {
  if (
    endRow < 0 ||
    endRow >= BOARD_HEIGHT ||
    endCol < 0 ||
    endCol >= BOARD_WIDTH
  ) {
    return false;
  }
  const end = encodeCell(endRow, endCol);
  if (boardGet(board, end) === Piece.Empty) {
    moveList.push({ start, end });
    return true;
  }
  return false;
}

function _takeOnly(
  board,
  start,
  endRow,
  endCol,
  whiteToMove,
  moveList: Move[]
) {
  if (
    endRow < 0 ||
    endRow >= BOARD_HEIGHT ||
    endCol < 0 ||
    endCol >= BOARD_WIDTH
  ) {
    return false;
  }
  const end = encodeCell(endRow, endCol);
  // If allied to the enemy, it's valid to take
  if (isAllied(boardGet(board, end), !whiteToMove)) {
    moveList.push({ start, end });
    return true;
  }
  return false;
}

function _pawnMoveSearch(
  gameState: GameState,
  startCell: Cell,
  moveList: Move[]
) {
  const row = getRow(startCell);
  const col = getCol(startCell);
  const moveYDir = gameState.whiteToMove ? -1 : 1;

  // Maybe move two squares
  if (
    gameState.whiteToMove &&
    row >= 6 &&
    boardGet(gameState.board, startCell - BOARD_WIDTH) === Piece.Empty
  ) {
    _moveOnly(
      gameState.board,
      startCell,
      row - 2,
      col,
      gameState.whiteToMove,
      moveList
    );
  } else if (
    !gameState.whiteToMove &&
    row <= 1 &&
    boardGet(gameState.board, startCell + BOARD_WIDTH) === Piece.Empty
  ) {
    _moveOnly(
      gameState.board,
      startCell,
      row + 2,
      col,
      gameState.whiteToMove,
      moveList
    );
  }

  _moveOrTake(
    gameState.board,
    startCell,
    row + moveYDir,
    col - 1,
    gameState.whiteToMove,
    moveList
  );
  _moveOnly(
    gameState.board,
    startCell,
    row + moveYDir,
    col,
    gameState.whiteToMove,
    moveList
  );
  _moveOrTake(
    gameState.board,
    startCell,
    row + moveYDir,
    col + 1,
    gameState.whiteToMove,
    moveList
  );
  _moveOnly(
    gameState.board,
    startCell,
    row,
    col - 1,
    gameState.whiteToMove,
    moveList
  );
  _moveOnly(
    gameState.board,
    startCell,
    row,
    col + 1,
    gameState.whiteToMove,
    moveList
  );
}

function _elephantMoveSearch(
  gameState: GameState,
  startCell: Cell,
  moveList: Move[]
) {
  const row = getRow(startCell);
  const col = getCol(startCell);

  _moveOrTake(
    gameState.board,
    startCell,
    row + 2,
    col - 2,
    gameState.whiteToMove,
    moveList
  );
  _moveOrTake(
    gameState.board,
    startCell,
    row + 2,
    col + 2,
    gameState.whiteToMove,
    moveList
  );
  _moveOrTake(
    gameState.board,
    startCell,
    row - 2,
    col + 2,
    gameState.whiteToMove,
    moveList
  );
  _moveOrTake(
    gameState.board,
    startCell,
    row - 2,
    col - 2,
    gameState.whiteToMove,
    moveList
  );
}

function _kingMoveSearch(
  gameState: GameState,
  startCell: Cell,
  moveList: Move[]
) {
  const row = getRow(startCell);
  const col = getCol(startCell);

  for (const [rOffset, cOffset] of MAIN_8_DIRECTIONS) {
    _moveOrTake(
      gameState.board,
      startCell,
      row + rOffset,
      col + cOffset,
      gameState.whiteToMove,
      moveList
    );
  }
}

function _monkeMoveSearch(
  gameState: GameState,
  startCell: Cell,
  moveList: Move[]
) {
  _kingMoveSearch(gameState, startCell, moveList);
  _monkeHopMoveSearch(
    gameState.board,
    startCell,
    getRow(startCell),
    getCol(startCell),
    gameState.whiteToMove,
    new Set(),
    moveList
  );
}

function _monkeHopMoveSearch(
  board: Board,
  originalStart: Cell,
  startRow: number,
  startCol: number,
  whiteToMove: boolean,
  visited: Set<Cell>,
  moveList: Move[]
) {
  // Mark this cell as visited
  visited.add(encodeCell(startRow, startCol));

  // Search in every direction it can hop
  for (const [rOffset, cOffset] of MAIN_8_DIRECTIONS) {
    if (
      visited.has(encodeCell(startRow + 2 * rOffset, startCol + 2 * cOffset))
    ) {
      continue;
    }
    if (
      boardGet(board, encodeCell(startRow + rOffset, startCol + cOffset)) !==
      Piece.Empty
    ) {
      const start = encodeCell(startRow, startCol);
      if (
        _moveOnly(
          board,
          originalStart,
          startRow + 2 * rOffset,
          startCol + 2 * cOffset,
          whiteToMove,
          moveList
        )
      ) {
        // Recurse
        _monkeHopMoveSearch(
          board,
          originalStart,
          startRow + 2 * rOffset,
          startCol + 2 * cOffset,
          whiteToMove,
          visited,
          moveList
        );
      } else {
        // Try capturing at the end of the jump sequence
        _takeOnly(
          board,
          originalStart,
          startRow + 2 * rOffset,
          startCol + 2 * cOffset,
          whiteToMove,
          moveList
        );
      }
    }
  }
}

function _ravenMoveSearch(
  gameState: GameState,
  startCell: Cell,
  moveList: Move[]
) {
  const row = getRow(startCell);
  const col = getCol(startCell);

  // Crows can capture in a small area if a friendly piece was captured the previous turn
  if (gameState.crowsActive) {
    _takeOnly(
      gameState.board,
      startCell,
      row,
      col - 1,
      gameState.whiteToMove,
      moveList
    );
    _takeOnly(
      gameState.board,
      startCell,
      row,
      col + 1,
      gameState.whiteToMove,
      moveList
    );
    _takeOnly(
      gameState.board,
      startCell,
      row - 1,
      col,
      gameState.whiteToMove,
      moveList
    );
    _takeOnly(
      gameState.board,
      startCell,
      row + 1,
      col,
      gameState.whiteToMove,
      moveList
    );
  }
  // Otherwise, can move to any open square.
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (boardGet(gameState.board, i) === Piece.Empty) {
      moveList.push({ start: startCell, end: i });
    }
  }
}

function _queenMoveSearch(
  gameState: GameState,
  startCell: Cell,
  moveList: Move[]
) {
  const row = getRow(startCell);
  const col = getCol(startCell);

  for (const [rOffset, cOffset] of MAIN_8_DIRECTIONS) {
    for (let multiplier = 1; multiplier <= 7; multiplier++) {
      // Try moving that far in the specified direction
      const isEmpty = _moveOnly(
        gameState.board,
        startCell,
        row + multiplier * rOffset,
        col + multiplier * cOffset,
        gameState.whiteToMove,
        moveList
      );
      if (!isEmpty) {
        // If it's blocked for the first time, try capturing that
        _takeOnly(
          gameState.board,
          startCell,
          row + multiplier * rOffset,
          col + multiplier * cOffset,
          gameState.whiteToMove,
          moveList
        );
        break;
      }
    }
  }
}

export function getMoveMap(gameState: GameState): MoveMap {
  console.log("Getting move map");
  return convertMoveListToMoveMap(generatePossibleMoves(gameState));
}

/**
 * Convert a list of moves to a movement map, which maps the starting locations to the list of possible end locations.
 * NB: The keys and values are --formatted-- locations, to avoid the problem of array equality.
 */
function convertMoveListToMoveMap(moveList: Move[]): MoveMap {
  const map: MoveMap = new Map();
  for (const move of moveList) {
    if (!map.has(move.start)) {
      map.set(move.start, new Set());
    }
    map.get(move.start).add(move.end);
  }
  return map;
}
