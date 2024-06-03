export interface IChat {
  text: string;
  side: "left" | "right";
}

interface IToast {
  duration: number;
  content: string;
  type: "info" | "success" | "error" | "warning";
}

interface IAvatar {
  color: string;
  rotation: number;
  avatar: string;
}

type GameState = "waiting" | "ready" | "playing" | "over";

interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
  avatar_orientation: number;
  avatar_color: string;
  chess_color: string;
}

interface IUserInfo {
  player1: PlayerInfo | undefined;
  player2: PlayerInfo | undefined;
}

interface HistoryEntry {
  player: string;
  board: "memory" | "chess";
  type: "flip" | "match" | "destroy" | "move" | "divider";
  move: string;
  moveDetail?: {
    from: string;
    to: string;
    promotion: string;
    piece: string;
    capture?: string;
  };
}

interface MatchedTiles {
  tile: string;
  matches: number[];
}
