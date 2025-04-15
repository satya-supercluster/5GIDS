
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

function MonitoringPanel({
  chartData,
  threshold,
  setThreshold,
  featureBarData,
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Monitoring Panel
      </h2>

      {/* Line Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#ccc" />
            <YAxis domain={[0, 1]} stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="probability" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Threshold slider */}
      <div className="mb-6">
        <label className="text-white">
          Detection Threshold: {threshold.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}

export default MonitoringPanel;
