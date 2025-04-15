import featureNames from "../utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function AnomalyFeaturePanel({ anomalyData }) {
  // Prepare data for the bar chart
  const barChartData = featureNames
    .filter(({ key }) => typeof anomalyData[key] === "number")
    .map(({ key, label }) => ({
      name: label,
      value: anomalyData[key],
    }));

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">
        Anomaly Features
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {featureNames.map(({ key, label }) => (
          <div key={key} className="bg-gray-700 p-3 rounded-md">
            <span className="font-bold text-lg text-gray-300 block mb-1">
              {label}
            </span>
            <span className="text-gray-100">
              {typeof anomalyData[key] === "number"
                ? anomalyData[key].toFixed(3)
                : anomalyData[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Bar Chart for Feature Values */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">
          Feature Snapshot
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis
                dataKey="name"
                stroke="#ccc"
                tick={{ fill: "#ccc", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis stroke="#ccc" tick={{ fill: "#ccc" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  color: "#f3f4f6",
                }}
              />
              <Bar dataKey="value" fill="#11ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnomalyFeaturePanel;
