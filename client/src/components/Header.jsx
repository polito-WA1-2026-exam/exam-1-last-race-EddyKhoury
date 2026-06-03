import { useContext, useState } from "react";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router";

import UserContext from "../contexts/UserContext";
import { doLogout } from "../api/auth";

function Header() {
  const { user, setUser, loggedIn, setLoggedIn } = useContext(UserContext);
  const [logoutError, setLogoutError] = useState("");
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      setLogoutError("");
      await doLogout();

      setUser(null);
      setLoggedIn(false);

      navigate("/");
    } catch (err) {
      setLogoutError(err.message);
    }
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={NavLink} to="/">
            Last Race
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar" />

          <Navbar.Collapse id="main-navbar">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/">
                Instructions
              </Nav.Link>

              {loggedIn && (
                <>
                  <Nav.Link as={NavLink} to="/setup">
                    Setup
                  </Nav.Link>

                  <Nav.Link as={NavLink} to="/ranking">
                    Ranking
                  </Nav.Link>
                </>
              )}
            </Nav>

            <Nav className="align-items-lg-center gap-2">
              {loggedIn ? (
                <>
                  <Navbar.Text className="me-lg-2">
                    Signed in as {user?.name}
                  </Navbar.Text>

                  <Button variant="outline-light" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Nav.Link as={NavLink} to="/login">
                  Login
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {logoutError && (
        <Container className="mt-3">
          <div className="alert alert-danger mb-0">{logoutError}</div>
        </Container>
      )}
    </>
  );
}

export default Header;