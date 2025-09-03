const HeaderComponent = () => {
  return (
    <div className="bg-white shadow-lg p-3 z-50 flex items-center justify-between">
      <h1 className="ml-4 font-bold text-3xl text-lime-700">Bench Finder</h1>

      <div className="flex items-center space-x-2 mr-4 cursor-pointer text-zinc-400 hover:text-gray-600">
        {/* <h2 className="text-xl">Filter</h2>
        <FaFilter className="text-xl" />*/}
      </div>
    </div>
  );
};

export default HeaderComponent;
