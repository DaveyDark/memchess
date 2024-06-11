import { Howl } from "howler";
import { ReactNode, createContext, useContext } from "react";

const SFXContext = createContext<{
  play: (event: string) => void;
}>({ play: () => {} });

const soundEffects: { [key: string]: string[] } = {
  move: [
    "/sfx/move0.wav",
    "/sfx/move1.wav",
    "/sfx/move2.wav",
    "/sfx/move3.wav",
    "/sfx/move4.wav",
    "/sfx/move5.wav",
  ],
  capture: [
    "/sfx/capture0.wav",
    "/sfx/capture1.wav",
    "/sfx/capture2.wav",
    "/sfx/capture3.wav",
  ],
  flip: [
    "/sfx/cardflip0.wav",
    "/sfx/cardflip1.wav",
    "/sfx/cardflip2.wav",
    "/sfx/cardflip3.wav",
  ],
  slide: ["/sfx/slide0.wav", "/sfx/slide1.wav", "/sfx/slide2.wav"],
  check: ["/sfx/check.wav"],
  confetti: ["/sfx/confetti0.wav", "/sfx/confetti1.wav", "/sfx/confetti2.wav"],
  draw: ["/sfx/draw.wav"],
  win: ["/sfx/win.wav"],
  lose: ["/sfx/lose.wav"],
  alert: ["/sfx/alert.wav"],
  turn: ["/sfx/turn.wav"],
};

const playRandomSound = (event: string) => {
  const sounds = soundEffects[event];
  if (sounds && sounds.length > 0) {
    const randomIndex = Math.floor(Math.random() * sounds.length);
    const howl = new Howl({ src: [sounds[randomIndex]] });
    howl.play();
  } else {
    console.warn(`No sound effects found for event: ${event}`);
  }
};

export const useSFX = () => {
  return useContext(SFXContext);
};

export const SFXProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SFXContext.Provider value={{ play: playRandomSound }}>
      {children}
    </SFXContext.Provider>
  );
};
