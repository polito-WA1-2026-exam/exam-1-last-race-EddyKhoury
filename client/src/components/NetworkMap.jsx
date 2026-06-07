import { Badge } from "react-bootstrap";

function NetworkMap({
  network,
  mode = "full",
  startStationId = null,
  destinationStationId = null,
}) {
  if (!network || !Array.isArray(network.stations)) {
    return (
      <div className="text-muted text-center py-4">
        No network data available.
      </div>
    );
  }

  const stations = network.stations;
  const segments = Array.isArray(network.segments) ? network.segments : [];

  const stationsById = new Map();
  stations.forEach((station) => {
    stationsById.set(station.id, station);
  });

  const minX = Math.min(...stations.map((station) => station.x));
  const maxX = Math.max(...stations.map((station) => station.x));
  const minY = Math.min(...stations.map((station) => station.y));
  const maxY = Math.max(...stations.map((station) => station.y));

  const padding = 100;
  const viewBox = `${minX - padding} ${minY - padding} ${
    maxX - minX + padding * 2
  } ${maxY - minY + padding * 2}`;

  const showSegments = mode === "full";

  return (
    <div className="network-map-wrapper">
      <svg className="network-map-svg" viewBox={viewBox}>
        {showSegments &&
          segments.map((segment) => {
            const station1 = stationsById.get(segment.station1Id);
            const station2 = stationsById.get(segment.station2Id);

            if (!station1 || !station2) {
              return null;
            }

            return (
              <line
                key={segment.id}
                x1={station1.x}
                y1={station1.y}
                x2={station2.x}
                y2={station2.y}
                stroke={segment.lineColor || "#6c757d"}
                strokeWidth="8"
                strokeLinecap="round"
              />
            );
          })}

        {stations.map((station) => {
          const isStart = station.id === startStationId;
          const isDestination = station.id === destinationStationId;

          return (
            <g key={station.id}>
              <circle
                cx={station.x}
                cy={station.y}
                r={isStart || isDestination ? 14 : 10}
                className="network-map-station-circle"
              />

              <text
                x={station.x + 16}
                y={station.y - 12}
                className="network-map-station-label"
              >
                {station.name}
              </text>

              {isStart && (
                <text
                  x={station.x + 16}
                  y={station.y + 10}
                  className="network-map-station-label"
                >
                  START
                </text>
              )}

              {isDestination && (
                <text
                  x={station.x + 16}
                  y={station.y + 10}
                  className="network-map-station-label"
                >
                  DESTINATION
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {mode === "planning" && (
        <div className="mt-2 text-muted small">
          <Badge bg="secondary" className="me-2">
            Planning mode
          </Badge>
          Lines and colors are hidden during planning.
        </div>
      )}
    </div>
  );
}

export default NetworkMap;