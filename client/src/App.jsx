import { useEffect, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";
import { Navigate, Outlet, Route, Routes } from "react-router";

import UserContext from "./contexts/UserContext";
import { checkSession } from "./api/auth";

import Header from "./components/Header";
import Footer from "./components/Footer";
import InstructionsPage from "./components/InstructionsPage";
import LoginForm from "./components/LoginForm";
import SetupPage from "./components/SetupPage";
import PlanningPage from "./components/PlanningPage";
import ExecutionPage from "./components/ExecutionPage";
import ResultPage from "./components/ResultPage";
import RankingPage from "./components/RankingPage";
import ErrorPage from "./components/ErrorPage";

function ProtectedRoute({ loggedIn, checkingSession }) {
  if (checkingSession) {
    return (
      <Container className="py-4">
        <Spinner animation="border" size="sm" className="me-2" />
        Checking session...
      </Container>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadCurrentSession() {
      try {
        const currentUser = await checkSession();

        if (!ignore) {
          if (currentUser) {
            setUser(currentUser);
            setLoggedIn(true);
          } else {
            setUser(null);
            setLoggedIn(false);
          }
        }
      } catch {
        if (!ignore) {
          setUser(null);
          setLoggedIn(false);
          setSessionError("Could not check the current login session.");
        }
      } finally {
        if (!ignore) {
          setCheckingSession(false);
        }
      }
    }

    loadCurrentSession();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loggedIn, setLoggedIn }}>
      <div className="d-flex flex-column min-vh-100">
        <Header />

        <main className="flex-grow-1">
          {sessionError && (
            <Container className="mt-3">
              <Alert variant="warning" className="mb-0">
                {sessionError}
              </Alert>
            </Container>
          )}

          <Routes>
            <Route path="/" element={<InstructionsPage />} />

            <Route
              path="/login"
              element={loggedIn ? <Navigate to="/setup" replace /> : <LoginForm />}
            />

            <Route
              element={
                <ProtectedRoute
                  loggedIn={loggedIn}
                  checkingSession={checkingSession}
                />
              }
            >
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/game/:gameId/planning" element={<PlanningPage />} />
              <Route path="/game/:gameId/execution" element={<ExecutionPage />} />
              <Route path="/game/:gameId/result" element={<ResultPage />} />
              <Route path="/ranking" element={<RankingPage />} />
            </Route>

            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </UserContext.Provider>
  );
}

export default App;