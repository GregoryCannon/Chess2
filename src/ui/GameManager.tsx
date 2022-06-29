import React from "react";
import { getBoardAfterMove } from "../calculation/board_functions";
import {
  convertMoveListToMoveMap,
  generatePossibleMoves,
} from "../calculation/move_calculator";
import {
  Cell,
  GameState,
  Move,
  MoveMap,
  StartState,
  TurnState,
} from "../contants";

export class GameManager extends React.Component<
  {},
  {
    turnState: TurnState;
    gameStateHistory: Array<GameState>;
    gameState: GameState;
    moveMap?: MoveMap;
    selectedCell?: number;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      gameStateHistory: [],
      gameState: StartState,
      turnState: TurnState.NotStarted,
      moveMap: undefined,
      selectedCell: undefined,
    };

    this.onCellClicked = this.onCellClicked.bind(this);
    this.restart = this.restart.bind(this);
    this.stopGame = this.stopGame.bind(this);
  }

  restart() {
    this.setState({
      gameState: StartState,
      gameStateHistory: [],
      turnState: TurnState.NotStarted,
      moveMap: undefined,
    });
  }

  makeMove(move: Move) {
    const current = this.state.gameState;

    // Get the new board, visitedStates and turnState
    let nextTurnState = current.whiteToMove
      ? TurnState.BlackTurn
      : TurnState.WhiteTurn;
    const nextGameState = {
      board: getBoardAfterMove(move, current.board),
      whiteToMove: !this.state.gameState.whiteToMove,
      crowsActive: false,
    };

    const nextMoveList = generatePossibleMoves(nextGameState);

    // // Check for game-over conditions
    // const [gameIsOver, score, gameOverTurnState] = checkForGameOver(
    //   nextBoard,
    //   nextTurnState === TurnState.WhiteTurn,
    //   nextVisitedStates,
    //   nextMoveList
    // );
    // if (gameIsOver) {
    //   nextTurnState = gameOverTurnState;
    // }

    // Compile the new state object=
    const nextState = {
      selectedCell: undefined,
      turnState: nextTurnState,
      moveMap: convertMoveListToMoveMap(nextMoveList),
    };

    // Advance the turn and let AI make the next move
    this.setState(nextState);
  }

  /* ------------------------
        USER INTERACTION
     ----------------------- */

  onCellClicked(clickCell: Cell) {
    if (
      this.state.turnState !== TurnState.BlackTurn &&
      this.state.turnState !== TurnState.WhiteTurn
    ) {
      return;
    }

    if (this.state.selectedCell) {
      const startCell = this.state.selectedCell;
      // If clicked on selected piece, de-select it
      if (clickCell === startCell) {
        this.setState({ selectedCell: undefined });
        return;
      }

      // Otherwise, attempt to move the piece there
      if (
        true ||
        (this.getMovablePieces().has(startCell) &&
          this.getLegalDestinations().has(clickCell))
      ) {
        this.makeMove({ start: startCell, end: clickCell });
        return;
      }
    }

    // Otherwise, select the square that was clicked (if the piece is movable)
    if (this.getMovablePieces().has(clickCell)) {
      this.setState({ selectedCell: clickCell });
    }
  }

  /** Find all locations where a legal move can end. */
  getLegalDestinations(): Set<Cell> {
    if (!this.state.selectedCell || !this.state.moveMap) {
      return new Set();
    }
    return this.state.moveMap.get(this.state.selectedCell) || new Set();
  }

  /** Find all locations where a legal move can start. */
  getMovablePieces() {
    return new Set(this.state.moveMap?.keys());
  }

  /** Halt the current game. At the moment, the game cannot be resumed, only restarted. */
  stopGame() {
    this.setState({
      turnState: TurnState.NotStarted,
    });
  }

  render() {
    return (
      // <GameRenderer
      //   board={this.state.board}
      //   turnState={this.state.turnState}
      //   turnCount={this.state.turnCount}
      //   visitedStates={this.state.visitedStates}
      //   movablePieces={this.getMovablePieces()}
      //   legalDestinations={this.getLegalDestinations()}
      //   stopGameFunction={this.stopGame}
      //   restartFunction={this.restart}
      //   onCellClickedFunction={this.onCellClicked}
      //   selectedCell={this.state.selectedCell}
      //   positionEval={this.state.positionEval}
      //   bestLine={this.state.bestLine}
      // />
      <div>The game renderer will go here.</div>
    );
  }
}

export default GameManager;
