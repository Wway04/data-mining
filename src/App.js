import React, { useState } from "react";
import "./App.css";
import * as XLSX from "xlsx";
import TitanicData from "./components/th1/TitanicData/TitanicData";
import CorrelationCalculator from "./components/th1/CorrelationCalculator/CorrelationCalculator";
import TapTho from "./components/th3/TapTho";
import TH2BAI1 from "./components/th2/Bai1";
import TH2BAI2 from "./components/th2/Bai2";
import TH2BAI3 from "./components/th2/Bai3";
import Bai1 from "./components/th5/Bai1";
import Bai2 from "./components/th5/Bai2";
import Bai3 from "./components/th5/Bai3";

function App() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState("TH1 correlation");




  const options = {
    "TH1 correlation": <CorrelationCalculator />,
    "TH1 titanic": <TitanicData />,
    "TH2 Tap pho bien 1": <TH2BAI1 />,
    "TH2 Tap pho bien 2": <TH2BAI2 />,
    "TH2 Tap pho bien 3": <TH2BAI3 />,
    "TH3 Tap tho": <TapTho />,
    "TH5 bai 1": <Bai1 />,
    "TH5 bai 2": <Bai2 />,
    "TH5 bai 3": <Bai3 />
  }


  return (
<div className="flex min-h-screen bg-gray-100  shadow-lg rounded-lg">
  {/* Sidebar */}
  <div className="w-64 bg-white border-r shadow-lg sticky top-0 h-screen mr-2 rounded-lg">
  <div className="p-6 border-b">

    <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
      Data Mining
</h1>
  </div>

  <nav className="p-4">
    <ul>
      {Object.keys(options).map((key) => (
        <li
          key={key}
          className={`mb-4 cursor-pointer px-4 py-3 rounded-lg transition-all duration-300 ease-in-out font-semibold transform ${
            selected === key
              ? "bg-blue-500 text-white scale-105 shadow-md"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105"
          }`}
          onClick={() => setSelected(key)}
        >
          {key}
        </li>
      ))}
    </ul>
  </nav>
</div>


  {/* Main Content Area with shadow */}
  <div className="flex-grow bg-white  shadow-lg rounded-lg">
    {options[selected]}
  </div>
</div>



  );
}

export default App;