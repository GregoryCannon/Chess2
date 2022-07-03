import { BOARD_HEIGHT, BOARD_SIZE, BOARD_WIDTH } from "../data/config";
import {
  Board,
  GameResult,
  GameState,
  Move,
  TurnState,
} from "../data/constants";
import { Piece } from "../data/pieces";
import { boardGet, encodeCell } from "./board_functions";
import { generatePossibleMoves } from "./move_calculator";

const WIN_BLACK_VALUE = -1000;
const WIN_WHITE_VALUE = 1000;

/** Checks if the game is over, and if so, returns the base eval score. */
export function checkForGameOver(
  gameState: GameState,
  moveList?: Array<Move>
): [boolean, number, GameResult] {
  // Check for King + Queen dead
  let whiteDead = true;
  let blackDead = true;
  for (let i = 0; i < BOARD_SIZE; i++) {
    const piece = boardGet(gameState.board, i);
    if (piece === Piece.wKing || piece === Piece.wQueen) {
      whiteDead = false;
    }
    if (piece === Piece.bKing || piece === Piece.bQueen) {
      blackDead = false;
    }
  }
  if (whiteDead) {
    return [true, WIN_BLACK_VALUE, GameResult.BlackWin];
  } else if (blackDead) {
    return [true, WIN_WHITE_VALUE, GameResult.WhiteWin];
  }

  // Get move list if not provided
  if (moveList === undefined) {
    moveList = generatePossibleMoves(gameState);
  }

  // Check for game over by checkmate or stalemate
  if (moveList.length === 0) {
    return [true, 0, GameResult.Draw];
  }

  // // Check for draw by repetition
  // if (isDrawByRepetition(board, visitedStates)) {
  //   return [true, 0, TurnState.DrawRepetition];
  // }

  // // Check for insufficient material
  // if (
  //   isInsufficientMaterial(board, /* isWhite= */ true) &&
  //   isInsufficientMaterial(board, /* isWhite= */ false)
  // ) {
  //   return [true, 0, TurnState.DrawMaterial];
  // }

  // Otherwise, not game over
  return [false, 0, GameResult.None];
}

function getValueOfPiece(piece: Piece) {
  switch (piece) {
    case Piece.Bear:
      return 0;
    case Piece.wPawn:
      return 1;
    case Piece.bPawn:
      return -1;
    case Piece.wElephant:
      return 0.6;
    case Piece.bElephant:
      return -0.6;
    case Piece.wCrow:
      return 1.1;
    case Piece.bCrow:
      return -1.1;
    case Piece.wQueen:
    case Piece.wFishQueen:
      return 8;
    case Piece.bQueen:
    case Piece.bFishQueen:
      return -8;
    case Piece.wKing:
      return 4;
    case Piece.bKing:
      return -4;
    case Piece.wMonke:
      return 6;
    case Piece.bMonke:
      return -6;
    default:
      throw Error("Requested value of unknown piece" + piece);
  }
}

export function getStaticEval(gameState: GameState) {
  let score = 0;
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    for (let c = 0; c < BOARD_WIDTH; c++) {
      const cell = encodeCell(r, c);
      const piece = boardGet(gameState.board, cell);
      if (piece !== Piece.Empty) {
        score += getValueOfPiece(piece);
      }

      /* ----- Other custom factors ----- */

      // Reward pushed pawns
      if (piece === Piece.wPawn) {
        score += 0.05 * (BOARD_HEIGHT - 2 - r);
      } else if (piece === Piece.bPawn) {
        score -= 0.05 * (r - 1);
      }
    }
  }
  return score;
}
