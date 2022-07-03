import { Board, Cell, TurnState } from "../data/constants";
import { GameBoard } from "./GameBoard";
import React from "react";

// function convertEvalToBarPercentage(positionEval?: number) {
//   if (positionEval === undefined) {
//     return 0;
//   }
//   // Use a logistic model, such that small advantages (e.g. +3, -2) are weighted heavily, then it tapers off towards 100% or 0%.
//   const steepnessMultiplier = 0.3;
//   return 100 / (1 + Math.pow(Math.E, -1 * positionEval * steepnessMultiplier));
// }

// function getEvalLabelText(positionEval?: number) {
//   if (positionEval === undefined) {
//     return "";
//   }
//   return positionEval?.toFixed(2);
//   // return positionEval >= WIN_WHITE_VALUE / 10 ||
//   //   positionEval <= WIN_BLACK_VALUE / 10
//   //   ? "Forced Mate"
//   //   : positionEval?.toFixed(2);
// }

function getStatusMessage(turnState: TurnState) {
  switch (turnState) {
    case TurnState.NotStarted:
      return "Click Start to start a new game!";
    case TurnState.GameOver:
      return "Game over.";
    case TurnState.WhiteTurn:
      return "White's turn.";
    case TurnState.BlackTurn:
      return "Black's turn.";
  }
}

export function GameRenderer(props: {
  board: Board;
  turnState: TurnState;
  semiHighlightedCells: Set<Cell>;
  tertiaryHighlightedCells: Set<Cell>;
  stopGameFunction: Function;
  restartFunction: Function;
  onCellClickedFunction: Function;
  selectedCell?: Cell;
  chatMessages: String[];
  chatFunction: Function;
  online: boolean;
  isWhite: boolean;
}) {
  // const evalPercentage = convertEvalToBarPercentage(props.positionEval);
  // const evalLabelText = getEvalLabelText(props.positionEval);

  return (
    <div className="GameManager">
      <div className="top-section">
        <h3>{getStatusMessage(props.turnState)}</h3>
        {/* <div
          className="eval-bar-container"
          style={{
            visibility: props.positionEval === undefined ? "hidden" : "visible",
          }}
        >
          <div className="eval-text-container">
            <div className="eval-text">{evalLabelText}</div>
          </div>
          <div
            className="eval-bar"
            style={{ width: evalPercentage + "%" }}
          ></div>
        </div>
        <div className="eval-computer-line">{props.bestLine}</div> */}
      </div>
      <div className="game-board-container">
        <GameBoard
          onCellClicked={props.onCellClickedFunction}
          selectedCell={props.selectedCell}
          secondaryHighlightedCells={props.semiHighlightedCells}
          tertiaryHighlightedCells={props.tertiaryHighlightedCells}
          board={props.board}
          isWhite={props.isWhite}
        />
      </div>
      <button onClick={() => props.restartFunction()}>
        {props.turnState === TurnState.WhiteTurn ||
        props.turnState === TurnState.BlackTurn
          ? "Restart"
          : "Start!"}
      </button>
      {props.online && (
        <React.Fragment>
          <button onClick={() => props.chatFunction("Hello!")}>
            Say hi in chat
          </button>
          <div className="Chat-Container">
            <h3>In-Game Chat</h3>
            {props.chatMessages.map((message, i) => (
              <div className="Chat-Row" key={i}>
                {message}
              </div>
            ))}
          </div>
        </React.Fragment>
      )}

      {/* <button onClick={() => props.stopGameFunction()}>Stop</button> */}
    </div>
  );
}
