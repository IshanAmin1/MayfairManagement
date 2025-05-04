import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { UserContext } from "./UserContext";

const Navbar = () => {

  const { user, setUser } = useContext(UserContext);

  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  return (
    <nav className="navbar">
      <h1>Mayfair Management</h1>
      <ul>
        <li>
          <Link to="">Homepage</Link>
        </li>
        <li>
          <Link to="all-facilities">All Facilities</Link>
        </li>
        {user == null ? null : (
          <li>
            <Link to="my-bookings">My Bookings</Link>
          </li>
        )}
        {user == null ? null : (
          <li>
            <Link to="book-facility">Book Facility</Link>
          </li>
        )}
        {user == null ? (
          <li>
            <Link to="auth">Login</Link>
          </li>
        ) : (
          <li className="logout" onClick={handleLogout}>
            Logout
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;