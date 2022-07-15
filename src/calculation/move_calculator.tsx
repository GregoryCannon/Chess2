import {
  Board,
  Cell,
  GameState,
  Move,
  MoveMap,
  Piece,
} from "../data/constants";
import { isAllied } from "./piece_functions";
import {
  BEAR_CELL,
  BLACK_KING_JAIL,
  BLACK_MONKEY_RESCUE_START_CELL,
  boardGet,
  encodeCell,
  getCol,
  getRow,
  prettyPrintCell,
  WHITE_KING_JAIL,
  WHITE_MONKEY_RESCUE_START_CELL,
} from "./board_functions";
import { BOARD_HEIGHT, BOARD_SIZE, BOARD_WIDTH } from "../data/config";

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

  for (let startCell = 0; startCell <= BEAR_CELL; startCell++) {
    // Don't allow jail moves
    if (startCell >= BOARD_SIZE && startCell !== BEAR_CELL) {
      continue;
    }
    // Move search based on the piece at that cel
    const piece = boardGet(gameState.board, startCell);
    if (piece === Piece.Bear) {
      _bearMoveSearch(gameState, startCell, moveList);
    } else if (isAllied(piece, gameState.whiteToMove)) {
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
  if (
    isAllied(boardGet(board, end), !whiteToMove) ||
    boardGet(board, end) === Piece.Bear
  ) {
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
    false,
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
  didRescueKing: boolean,
  visited: Set<Cell>,
  moveList: Move[]
) {
  // Mark this cell as visited
  visited.add(encodeCell(startRow, startCol));

  // Search in every direction it can hop
  for (const [rOffset, cOffset] of MAIN_8_DIRECTIONS) {
    const destination = encodeCell(
      startRow + 2 * rOffset,
      startCol + 2 * cOffset
    );
    if (
      visited.has(destination) &&
      !(didRescueKing && destination === originalStart)
    ) {
      continue;
    }
    const start = encodeCell(startRow, startCol);
    const canJump =
      boardGet(board, encodeCell(startRow + rOffset, startCol + cOffset)) !==
      Piece.Empty;
    const eligibleForKingRescue =
      didRescueKing ||
      (whiteToMove &&
        start === WHITE_MONKEY_RESCUE_START_CELL &&
        boardGet(board, WHITE_KING_JAIL) === Piece.wKingWithBanana) ||
      (!whiteToMove &&
        start === BLACK_MONKEY_RESCUE_START_CELL &&
        boardGet(board, BLACK_KING_JAIL) == Piece.bKingWithBanana);
    console.log(
      "DEBUG",
      eligibleForKingRescue,
      "canJump",
      canJump,
      rOffset,
      cOffset,
      start,
      WHITE_KING_JAIL,
      boardGet(board, WHITE_KING_JAIL),
      BLACK_KING_JAIL,
      boardGet(board, BLACK_KING_JAIL),
      board
    );
    if (canJump) {
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
        // Mark the last move as a king rescue
        if (eligibleForKingRescue) {
          moveList.push({
            start: originalStart,
            end:
              100 + encodeCell(startRow + 2 * rOffset, startCol + 2 * cOffset),
          });
          console.log("FOUND KING RESCUE");
        }
        // Recurse
        _monkeHopMoveSearch(
          board,
          originalStart,
          startRow + 2 * rOffset,
          startCol + 2 * cOffset,
          whiteToMove,
          eligibleForKingRescue,
          visited,
          moveList
        );
      } else {
        // Try capturing at the end of the jump sequence
        const success = _takeOnly(
          board,
          originalStart,
          startRow + 2 * rOffset,
          startCol + 2 * cOffset,
          whiteToMove,
          moveList
        );
        if (success && eligibleForKingRescue) {
          // Mark the last move as a king rescue
          moveList.push({
            start: originalStart,
            end:
              100 + encodeCell(startRow + 2 * rOffset, startCol + 2 * cOffset),
          });
          console.log("FOUND KING RESCUE B");
        }
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

function _bearMoveSearch(
  gameState: GameState,
  startCell: Cell,
  moveList: Move[]
) {
  // Special first move
  if (startCell == BEAR_CELL) {
    for (const endCell of [27, 28, 35, 36]) {
      if (boardGet(gameState.board, endCell) === Piece.Empty) {
        moveList.push({ start: startCell, end: endCell });
      }
    }
    return;
  }

  // Otherwise, it can move like a king
  const row = getRow(startCell);
  const col = getCol(startCell);
  for (const [rOffset, cOffset] of MAIN_8_DIRECTIONS) {
    _moveOnly(
      gameState.board,
      startCell,
      row + rOffset,
      col + cOffset,
      gameState.whiteToMove,
      moveList
    );
  }
}

export function getMoveMap(gameState: GameState): MoveMap {
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
