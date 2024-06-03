import { Book, CheckSquare, ChevronsRight, Eye, Grid, X } from "react-feather";
import { HistoryEntry } from "../../types";
import ChessPiece from "../ChessPiece";

interface HistoryItemProps {
  item: HistoryEntry;
}

const HistoryItem = ({ item }: HistoryItemProps) => {
  let content: JSX.Element = <></>;

  if (item.type === "divider")
    return <div className="divider divider-accent" />;

  switch (item.type) {
    case "flip":
      content = (
        <>
          <span className="flex">
            <Grid color="white" />
            <div className="divider divider-horizontal divider-accent" />
          </span>
          <span className="flex items-center bg-accent w-full justify-center rounded-lg pl-2 pr-1 gap-1">
            <Eye color="white" />
            <ChessPiece piece={item.move.toUpperCase()} />
          </span>
        </>
      );
      break;
    case "move":
      content = (
        <>
          <span className="flex">
            <Book color="white" />
            <div className="divider divider-horizontal divider-accent" />
          </span>
          <span className="flex items-center bg-accent w-full justify-center rounded-lg pl-2 pr-1 gap-1 text-white">
            <span className="h-full aspect-square rounded">
              <ChessPiece piece={item.moveDetail!.piece} />
            </span>
            <p>{item.moveDetail!.from}</p>
            <ChevronsRight color="white" />
            <p>{item.moveDetail!.to}</p>
            {item.moveDetail!.promotion != "" && (
              <span className="h-full aspect-square rounded">
                <ChessPiece piece={item.moveDetail!.promotion} />
              </span>
            )}
            {item.moveDetail!.capture && (
              <span className="bg-error h-full aspect-square rounded">
                <ChessPiece piece={item.moveDetail!.capture} />
              </span>
            )}
          </span>
        </>
      );
      break;
    case "match":
      content = (
        <>
          <span className="flex">
            <Grid color="white" />
            <div className="divider divider-horizontal divider-accent" />
          </span>
          <span className="flex items-center bg-accent w-full justify-center rounded-lg pl-2 pr-1 gap-1">
            <CheckSquare color="white" />
            <CheckSquare color="white" />
            <ChessPiece piece={item.move.toUpperCase()} />
          </span>
        </>
      );
      break;
    case "destroy":
      content = (
        <>
          <span className="flex">
            <Book color="white" />
            <div className="divider divider-horizontal divider-accent" />
          </span>
          <span className="flex items-center bg-accent w-full justify-center rounded-lg pl-2 pr-1 gap-1 text-white">
            <X color="red" />
            <ChessPiece piece={item.moveDetail!.piece} />
            <p>{item.moveDetail!.from}</p>
          </span>
        </>
      );
      break;
  }

  return (
    <li
      className="flex w-full justify-between items-center bg-primary 
      rounded-box flex-nowrap flex-row py-2 px-4 shadow"
    >
      {content}
    </li>
  );
};

export default HistoryItem;
