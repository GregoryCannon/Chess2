import { GameState, Move, MoveMap } from "../data/constants";

export function generatePossibleMoves(gameState: GameState): Array<Move> {
  return [];
}

/**
 * Convert a list of moves to a movement map, which maps the starting locations to the list of possible end locations.
 * NB: The keys and values are --formatted-- locations, to avoid the problem of array equality.
 */
export function convertMoveListToMoveMap(moveList: Move[]): MoveMap {
  const map = new Map();
  for (const move of moveList) {
    if (!map.has(move.start)) {
      map.set(move.start, new Map());
    }
    map.get(move.start).add(move.end);
  }
  return map;
}
