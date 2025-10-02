import SearchBar from "./searchBar";

const HeaderComponent = () => {
  return (
    <div className="bg-white shadow-sm p-3 z-50 flex items-center justify-between">
      <h1 className="ml-4 font-bold text-3xl text-lime-600">Bench Finder</h1>
      <SearchBar onSelect={function (id: string): void {
        throw new Error("Function not implemented.");
      } }></SearchBar>
    </div>
  );
};

export default HeaderComponent;
