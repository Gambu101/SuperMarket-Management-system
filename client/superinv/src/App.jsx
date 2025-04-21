import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Inventory from "./pages/Inventory/Inventory";
import Transactions from "./pages/Transactions/Transactions";
import Sale from "./pages/Sale/Sale";
import BackButton from "./components/BackButton";
import LandingPage from "./pages/Landing Page/LandingPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/sale" element={<Sale />} />
      </Routes>
        <BackButton/>
        <Home/>

        <Routes>
          <Route path="/home" element={<Home />}/>
          <Route path="/inventory" element={<Inventory />}/>
          <Route path="/transactions" element={<Transactions />}/>
          <Route path="/sale" element={<Sale />}/>
        </Routes>
    </>
  );
}

export default App;
