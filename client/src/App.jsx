import { useState, useEffect } from "react";

import Dashboard from "./components/Dashboard";
import AnomalyFeaturePanel from "./components/AnomalyFeaturePanel";
import MitigationPanel from "./components/MitigationPanel";
import ControlPanel from "./components/ControlPanel";
import MonitoringPanel from "./components/MonitoringPanel";

function App() {
  const [chartData, setChartData] = useState([]);
  const [anomalyData, setAnomalyData] = useState(null);
  const [mitigation, setMitigation] = useState("");
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(0.7);
  const [healLoading, setHealLoading] = useState(false);

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
        setHealLoading(true);
        try {
          const response = await fetch(
            `http://localhost:8080/heal?anomaly=${encodeURIComponent(
              JSON.stringify(data.features)
            )}`
          );
          if (response.ok) {
            setMitigation((await response.json()).raw_output);
          }
        } catch (error) {
          console.log(`Error: ${error.message}`);
        } finally {
          setHealLoading(false);
        }
      }
    };

    return () => ws.close();
  }, []);

  const featureBarData =
    anomalyData &&
    Object.entries(anomalyData).map(([key, value]) => ({
      name: key,
      value: typeof value === "number" ? Number(value.toFixed(3)) : value,
    }));

  return (
    <Dashboard>
      <MonitoringPanel
        chartData={chartData}
        threshold={threshold}
        setThreshold={setThreshold}
        featureBarData={featureBarData}
      />
      <ControlPanel
        introduceAnomaly={introduceAnomaly}
        clearData={clearData}
        loading={loading}
      />

      {(mitigation || healLoading) && (
        <MitigationPanel mitigation={mitigation} isLoading={healLoading} />
      )}

      {anomalyData && <AnomalyFeaturePanel anomalyData={anomalyData} />}
    </Dashboard>
  );
}

export default App;
