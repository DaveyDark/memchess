import { Shape } from "canvas-confetti";

export type ConfettiOptions = {
  shapes: Shape[];
  colors: string[];
  particleCount: number;
  spread: number;
  startVelocity: number;
  gravity: number;
};

export const AVATAR_COLORS = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
  "bg-avatar-6",
  "bg-avatar-7",
  "bg-avatar-8",
];

export const AVATAR_PRESETS = [
  {
    color: "bg-avatar-1",
    rotation: 0,
    avatar: "^_^",
  },
  {
    color: "bg-avatar-2",
    rotation: 0,
    avatar: "o_o",
  },
  {
    color: "bg-avatar-3",
    rotation: 0,
    avatar: "O_O",
  },
  {
    color: "bg-avatar-4",
    rotation: 0,
    avatar: "0_0",
  },
  {
    color: "bg-avatar-5",
    rotation: 0,
    avatar: "O_o",
  },
  {
    color: "bg-avatar-6",
    rotation: 0,
    avatar: "o_O",
  },
  {
    color: "bg-avatar-7",
    rotation: 0,
    avatar: "0_o",
  },
  {
    color: "bg-avatar-8",
    rotation: 0,
    avatar: "o_0",
  },
  {
    color: "bg-avatar-1",
    rotation: 1,
    avatar: ":)",
  },
  {
    color: "bg-avatar-2",
    rotation: 1,
    avatar: ":D",
  },
  {
    color: "bg-avatar-3",
    rotation: 1,
    avatar: ";)",
  },
  {
    color: "bg-avatar-4",
    rotation: 1,
    avatar: ":P",
  },
  {
    color: "bg-avatar-5",
    rotation: 1,
    avatar: ":(",
  },
  {
    color: "bg-avatar-6",
    rotation: 1,
    avatar: ":O",
  },
  {
    color: "bg-avatar-7",
    rotation: 1,
    avatar: ":|",
  },
  {
    color: "bg-avatar-8",
    rotation: 1,
    avatar: ":/",
  },
  {
    color: "bg-avatar-1",
    rotation: 1,
    avatar: "XD",
  },
  {
    color: "bg-avatar-2",
    rotation: 1,
    avatar: "X)",
  },
  {
    color: "bg-avatar-3",
    rotation: 1,
    avatar: "X|",
  },
  {
    color: "bg-avatar-4",
    rotation: 1,
    avatar: "XO",
  },
  {
    color: "bg-avatar-5",
    rotation: 1,
    avatar: "XP",
  },
  {
    color: "bg-avatar-1",
    rotation: 1,
    avatar: "X(",
  },
  {
    color: "bg-avatar-8",
    rotation: 1,
    avatar: "XD",
  },
  {
    color: "bg-avatar-3",
    rotation: 3,
    avatar: "{:P",
  },
];

export const defaultMemoryBoard = [
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bk", flipped: false },
  { value: "bb", flipped: false },
  { value: "bb", flipped: false },
  { value: "bn", flipped: false },
  { value: "bn", flipped: false },
  { value: "br", flipped: false },
  { value: "br", flipped: false },
  { value: "bq", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wk", flipped: false },
  { value: "wb", flipped: false },
  { value: "wb", flipped: false },
  { value: "wn", flipped: false },
  { value: "wn", flipped: false },
  { value: "wr", flipped: false },
  { value: "wr", flipped: false },
  { value: "wq", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bp", flipped: false },
  { value: "bk", flipped: false },
  { value: "bb", flipped: false },
  { value: "bb", flipped: false },
  { value: "bn", flipped: false },
  { value: "bn", flipped: false },
  { value: "br", flipped: false },
  { value: "br", flipped: false },
  { value: "bq", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wp", flipped: false },
  { value: "wk", flipped: false },
  { value: "wb", flipped: false },
  { value: "wb", flipped: false },
  { value: "wn", flipped: false },
  { value: "wn", flipped: false },
  { value: "wr", flipped: false },
  { value: "wr", flipped: false },
  { value: "wq", flipped: false },
];

export const CONFETTI_COLORS = [
  "#51958f",
  "#263044",
  "#92b8b3",
  "#53c2cf",
  "#d0e9dd",
];

export const matchConfettiOptions: ConfettiOptions = {
  particleCount: 50,
  spread: 60,
  startVelocity: 20,
  gravity: 0.6,
  shapes: ["square", "circle"],
  colors: CONFETTI_COLORS,
};

export const fireConfettiOptions: ConfettiOptions = {
  particleCount: 50,
  spread: 90,
  startVelocity: 5,
  gravity: 0.4,
  shapes: ["circle", "square"],
  colors: CONFETTI_COLORS,
};

export const PIECE_MAP = {
  bq: "Black Queen",
  bk: "Black King",
  br: "Black Rook",
  bb: "Black Bishop",
  bn: "Black Knight",
  bp: "Black Pawn",
  wq: "White Queen",
  wk: "White King",
  wr: "White Rook",
  wb: "White Bishop",
  wn: "White Knight",
  wp: "White Pawn",
};
