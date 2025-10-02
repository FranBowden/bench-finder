import SearchBar from "./searchBar";
import {Place} from '../../../shared/types/place'

type HeaderProps = {
 onPlaceSelect: (place: Place) => void;
   radius: number | 700;
  setCachedBenches: any;
};

const HeaderComponent = ({ onPlaceSelect ,radius, setCachedBenches }: HeaderProps) => {

  return (
    <div className="bg-white shadow-sm p-3 z-50 flex items-center justify-between">
      <h1 className="ml-4 font-bold text-3xl text-lime-600">Bench Finder</h1>
 <SearchBar
  onSelect={(place) => {
          console.log("Selected place in Header:", place);
          onPlaceSelect(place); // pass it up to App.tsx
        }}
  radius={radius}
  setCachedBenches={setCachedBenches}
/>

    </div>
  );
};

export default HeaderComponent;
