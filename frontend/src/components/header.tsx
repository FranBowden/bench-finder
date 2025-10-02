import SearchBar from "./searchBar";
import { BenchWithDirection } from "@shared/types/BenchWithDirection";
type HeaderProps = {
  radius: number | 700;
  setCachedBenches: any;
};

const HeaderComponent = ({ radius, setCachedBenches }: HeaderProps) => {

  return (
    <div className="bg-white shadow-sm p-3 z-50 flex items-center justify-between">
      <h1 className="ml-4 font-bold text-3xl text-lime-600">Bench Finder</h1>
 <SearchBar
  onSelect={(place) => {
    console.log("Selected place:", place);
    // update your map or state here
  }}
  radius={radius}
  setCachedBenches={setCachedBenches}
/>

    </div>
  );
};

export default HeaderComponent;
