import React from 'react';
import Map from './map';
import List from './components/List';

const App: React.FC = () => {
  return (
    <div>
<h1 className="text-center font-bold text-[30px]">Bench Finder</h1>
      <List/>
      <Map />

    </div>
  );
};

export default App
