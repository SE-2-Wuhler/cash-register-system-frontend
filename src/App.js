import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Sco from "./views/sco/Sco";
import Pay from "./views/sco/pay/Pay";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sco" element={<Sco />} />
        <Route path="/sco/pay" element={<Pay />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
