import { Badge, Card } from "react-bootstrap";

function GameStepCard({ step }) {
  const eventEffect = Number(step.eventEffect);
  const effectLabel = eventEffect >= 0 ? `+${eventEffect}` : `${eventEffect}`;
  const effectVariant = eventEffect >= 0 ? "success" : "danger";

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0">
            Step {step.stepIndex}
          </Card.Title>

          <Badge bg={effectVariant}>
            Event {effectLabel} coins
          </Badge>
        </div>

        <Card.Text className="mb-2">
          <strong>From:</strong> {step.fromStationName}
          <br />
          <strong>To:</strong> {step.toStationName}
        </Card.Text>

        <Card.Text className="mb-2">
          <strong>Line:</strong>{" "}
          <span>{step.lineName}</span>
        </Card.Text>

        <Card.Text className="mb-2">
          <strong>Event:</strong> {step.eventDescription}
        </Card.Text>

        <Card.Text className="mb-0">
          <strong>Coins:</strong> {step.coinsBefore} → {step.coinsAfter}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default GameStepCard;