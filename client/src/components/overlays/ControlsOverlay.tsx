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
            <li>Memchess is a two-player turn-based game</li>
            <li>
              It consists of a game of Chess and a game of 8x8 Memory played
              simultaneously
            </li>
            <li>
              Each turn consists of a Chess move and a Memory move. The memory
              move is optional, the turn ends after the chess move.
            </li>
            <li>
              Each piece on the board has a corresponding pair of cards on the
              memory board, except for the king. They are destroyed when a piece
              is captured, or changed when a piece is promoted.
            </li>
            <li>
              Matching a pair of cards on the memory board allows the player to
              optionally pick a corresponding piece on the chess board and
              remove it, given that it does not invalidate the chess rules.
            </li>
            <li>
              The memory board contains 4 wildcards, which can be matched with
              any card. Matching two wildcards allows the player to remove any
              piece from the board(except the king).
            </li>
          </ul>
          <h2 className="font-semibold text-xl mt-6 mb-2">Winning the game</h2>
          <p>The game ends when one of the following conditions are met:</p>
          <ul className="list-disc list-inside">
            <li>A checkmate occurs.</li>
            <li>A stalemate occurs. This results in a draw</li>
            <li>
              All pieces of one player, except the king, are eliminated. The
              other player is decalred as the winner.
            </li>
            <li>
              (Only in timed mode) One of the players runs out of time. In this
              case, the other player is declared winner.
            </li>
          </ul>
          <h2 className="font-semibold text-xl mt-6 mb-2">Tips</h2>
          <ul className="list-disc list-inside">
            <li>
              If you know the locations of a pair of cards of your color, you
              can match them but not remove any piece to gain an advantage and
              essentially removing the cards for one of your pieces.
            </li>
            <li>
              You can stratigically match cards to remove an opposing piece
              pinning one of your pieces.
            </li>
            <li>
              You can skip playing memory to let your opponent reveal the cards
              for you, if it seems advantageous.
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
