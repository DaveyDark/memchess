import { useState } from "react";

const MemoryBoard = () => {
  const memoryTiles = [
    { value: "1", flipped: false },
    { value: "2", flipped: false },
    { value: "3", flipped: false },
    { value: "4", flipped: false },
    { value: "5", flipped: false },
    { value: "6", flipped: false },
    { value: "7", flipped: false },
    { value: "8", flipped: false },
    { value: "9", flipped: false },
    { value: "10", flipped: false },
    { value: "11", flipped: false },
    { value: "12", flipped: false },
    { value: "13", flipped: false },
    { value: "14", flipped: false },
    { value: "15", flipped: false },
    { value: "16", flipped: false },
    { value: "17", flipped: false },
    { value: "18", flipped: false },
    { value: "19", flipped: false },
    { value: "20", flipped: false },
    { value: "21", flipped: false },
    { value: "22", flipped: false },
    { value: "23", flipped: false },
    { value: "24", flipped: false },
    { value: "25", flipped: false },
    { value: "26", flipped: false },
    { value: "27", flipped: false },
    { value: "28", flipped: false },
    { value: "29", flipped: false },
    { value: "30", flipped: false },
    { value: "31", flipped: false },
    { value: "32", flipped: false },
    { value: "1", flipped: false },
    { value: "2", flipped: false },
    { value: "3", flipped: false },
    { value: "4", flipped: false },
    { value: "5", flipped: false },
    { value: "6", flipped: false },
    { value: "7", flipped: false },
    { value: "8", flipped: false },
    { value: "9", flipped: false },
    { value: "10", flipped: false },
    { value: "11", flipped: false },
    { value: "12", flipped: false },
    { value: "13", flipped: false },
    { value: "14", flipped: false },
    { value: "15", flipped: false },
    { value: "16", flipped: false },
    { value: "17", flipped: false },
    { value: "18", flipped: false },
    { value: "19", flipped: false },
    { value: "20", flipped: false },
    { value: "21", flipped: false },
    { value: "22", flipped: false },
    { value: "23", flipped: false },
    { value: "24", flipped: false },
    { value: "25", flipped: false },
    { value: "26", flipped: false },
    { value: "27", flipped: false },
    { value: "28", flipped: false },
    { value: "29", flipped: false },
    { value: "30", flipped: false },
    { value: "31", flipped: false },
    { value: "32", flipped: false },
  ];

  const [tiles, setTiles] = useState(memoryTiles);

  return (
    <div className="bg-secondary rounded-md grid grid-rows-8 grid-cols-8 p-4 gap-2 my-auto flex-1">
      {tiles.map((tile, i) => (
        <div
          className={`card min-w-4 aspect-square text-xl ${tile.flipped && "card-flipped"}`}
          onClick={() => {
            const newTiles = [...tiles];
            newTiles[i].flipped = !newTiles[i].flipped;
            setTiles(newTiles);
          }}
          key={i}
        >
          <div className="card-front"></div>
          <div className="card-back">{tile.value}</div>
        </div>
      ))}
    </div>
  );
};

export default MemoryBoard;
