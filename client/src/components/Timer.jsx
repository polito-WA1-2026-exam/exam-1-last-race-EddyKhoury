import { Alert, Badge } from "react-bootstrap";

function Timer({ secondsLeft }) {
  const isDanger = secondsLeft <= 10;

  return (
    <Alert variant={isDanger ? "danger" : "info"} className="mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <strong>Planning Timer</strong>

        <Badge bg={isDanger ? "danger" : "primary"} fs="6">
          {secondsLeft}s
        </Badge>
      </div>

      <div className="small mt-1">
        You have 90 seconds to build your route. When time reaches 0, the
        current route is submitted automatically.
      </div>
    </Alert>
  );
}

export default Timer;