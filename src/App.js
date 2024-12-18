import React, { useState } from "react";
import "./App.css";
import * as XLSX from "xlsx";
import DataColumnFiller from "./components/th1/TitanicData/TitanicData";
import CorrelationCalculator from "./components/th1/CorrelationCalculator/CorrelationCalculator";
import TapTho from "./components/th3/TapTho";
import TH2BAI1 from "./components/th2/Bai1";
import TH2BAI2 from "./components/th2/Bai2";
import TH2BAI3 from "./components/th2/Bai3";
import Bai1 from "./components/th5/Bai1";
import Bai2 from "./components/th5/Bai2";
import Bai3 from "./components/th5/Bai3";
import DashboardLayout from './components/th4';
function App() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState("TH1 correlation");




  const options = {
    "Hệ Số Tương Quan": <CorrelationCalculator />,
    "Làm Sạch Dữ Liệu": <DataColumnFiller />,
    "Phân Tích Tập Phổ Biến": <TH2BAI1 />,
    "Phân Tích Tập Phổ Biến 2": <TH2BAI2 />,
    "Phân Tích Tập Phổ Biến 3": <TH2BAI3 />,
    "Tập thô": <TapTho />,
    "Phân lớp Naive Bayes (Không Laplace)": <Bai1 />,
    "Phân lớp Naive Bayes (Laplace)": <Bai2 />,
    "Phân cụm K-Means": <Bai3 />,
    // "test": <DashboardLayout/>,
  }


  return (
<div className="flex min-h-screen bg-gray-100  shadow-lg rounded-lg">
  {/* Sidebar */}
  <div className="w-66 bg-white border-r shadow-lg sticky top-0 h-screen mr-2 rounded-lg">
  <div className="p-6 border-b">

    <h1 class="text-2xl font-bold text-blue-600 bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
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
              : "text-gray-600 hover:bg-blue-100 hover:border hover:border-blue-400 hover:shadow-lg hover:text-blue-700 hover:scale-105"
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