import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const featureNames = [
  "Seq",
  "Dur",
  "sHops",
  "dHops",
  "SrcPkts",
  "TotBytes",
  "SrcBytes",
  "Offset",
  "sMeanPktSz",
  "dMeanPktSz",
  "TcpRtt",
  "AckDat",
  "sTtl_",
  "dTtl_",
  "Proto_tcp",
  "Proto_udp",
  "Cause_Status",
  "State_INT",
];

function App() {
  const [chartData, setChartData] = useState([]);
  const [anomalyData, setAnomalyData] = useState(null);
  const [mitigation, setMitigation] = useState("");

  const introduceAnomaly = async () => {
    try {
      const res = await fetch("http://localhost:8000/introduce_anomaly", {
        method: "POST",
      });
      console.log(await res.json());
    } catch (error) {
      console.error("Error introducing anomaly:", error);
    }
  };

  const clearData = () => {
    setAnomalyData(null);
    setMitigation("");
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/monitor");

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      setChartData((prev) => [
        ...prev.slice(-49),
        {
          time: new Date(data.timestamp).toLocaleTimeString(),
          probability: data.probability,
        },
      ]);

      if (data.anomaly === 1) {
        setAnomalyData(data.features);
        try {
          const response = await fetch(
            `http://localhost:8080/heal?anomaly=${encodeURIComponent(
              JSON.stringify(data.features)
            )}`
          );
          setMitigation(await response.text());
        } catch (error) {
          setMitigation(`Error: ${error.message}`);
        }
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="max-w-[1200px] w-full min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          5G Intrusion Detection System
        </h1>

        <h2 className="text-xl font-bold text-white mb-8 text-center">
          Network Traffic Graph
        </h2>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#d1d5db" }}
                  tickLine={{ stroke: "#6b7280" }}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fill: "#d1d5db" }}
                  tickLine={{ stroke: "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    color: "#f3f4f6",
                    borderRadius: "0.375rem",
                    border: "1px solid #4b5563",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    stroke: "#ea580c",
                    strokeWidth: 2,
                    r: 6,
                    fill: "#fdba74",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={introduceAnomaly}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex-1"
          >
            Trigger Anomaly
          </button>
          <button
            onClick={clearData}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex-1"
          >
            Clear
          </button>
        </div>

        {mitigation && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">
              Recommended Mitigation
            </h3>
            <div className="bg-blue-900 p-4 rounded-md text-blue-300 whitespace-pre-wrap">
              {mitigation}
            </div>
          </div>
        )}

        {anomalyData && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">
              Anomaly Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featureNames.map((name) => (
                <div key={name} className="bg-gray-700 p-3 rounded-md">
                  <span className="font-medium text-gray-300 block mb-1">
                    {name}
                  </span>
                  <span className="text-gray-100">
                    {typeof anomalyData[name] === "number"
                      ? anomalyData[name].toFixed(6)
                      : anomalyData[name]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
