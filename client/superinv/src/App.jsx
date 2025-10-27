import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Inventory from "./pages/Inventory/Inventory";
import Transactions from "./pages/Transactions/Transactions";
import Sale from "./pages/Sale/Sale";
import LandingPage from "./pages/Landing Page/LandingPage";
import SignUp from "./pages/SignUp/SignUp";
import Navbar from "./components/Navbar";
import SignIn from "./pages/SignIn/SignIn";
import ProtectedRoute from "./pages/ProtectedRoute";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route
          path="/sale"
          element={
            <ProtectedRoute>
              <Sale />
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  );
}

export default App;
