import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Papa from "papaparse";

export default function SnowDataVisualizer() {
  const [openRunsData, setOpenRunsData] = useState([]);
  const [baseSnowData, setBaseSnowData] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "data/MySnowData.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const filtered = results.data.filter(
              (row) => row["Date in season"] !== "Out of season"
            );

            // Prepare base snow data (simple flat array)
            const baseSnowParsed = filtered.map((row) => ({
              date: row["snapshot_date"],
              baseSnow: parseFloat(row["base_snow"] || 0),
            }));

            // Prepare open runs % data, pivoted by season
            const pivotedByDate = {};

            filtered.forEach((row) => {
              const date = row["snapshot_date"];
              const season = row["season"];
              const openRunsPct = parseFloat(row["Open Runs %"].replace("%", ""));

              if (!pivotedByDate[date]) {
                pivotedByDate[date] = { date };
              }

              pivotedByDate[date][season] = openRunsPct;
            });

            const openRunsParsed = Object.values(pivotedByDate).sort(
              (a, b) => new Date(a.date) - new Date(b.date)
            );

            setOpenRunsData(openRunsParsed);
            setBaseSnowData(baseSnowParsed);
          },
        });
      });
  }, []);

  const seasonKeys = openRunsData.length
    ? Object.keys(openRunsData[0]).filter((key) => key !== "date")
    : [];

  const colors = ["#8884d8", "#82ca9d", "#ff7300", "#ff0000", "#00bcd4", "#ffc658", "#a28ae5"];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Arapahoe Basin Snow Report</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Open Runs % Over Time by Season</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={openRunsData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip />
            <Legend />
            {seasonKeys.map((season, index) => (
              <Line
                key={season}
                type="monotone"
                dataKey={season}
                stroke={colors[index % colors.length]}
                name={`Open Runs % (${season})`}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Base Snow Depth (inches)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={baseSnowData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="baseSnow"
              stroke="#82ca9d"
              name="Base Snow (in)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
