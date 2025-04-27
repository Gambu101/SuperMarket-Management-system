import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <>
      <h1>SuperInv</h1>
      <h2>Manage your Sales, Inventory, and Customers in one place</h2>
      <div className="buttons">
        <Link to={"/signin"}>
          <button>Sign In</button>
        </Link>
        <Link to={"/signup"}>
          <button>Sign Up</button>
        </Link>
      </div>
    </>
  );
}
