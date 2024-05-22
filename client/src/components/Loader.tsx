const Loader = () => {
  return (
    <div className="absolute w-screen h-screen top-0 left-0 grid place-items-center backdrop-blur z-40">
      <div
        className="bg-secondary p-16 rounded-xl min-w-48 min-h-32 flex 
        shadow-xl flex-col justify-center items-center gap-8"
      >
        <span className="loading loading-dots text-primary loading-lg"></span>
        <h2 className="text-xl text-white font-semibold">
          Connecting to the server...
        </h2>
      </div>
    </div>
  );
};

export default Loader;
