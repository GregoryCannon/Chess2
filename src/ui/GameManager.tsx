import React from "react";
import {
  boardGet,
  boardSet,
  getBoardAfterMove,
  WHITE_KING_JAIL,
  WHITE_QUEEN_JAIL,
  BLACK_KING_JAIL,
  BLACK_QUEEN_JAIL,
  BLACK_MONKEY_RESCUE_START_CELL,
  WHITE_MONKEY_RESCUE_START_CELL,
} from "../calculation/board_functions";
import { useParams } from "react-router-dom";
import { getMoveMap } from "../calculation/move_calculator";
import {
  Cell,
  GameState,
  Move,
  MoveMap,
  Piece,
  START_STATE,
  TurnState,
} from "../data/constants";
import { isAllied } from "../calculation/piece_functions";
import { GameRenderer } from "./GameRenderer";
import { IS_PRODUCTION } from "../data/config";
import { checkForGameOver, getStaticEval } from "../calculation/static-eval";
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
    eval?: number;
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
          : "http://localhost:4000"
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
    const pieceAtDestination = boardGet(current.board, move.end);
    const isCapture = isAllied(pieceAtDestination, !current.whiteToMove);

    // If it's the first half of a king rescue, then just animate the monkey and filter the move map for just rescue moves
    const jailCell = this.state.gameState.whiteToMove
      ? WHITE_KING_JAIL
      : BLACK_KING_JAIL;
    const isKingRescuePart1 = move.end === jailCell;
    if (isKingRescuePart1) {
      console.log("DOING RESCUE PART 1");
      const nextGameState = {
        board: getBoardAfterMove(move, current.board),
        whiteToMove: this.state.gameState.whiteToMove, // Turn is NOT passed to the other player in this case
        crowsActive: false,
        lastMove: move,
      };
      const nextMoveMap = new Map();
      nextMoveMap.set(jailCell, new Set());
      this.state.moveMap.get(move.start).forEach((x) => {
        if (x >= 100) {
          nextMoveMap.get(jailCell).add(x - 100);
        }
      });
      const nextState = {
        selectedCell: move.end,
        gameState: nextGameState,
        moveMap: nextMoveMap,
      };
      this.setState(nextState);
      return;
    }

    const isKingRescuePart2 = move.start === jailCell;
    console.log(
      "Making move... is rescue pt2",
      isKingRescuePart2,
      move.start,
      WHITE_KING_JAIL,
      BLACK_KING_JAIL
    );

    // Get the new board, visitedStates and turnState
    let nextTurnState = current.whiteToMove
      ? TurnState.BlackTurn
      : TurnState.WhiteTurn;
    const nextGameState = {
      board: getBoardAfterMove(move, current.board),
      whiteToMove: !this.state.gameState.whiteToMove,
      crowsActive: isCapture,
      lastMove: move,
    };

    // Add royal pieces to graveyard
    switch (pieceAtDestination) {
      case Piece.wQueen:
        nextGameState.board = boardSet(
          nextGameState.board,
          WHITE_QUEEN_JAIL,
          Piece.wQueen
        );
        break;
      case Piece.wKingWithBanana:
        nextGameState.board = boardSet(
          nextGameState.board,
          WHITE_KING_JAIL,
          Piece.wKingWithBanana
        );
        break;
      case Piece.wKing:
        nextGameState.board = boardSet(
          nextGameState.board,
          WHITE_KING_JAIL,
          Piece.wKing
        );
        break;
      case Piece.bQueen:
        nextGameState.board = boardSet(
          nextGameState.board,
          BLACK_QUEEN_JAIL,
          Piece.bQueen
        );
        console.log(nextGameState.board);
        break;
      case Piece.bKingWithBanana:
        nextGameState.board = boardSet(
          nextGameState.board,
          BLACK_KING_JAIL,
          Piece.bKingWithBanana
        );
        break;
      case Piece.bKing:
        nextGameState.board = boardSet(
          nextGameState.board,
          BLACK_KING_JAIL,
          Piece.bKing
        );
        break;
    }

    // Maybe revive king
    if (isKingRescuePart2) {
      console.log("DOING RESCUE PART 2");
      if (this.state.gameState.whiteToMove) {
        nextGameState.board = boardSet(
          nextGameState.board,
          WHITE_KING_JAIL,
          Piece.Empty
        );
        nextGameState.board = boardSet(
          nextGameState.board,
          WHITE_MONKEY_RESCUE_START_CELL,
          Piece.wKing
        );
      } else {
        nextGameState.board = boardSet(
          nextGameState.board,
          BLACK_KING_JAIL,
          Piece.Empty
        );
        nextGameState.board = boardSet(
          nextGameState.board,
          BLACK_MONKEY_RESCUE_START_CELL,
          Piece.bKing
        );
      }
    }

    let nextMoveMap = getMoveMap(nextGameState);
    console.log(nextMoveMap);

    // // Check for game-over conditions
    // const [gameIsOver, _score, _gameResult] = checkForGameOver(
    //   nextGameState,
    //   nextMoveMap
    // );
    // if (gameIsOver) {
    //   nextTurnState = TurnState.GameOver;
    //   nextMoveMap = new Map();
    // }

    // Compile the new state object
    this.state.gameStateHistory.push(nextGameState);
    const nextState = {
      selectedCell: undefined,
      gameState: nextGameState,
      turnState: nextTurnState,
      moveMap: nextMoveMap,
      eval: getStaticEval(nextGameState),
    };

    // Advance the turn
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
      // const canRescueKing = this.state.moveMap
      //   .get(startCell)
      //   .has(clickCell + 100);
      // if (this.state.moveMap.get(startCell).has(clickCell) || canRescueKing) {
      //   const move = {
      //     start: startCell,
      //     end: clickCell + (canRescueKing ? 100 : 0),
      //   };
      //   this.makeMove(move);
      //   if (this.props.online) {
      //     this.sendMove(move);
      //   }
      //   return;
      // }

      if (this.getLegalDestinations().has(clickCell)) {
        const move = {
          start: startCell,
          end: clickCell,
        };
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
    const result: Set<Cell> = new Set();
    this.state.moveMap.get(this.state.selectedCell).forEach((x) => {
      if (x >= 100) {
        // Add the king rescue square
        result.add(
          this.state.gameState.whiteToMove ? WHITE_KING_JAIL : BLACK_KING_JAIL
        );
      } else {
        result.add(x);
      }
    });
    return result;
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
      return this.getLegalDestinations();
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

  getQuaternaryHighlightedCells(): Set<Cell> {
    if (!this.state.gameState.lastMove || this.state.selectedCell) {
      return new Set();
    }
    const result: Set<Cell> = new Set();
    const lastMove = this.state.gameState.lastMove;
    result.add(lastMove.start);
    result.add(lastMove.end);
    if (lastMove.start === WHITE_KING_JAIL) {
      result.add(WHITE_MONKEY_RESCUE_START_CELL);
    } else if (lastMove.start === BLACK_KING_JAIL) {
      result.add(BLACK_MONKEY_RESCUE_START_CELL);
    }
    return result;
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
        quaternaryHighlightedCells={this.getQuaternaryHighlightedCells()}
        stopGameFunction={this.stopGame}
        restartFunction={this.restart}
        onCellClickedFunction={this.onCellClicked}
        selectedCell={this.state.selectedCell}
        chatMessages={this.state.chatMessages}
        chatFunction={this.sendChatMessage}
        positionEval={this.state.eval}
        isWhite={!this.props.online || this.playerColorRef.current === "white"}
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
