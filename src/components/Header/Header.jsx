import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import NavDropdown from "react-bootstrap/NavDropdown";
import Logo from "../../assets/logo/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Spinner } from "react-bootstrap";
import "./Header.css";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token")); // Check login state
  const [loading, setLoading] = useState(false); // Loading state
  const userId = localStorage.getItem("userId"); // Assuming you store the user ID in localStorage

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);
  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    setLoading(true); // Show spinner
    localStorage.clear();
    setTimeout(() => {
      setIsLoggedIn(false);
      setLoading(false);
      navigate("/login");
    }, 1000); 
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setShowOffcanvas(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token")); // Update login state when location changes
  }, [location]);

  const isActive = (path) => (location.pathname === path ? "active-link" : "");

  return (
    <header>
      {loading && (
        <div className="loading-overlay">
          <Spinner animation="border" variant="primary" />
          <p>Logging out...</p>
        </div>
      )}
      {!location.pathname.includes("/login") && !location.pathname.includes("/register") && (
        <Navbar expand="lg" className="bg-body-tertiary">
          <Container fluid>
            <Navbar.Brand>
              <Link to={"/"}>
                <img src={Logo} alt="medical" />
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={handleShow} />
            <Navbar.Offcanvas id="offcanvasNavbar" placement="start" show={showOffcanvas} onHide={handleClose}>
              <Offcanvas.Header closeButton>
                <Offcanvas.Title>
                  <Link to={"/"}>
                    <img src={Logo} alt="medical" />
                  </Link>
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-center flex-grow-1 pe-3">
                  <Nav.Link as="div">
                    <Link to="/" className={isActive("/")} onClick={handleClose}>
                      Home
                    </Link>
                  </Nav.Link>
                  <Nav.Link as="div">
                    <Link to="/skin-cancer" className={isActive("/skin-cancer")} onClick={handleClose}>
                      Skin Cancer
                    </Link>
                  </Nav.Link>
                  <Nav.Link as="div">
                    <Link to="/doctors" className={isActive("/doctors")} onClick={handleClose}>
                      Doctors
                    </Link>
                  </Nav.Link>

                  <NavDropdown title="Type Of Disease" id="offcanvasNavbarDropdown">
                    <NavDropdown.Item>
                      <Link to="/basal-cell-carcinoma" className={isActive("/basal-cell-carcinoma")} onClick={handleClose}>
                        Basal Cell Carcinoma
                      </Link>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <Link to="/squamous-cell-carcinoma" className={isActive("/squamous-cell-carcinoma")} onClick={handleClose}>
                        Squamous Cell Carcinoma
                      </Link>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <Link to="/melanoma" className={isActive("/melanoma")} onClick={handleClose}>
                        Melanoma
                      </Link>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <Link to="/merkel-cell-carcinoma" className={isActive("/merkel-cell-carcinoma")} onClick={handleClose}>
                        Merkel Cell Carcinoma
                      </Link>
                    </NavDropdown.Item>
                  </NavDropdown>

                  <Nav.Link as="div">
                    <Link to="/about" className={isActive("/about")} onClick={handleClose}>
                      About
                    </Link>
                  </Nav.Link>
                </Nav>
                <Form className="d-flex me-4 align-items-center justify-content-center">
                  {isLoggedIn ? (
                    <NavDropdown
                      title={
                        <img
                          src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
                          alt="avatar"
                          className="rounded-circle"
                          style={{ width: "32px", height: "32px", objectFit: "cover" }}
                        />
                      }
                      id="user-nav-dropdown"
                      className="user-dropdown"
                      align="end"
                    >
                      <NavDropdown.Item as="div" align="end" 
                      >
                        <Link to={`/doctors/${userId}`} className="dropdown-item" onClick={handleClose}>
                          Patient History
                        </Link>
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as="button" onClick={handleLogout} disabled={loading} className="dropdown-item">
                        Logout <LogOut size={16} className="ms-2" />
                      </NavDropdown.Item>
                    </NavDropdown>
                  ) : (
                    <Button onClick={handleLogin} variant="outline-primary">
                      Login
                    </Button>
                  )}
                </Form>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      )}
    </header>
  );
}

export default Header;
