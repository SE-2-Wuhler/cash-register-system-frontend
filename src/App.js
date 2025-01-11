import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Sco from "./views/sco/Sco";
import Pay from "./views/sco/pay/Pay";
import Complete from "./views/sco/complete/Complete";
import './App.css';
import Pledge from "./views/pledge/Pledge";
import { useEffect } from "react"


function App() {
  useEffect(() => {
    document.title = "Wühlmarkt"
  }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sco" element={<Sco />} />
        <Route path="/sco/pay" element={<Pay />} />
        <Route path="/pledge" element={<Pledge />} />
        <Route path="/sco/complete" element={<Complete />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
