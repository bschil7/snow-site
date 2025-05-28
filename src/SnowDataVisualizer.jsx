import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Papa from "papaparse";

export default function SnowDataVisualizer() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/myfile.csv')
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data.map((row) => {
              return {
                date: row["snapshot_date"],
                openRunsPct: parseFloat(row["Open Runs %"].replace("%", "")),
                baseSnow: parseFloat(row["base_snow"] || 0),
              };
            });
            setData(parsed);
          },
        });
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Arapahoe Basin Snow Report</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Open Runs % Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <Line type="monotone" dataKey="openRunsPct" stroke="#8884d8" name="Open Runs %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Base Snow Depth (inches)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="baseSnow" stroke="#82ca9d" name="Base Snow (in)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
