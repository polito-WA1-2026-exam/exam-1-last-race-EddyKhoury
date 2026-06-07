import { Alert } from "react-bootstrap";

function NetworkMap({ network, mode = "full" }) {
    if (!network || !Array.isArray(network.stations) || !Array.isArray(network.segments)) {
        return <Alert variant="warning">Network data is not available.</Alert>;
    }

    if (network.stations.length === 0) {
        return <Alert variant="warning">No stations are available.</Alert>;
    }

    const stationsById = new Map(network.stations.map((station) => [station.id, station]));

    const xValues = network.stations.map((station) => station.x);
    const yValues = network.stations.map((station) => station.y);

    const xPadding = 170;
    const yPadding = 90;

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const viewBox = `${minX - xPadding} ${minY - yPadding} ${maxX - minX + xPadding * 2
        } ${maxY - minY + yPadding * 2}`;

    const getSegmentColor = (segment) => {
        if (mode === "full") {
            return segment.lineColor || "#6c757d";
        }

        return "#6c757d";
    };

    return (
        <div className="network-map-wrapper border rounded bg-light p-2">
            <svg
                viewBox={viewBox}
                role="img"
                aria-label="Last Race underground network map"
                className="network-map-svg"
            >
                {network.segments.map((segment) => {
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
                            stroke={getSegmentColor(segment)}
                            strokeWidth={mode === "full" ? 8 : 4}
                            strokeLinecap="round"
                        />
                    );
                })}

                {network.stations.map((station) => (
                    <g key={station.id}>
                        <circle
                            cx={station.x}
                            cy={station.y}
                            r="9"
                            className="network-map-station-circle"
                        />

                        <text
                            x={station.x + 12}
                            y={station.y - 12}
                            className="network-map-station-label"
                        >
                            {station.name}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

export default NetworkMap;