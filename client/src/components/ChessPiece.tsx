import bp from "../assets/Chess_pdt45.svg";
import bk from "../assets/Chess_kdt45.svg";
import bb from "../assets/Chess_bdt45.svg";
import bn from "../assets/Chess_ndt45.svg";
import br from "../assets/Chess_rdt45.svg";
import bq from "../assets/Chess_qdt45.svg";
import wp from "../assets/Chess_plt45.svg";
import wk from "../assets/Chess_klt45.svg";
import wb from "../assets/Chess_blt45.svg";
import wn from "../assets/Chess_nlt45.svg";
import wr from "../assets/Chess_rlt45.svg";
import wq from "../assets/Chess_qlt45.svg";
import star from "../assets/Star.svg";

interface ChessPieceProps {
  piece: string;
}

const ChessPiece = ({ piece }: ChessPieceProps) => {
  const pieceMap: { [key: string]: string } = {
    BP: bp,
    BK: bk,
    BB: bb,
    BN: bn,
    BR: br,
    BQ: bq,
    WP: wp,
    WK: wk,
    WB: wb,
    WN: wn,
    WR: wr,
    WQ: wq,
    X: star,
  };

  return <img src={pieceMap[piece]} className="w-full aspect-square max-w-8" />;
};

export default ChessPiece;
