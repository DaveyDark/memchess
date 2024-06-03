import { X } from "react-feather";
import { useHistory } from "../../context/HistoryProvider";
import HistoryItem from "./HistoryItem";

const History = () => {
  const { history } = useHistory();

  return (
    <ul className="bg-base-100 w-screen max-w-96 h-full flex flex-col p-2 z-20 justify-between">
      <div className="flex flex-col gap-2 h-full overflow-y-scroll w-full no-scrollbar">
        {history.map((item, index) => (
          <HistoryItem item={item} key={index} />
        ))}
      </div>
      <label
        className="btn w-full btn-secondary shadow-lg"
        aria-label="close drawer"
        htmlFor="drawer"
      >
        <X color="white" />
      </label>
    </ul>
  );
};

export default History;
