import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { getGameSteps } from "../api/gameApi";
import GameStepCard from "./GameStepCard";
import Loading from "./Loading";

function ExecutionPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [steps, setSteps] = useState([]);
  const [visibleStepCount, setVisibleStepCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSteps() {
      try {
        setLoading(true);
        setErrorMessage("");

        const loadedSteps = await getGameSteps(gameId);
        setSteps(loadedSteps);
        setVisibleStepCount(loadedSteps.length > 0 ? 1 : 0);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSteps();
  }, [gameId]);

  function handleNextStep() {
    setVisibleStepCount((currentValue) =>
      Math.min(currentValue + 1, steps.length)
    );
  }

  function goToResult() {
    navigate(`/game/${gameId}/result`);
  }

  if (loading) {
    return <Loading message="Loading execution steps..." />;
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={9}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title as="h2" className="mb-3">
                Execution Phase
              </Card.Title>

              <Card.Text className="text-muted">
                The server has already validated the route, selected the random
                events, and calculated the coin changes. Here you reveal the
                execution steps one by one.
              </Card.Text>

              {errorMessage && (
                <Alert variant="danger">
                  {errorMessage}
                </Alert>
              )}

              {!errorMessage && steps.length === 0 && (
                <Alert variant="warning">
                  No execution steps are available for this game. This usually
                  means the submitted route was invalid, so execution was skipped
                  and the final score is 0.
                </Alert>
              )}

              {!errorMessage &&
                steps.slice(0, visibleStepCount).map((step) => (
                  <GameStepCard key={step.stepIndex} step={step} />
                ))}

              {!errorMessage && steps.length > 0 && (
                <div className="d-flex gap-2">
                  {visibleStepCount < steps.length ? (
                    <Button variant="primary" onClick={handleNextStep}>
                      Next Step
                    </Button>
                  ) : (
                    <Button variant="success" onClick={goToResult}>
                      Go to Result
                    </Button>
                  )}

                  <Button variant="outline-secondary" onClick={goToResult}>
                    Skip to Result
                  </Button>
                </div>
              )}

              {!errorMessage && steps.length === 0 && (
                <Button variant="primary" onClick={goToResult}>
                  Go to Result
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ExecutionPage;