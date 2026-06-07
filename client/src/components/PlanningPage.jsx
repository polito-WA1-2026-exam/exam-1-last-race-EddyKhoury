import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";

import { getPlanningGame, submitRoute } from "../api/gameApi";
import Loading from "./Loading";
import NetworkMap from "./NetworkMap";
import SegmentList from "./SegmentList";
import SelectedRoute from "./SelectedRoute";
import Timer from "./Timer";

function PlanningPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [planningData, setPlanningData] = useState(null);
  const [selectedSegmentIds, setSelectedSegmentIds] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedSegmentIdsRef = useRef([]);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    selectedSegmentIdsRef.current = selectedSegmentIds;
  }, [selectedSegmentIds]);

  useEffect(() => {
    async function loadPlanningData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getPlanningGame(gameId);
        setPlanningData(data);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlanningData();
  }, [gameId]);

  const submitRouteOnce = useCallback(
    async (segmentIdsToSubmit = selectedSegmentIdsRef.current) => {
      if (hasSubmittedRef.current) {
        return;
      }

      try {
        hasSubmittedRef.current = true;
        setSubmitting(true);
        setErrorMessage("");

        const result = await submitRoute(gameId, segmentIdsToSubmit);

        if (result.valid) {
          navigate(`/game/${gameId}/execution`);
        } else {
          navigate(`/game/${gameId}/result`);
        }
      } catch (err) {
        hasSubmittedRef.current = false;
        setSubmitting(false);
        setErrorMessage(err.message);
      }
    },
    [gameId, navigate]
  );

  useEffect(() => {
    if (!planningData || submitting || hasSubmittedRef.current) {
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          clearInterval(intervalId);
          submitRouteOnce(selectedSegmentIdsRef.current);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [planningData, submitting, submitRouteOnce]);

  function handleSelectSegment(segmentId) {
    setSelectedSegmentIds((currentSelected) => {
      if (currentSelected.includes(segmentId)) {
        return currentSelected;
      }

      return [...currentSelected, segmentId];
    });
  }

  function handleRemoveLast() {
    setSelectedSegmentIds((currentSelected) => currentSelected.slice(0, -1));
  }

  function handleClearRoute() {
    setSelectedSegmentIds([]);
  }

  function handleManualSubmit() {
    submitRouteOnce(selectedSegmentIdsRef.current);
  }

  if (loading) {
    return <Loading message="Loading planning data..." />;
  }

  if (!planningData) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {errorMessage || "Planning data could not be loaded."}
        </Alert>
      </Container>
    );
  }

  const game = planningData.game;
  const stations = planningData.stations || [];
  const segments = planningData.segments || [];

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h1 className="mb-1">Planning Phase</h1>
          <p className="text-muted mb-0">
            Build your route by selecting segment IDs. Lines and colors are
            hidden during planning.
          </p>
        </Col>
      </Row>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Timer secondsLeft={secondsLeft} />

      <Row className="g-3 mb-3">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Start Station</Card.Title>
              <Card.Text className="fs-5 mb-0">
                {game.startStationName}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Destination Station</Card.Title>
              <Card.Text className="fs-5 mb-0">
                {game.destinationStationName}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={7}>
          <Card className="mb-3">
            <Card.Header>
              <strong>Planning Map</strong>
            </Card.Header>

            <Card.Body>
              <NetworkMap
                network={planningData}
                mode="planning"
                startStationId={game.startStationId}
                destinationStationId={game.destinationStationId}
              />
            </Card.Body>
          </Card>

          <SelectedRoute
            selectedSegmentIds={selectedSegmentIds}
            segments={segments}
            stations={stations}
            onRemoveLast={handleRemoveLast}
            onClearRoute={handleClearRoute}
            disabled={submitting}
          />

          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="success"
              disabled={submitting}
              onClick={handleManualSubmit}
            >
              {submitting ? "Submitting..." : "Submit Route"}
            </Button>
          </div>
        </Col>

        <Col lg={5}>
          <SegmentList
            segments={segments}
            stations={stations}
            selectedSegmentIds={selectedSegmentIds}
            onSelectSegment={handleSelectSegment}
            disabled={submitting}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default PlanningPage;