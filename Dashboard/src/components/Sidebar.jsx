import { useState, useEffect } from "react";
import { FaUserDoctor } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoPersonAddSharp } from "react-icons/io5";
import { MdAddModerator } from "react-icons/md";
import { RiLoginCircleFill, RiLogoutCircleFill } from "react-icons/ri";
import { TiHome } from "react-icons/ti";
import { Spinner } from "react-bootstrap"; // ✅ Import Bootstrap Spinner
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PiCaretCircleUpDuotone } from "react-icons/pi";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const navigateTo = useNavigate();
  const location = useLocation();

  // Check if user is logged in (by checking token in localStorage)
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, [location.pathname]); // Runs on route change

  const handleLogin = () => {
    navigateTo("/login");
    setShow(false);
  };

  const handleLogout = async () => {
    setLoading(true); // ✅ Show loading overlay

    setTimeout(() => {
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      toast.success("Logged out successfully.",{
        style: { color: "#0d6efd" },
        progressStyle: {
          background: "linear-gradient(to right, #87CEEB, #0d6efd)",
          height: "4px",
        },
        icon: <PiCaretCircleUpDuotone />,

      });
      navigateTo("/login");
      setShow(false);
      setLoading(false); // ✅ Hide loading overlay
    },500); // Simulated API delay
  };

  const handleNavigation = (path) => {
    navigateTo(path);
    setShow(false);
  };

  // Hide sidebar on login page
  if (location.pathname === "/login") {
    return null;
  }

  return (
    <>
      {loading && ( // ✅ Full-page loading overlay
        <div className="loading-overlay">
          <Spinner animation="border" variant="primary" />
          <p>Logging out...</p>
        </div>
      )}

      <nav className={show ? "show sidebar" : "sidebar"}>
        <div className="links">
          <TiHome
            className={location.pathname === "/" ? "icon active" : "icon"}
            onClick={() => handleNavigation("/")}
          />
          <FaUserDoctor
            className={location.pathname === "/doctors" ? "icon active" : "icon"}
            onClick={() => handleNavigation("/doctors")}
          />
          <MdAddModerator
            className={location.pathname === "/admin/addnew" ? "icon active" : "icon"}
            onClick={() => handleNavigation("/admin/addnew")}
          />
          <IoPersonAddSharp
            className={location.pathname === "/doctor/addnew" ? "icon active" : "icon"}
            onClick={() => handleNavigation("/doctor/addnew")}
          />

          {isAuthenticated ? (
            <RiLogoutCircleFill className="icon logout" onClick={handleLogout} />
          ) : (
            <RiLoginCircleFill
              className={location.pathname === "/login" ? "icon active" : "icon"}
              onClick={handleLogin}
            />
          )}
        </div>
      </nav>

      <div className="wrapper">
        <GiHamburgerMenu className="hamburger" onClick={() => setShow(!show)} />
      </div>
    </>
  );
};

export default Sidebar;
