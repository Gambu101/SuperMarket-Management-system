import "./App.css";
import { Route, Routes } from "react-router-dom";
import Inventory from "./pages/Inventory/Inventory";
import Transactions from "./pages/Transactions/Transactions";
import Sale from "./pages/Sale/Sale";
import LandingPage from "./pages/Landing Page/LandingPage";
import SignUp from "./pages/SignUp/SignUp";
import Navbar from "./components/Navbar";
import SignIn from "./pages/SignIn/SignIn";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard"

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
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
