import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(0.7);

  const introduceAnomaly = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/introduce_anomaly", {
        method: "POST",
      });
      console.log(await res.json());
    } catch (error) {
      console.error("Error introducing anomaly:", error);
    } finally {
      setLoading(false);
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
          if(response.ok){
            setMitigation((await response.json()).raw_output);
          }
        } catch (error) {
          // setMitigation(`Error: ${error.message}`);
          console.log(`Error: ${error.message}`);
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
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="colorProbability"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
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
                <ReferenceLine
                  y={threshold}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    value: "Threshold",
                    position: "insideTopRight",
                    fill: "#ef4444",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke="#f97316"
                  fill="url(#colorProbability)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    stroke: "#ea580c",
                    strokeWidth: 2,
                    r: 6,
                    fill: "#fdba74",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
              <span>Anomaly Threshold: {threshold.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={introduceAnomaly}
            disabled={loading}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex-1 flex items-center justify-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Trigger Anomaly"
            )}
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
                      ? anomalyData[name].toFixed(3)
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
