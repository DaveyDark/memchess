import { HelpCircle, RotateCw, Share } from "react-feather";
import { useSocket } from "../../context/SocketProvider";
import { useGameState } from "../../context/GameStateProvider";
import { Dispatch, SetStateAction, useState } from "react";
import Header from "../Header";

const ControlsOverlay = ({
  setRoomCode,
}: {
  setRoomCode: Dispatch<SetStateAction<string>>;
}) => {
  const socket = useSocket();
  const { setGameState } = useGameState();

  const resetGame = () => {
    socket?.emit("reset_game");
  };

  const leaveRoom = () => {
    setRoomCode("");
    setGameState("waiting");
    socket?.emit("leave_room");
  };

  const help = () => {
    setShowHelp(true);
  };

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="md:absolute right-5 md:top-5 flex gap-2">
      <div
        className="lg:tooltip lg:tooltip-bottom lg:tooltip-secondary"
        data-tip="How to Play"
      >
        <div
          className="flex p-2 md:p-4 rounded-xl bg-primary
            gap-2 cursor-pointer"
          onClick={() => help()}
        >
          <HelpCircle color="white" />
        </div>
      </div>
      <div
        className="lg:tooltip lg:tooltip-bottom lg:tooltip-secondary"
        data-tip="Reset Game"
      >
        <div
          className="flex p-2 md:p-4 rounded-xl bg-primary
            gap-2 cursor-pointer"
          onClick={() => resetGame()}
        >
          <RotateCw color="white" />
        </div>
      </div>
      <div
        className="lg:tooltip lg:tooltip-bottom lg:tooltip-secondary"
        data-tip="Leave Room"
      >
        <div
          className="flex p-2 md:p-4 rounded-xl bg-primary
            gap-2 cursor-pointer"
          onClick={() => leaveRoom()}
        >
          <Share className="rotate-90" color="white" />
        </div>
      </div>
      <dialog id="help_modal" className="modal" open={showHelp}>
        <div className="modal-box w-11/2 max-w-2xl no-scrollbar">
          <Header />
          <h2 className="font-semibold text-xl mt-6 mb-2">Rules</h2>
          <ul className="list-disc list-inside">
            <li>Memchess is a two-player turn-based game.</li>
            <li>
              It combines a game of Chess with an 8x8 Memory game, played
              simultaneously.
            </li>
            <li>
              Each turn consists of a Chess move and an optional Memory move.
              The turn ends after the Chess move.
            </li>
            <li>
              Each Chess piece has a corresponding pair of cards on the Memory
              board, except for the King. When a piece is captured, its
              corresponding cards are removed. When a piece is promoted, its
              corresponding cards change.
            </li>
            <li>
              Matching a pair of cards on the Memory board allows the player to
              optionally remove the corresponding piece on the Chess board, as
              long as it does not break Chess rules.
            </li>
            <li>
              The Memory board contains four wildcards. Wildcards can match with
              any card. Matching two wildcards allows the player to remove any
              piece from the board, except the King.
            </li>
          </ul>
          <h2 className="font-semibold text-xl mt-6 mb-2">Winning the Game</h2>
          <p>The game ends when one of the following conditions is met:</p>
          <ul className="list-disc list-inside">
            <li>A checkmate occurs.</li>
            <li>A stalemate occurs, resulting in a draw.</li>
            <li>
              All pieces of one player, except the King, are eliminated. The
              other player is declared the winner.
            </li>
            <li>
              In timed mode, if a player runs out of time, the other player is
              declared the winner.
            </li>
          </ul>
          <h2 className="font-semibold text-xl mt-6 mb-2">Tips</h2>
          <ul className="list-disc list-inside">
            <li>
              If you know the locations of a pair of cards of your color, you
              can match them without removing a piece to gain an advantage,
              essentially removing the cards for one of your pieces.
            </li>
            <li>
              Strategically match cards to remove an opposing piece that is
              pinning one of your pieces.
            </li>
            <li>
              You can skip the Memory move to let your opponent reveal cards,
              which might be advantageous for you.
            </li>
          </ul>
          <button
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={() => setShowHelp(false)}
          >
            ✕
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default ControlsOverlay;
