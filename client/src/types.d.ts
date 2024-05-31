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
