import React from "react";
import { boardGet, getBoardAfterMove } from "../calculation/board_functions";
import { useParams } from "react-router-dom";
import { getMoveMap } from "../calculation/move_calculator";
import {
  Cell,
  GameState,
  Move,
  MoveMap,
  START_STATE,
  TurnState,
} from "../data/constants";
import { isAllied } from "../calculation/piece_functions";
import { GameRenderer } from "./GameRenderer";
import { IS_PRODUCTION } from "../data/config";
const { io } = require("socket.io-client");

export class GameManager extends React.Component<
  { params: any; online: boolean },
  {
    waitingOnJoin: boolean;
    turnState: TurnState;
    gameStateHistory: GameState[];
    gameState: GameState;
    chatMessages: string[];
    moveMap?: MoveMap;
    selectedCell?: number;
  }
> {
  socketRef: any;
  lobbyIdRef: any;
  playerColorRef: any;
  constructor(props: any) {
    super(props);
    this.state = {
      waitingOnJoin: props.online,
      gameStateHistory: [START_STATE],
      gameState: START_STATE,
      turnState: TurnState.WhiteTurn,
      moveMap: getMoveMap(START_STATE),
      selectedCell: undefined,
      chatMessages: [],
    };
    this.socketRef = React.createRef();
    this.lobbyIdRef = React.createRef();
    this.playerColorRef = React.createRef();

    // Get the lobby ID from URL params
    console.log("PARAMS:", props.params.lobbyId);
    this.lobbyIdRef.current = props.params.lobbyId;

    this.onCellClicked = this.onCellClicked.bind(this);
    this.restart = this.restart.bind(this);
    this.makeMove = this.makeMove.bind(this);
    this.sendChatMessage = this.sendChatMessage.bind(this);
    this.sendHeartbeat = this.sendHeartbeat.bind(this);
  }

  componentDidMount() {
    if (this.props.online) {
      this.setupWebSockets();
    }
  }

  restart() {
    console.log("RESTART");
    this.setState({
      gameStateHistory: [START_STATE],
      gameState: START_STATE,
      turnState: TurnState.WhiteTurn,
      moveMap: getMoveMap(START_STATE),
      selectedCell: undefined,
    });
  }

  setupWebSockets() {
    // Handle socket setup
    if (!this.socketRef.current) {
      const socket = io(
        IS_PRODUCTION
          ? "https://chesstwo.herokuapp.com"
          : "http://localhost:3000"
      );
      this.socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected to server!", socket.id);
        socket.emit("send-message", "My ID is " + socket.id, "");
        socket.emit("join-lobby", this.lobbyIdRef.current);
        console.log("Tried to join lobby", this.lobbyIdRef.current);
      });

      socket.on("lobby-message", (msg: string) => {
        console.log("GOT CHAT MESSAGE", msg, this.state.gameState.board);
        this.setState({ chatMessages: this.state.chatMessages.concat(msg) });
      });

      socket.on("join-success", (playerColor: string) => {
        console.log("JOIN SUCCESS", playerColor);
        this.playerColorRef.current = playerColor;
        this.setState({ waitingOnJoin: false });
      });

      socket.on("lobby-move", (move: Move, playerId: string) => {
        console.log("lobby move", move, playerId, this.socketRef.current.id);
        if (playerId !== this.socketRef.current.id) {
          this.makeMove(move);
        }
      });
    }

    this.sendHeartbeat();
  }

  sendHeartbeat() {
    this.socketRef.current.emit("heartbeat", this.lobbyIdRef.current);
    setTimeout(this.sendHeartbeat, 10000);
  }

  makeMove(move: Move) {
    const current = this.state.gameState;
    const isCapture = isAllied(
      boardGet(current.board, move.end),
      !current.whiteToMove
    );

    // Get the new board, visitedStates and turnState
    let nextTurnState = current.whiteToMove
      ? TurnState.BlackTurn
      : TurnState.WhiteTurn;
    const nextGameState = {
      board: getBoardAfterMove(move, current.board),
      whiteToMove: !this.state.gameState.whiteToMove,
      crowsActive: isCapture,
    };

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

    // Compile the new state object
    this.state.gameStateHistory.push(nextGameState);
    const nextState = {
      selectedCell: undefined,
      gameState: nextGameState,
      turnState: nextTurnState,
      moveMap: getMoveMap(nextGameState),
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
    if (!this.isMyTurn()) {
      return;
    }

    if (this.state.selectedCell !== undefined) {
      const startCell = this.state.selectedCell;
      // If clicked on selected piece, de-select it
      if (clickCell === startCell) {
        this.setState({ selectedCell: undefined });
        return;
      }

      // Otherwise, attempt to move the piece there
      if (this.state.moveMap.get(startCell).has(clickCell)) {
        const move = { start: startCell, end: clickCell };
        this.makeMove(move);
        if (this.props.online) {
          this.sendMove(move);
        }
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
    if (this.state.selectedCell === undefined || !this.state.moveMap) {
      return new Set();
    }
    return this.state.moveMap.get(this.state.selectedCell) || new Set();
  }

  /** Find all locations where a legal move can start. */
  getMovablePieces(): Set<Cell> {
    // No highlighted cells when it's not your turn
    if (!this.isMyTurn()) {
      return new Set();
    }

    return new Set(this.state.moveMap?.keys());
  }

  getSemiHighlightedCells(): Set<Cell> {
    if (this.state.selectedCell) {
      // Return all the cells that the selected piece can move to
      return this.state.moveMap.get(this.state.selectedCell) || new Set();
    } else {
      // Return all the pieces that have legal moves
      return this.getMovablePieces();
    }
  }

  getTertiaryHighlightedCells(): Set<Cell> {
    // return new Set();
    if (!this.state.selectedCell) {
      let fullSet: Set<Cell> = new Set();
      this.state.moveMap.forEach((x) => {
        x.forEach((y) => {
          if (
            isAllied(
              boardGet(this.state.gameState.board, y),
              !this.state.gameState.whiteToMove
            )
          ) {
            fullSet.add(y);
          }
        });
      });
      return fullSet;
    }
    return new Set();
  }

  isMyTurn() {
    // In a local game, it's always someone's turn on this client
    if (!this.props.online) {
      return true;
    }
    return (
      (this.state.turnState === TurnState.WhiteTurn &&
        this.playerColorRef.current === "white") ||
      (this.state.turnState === TurnState.BlackTurn &&
        this.playerColorRef.current === "black")
    );
  }

  /** Halt the current game. At the moment, the game cannot be resumed, only restarted. */
  stopGame() {
    this.setState({
      turnState: TurnState.NotStarted,
    });
  }

  sendMove(move: Move) {
    this.socketRef.current.emit("send-move", move, this.lobbyIdRef.current);
  }

  sendChatMessage(message: string) {
    if (this.props.online) {
      this.socketRef.current.emit(
        "send-message",
        message,
        this.lobbyIdRef.current
      );
    }
  }

  render() {
    return this.state.waitingOnJoin ? (
      <div>Loading...</div>
    ) : (
      <GameRenderer
        board={this.state.gameState.board}
        turnState={this.state.turnState}
        semiHighlightedCells={this.getSemiHighlightedCells()}
        tertiaryHighlightedCells={this.getTertiaryHighlightedCells()}
        stopGameFunction={this.stopGame}
        restartFunction={this.restart}
        onCellClickedFunction={this.onCellClicked}
        selectedCell={this.state.selectedCell}
        chatMessages={this.state.chatMessages}
        chatFunction={this.sendChatMessage}
        isWhite={!this.props.online || this.playerColorRef.current == "white"}
        {...this.props}
      />
    );
  }
}

export const withRouter = (Component: any) => {
  const Wrapper = (props: any) => {
    const params = useParams();

    return <Component params={params} {...props} />;
  };

  return Wrapper;
};

export const WrappedGameManager = withRouter(GameManager);
