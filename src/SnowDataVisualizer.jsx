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
  const [dataBySeason, setDataBySeason] = useState({});

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/MySnowData.csv')
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const filtered = results.data.filter(
              (row) =>
                row["Date in season"] !== "Out of Season"
            );

            const seasonGroups = {};

            filtered.forEach((row) => {
              const season = row["Season"];
              const snapshotDate = row["snapshot_date"];
              const monthDay = formatMonthDay(snapshotDate);
              const openRunsPct = parseFloat(row["Open Runs %"]?.replace("%", "") || 0);

              if (!seasonGroups[season]) seasonGroups[season] = [];

              seasonGroups[season].push({
                date: monthDay, // Just MM-DD
                openRunsPct,
              });
            });

            setDataBySeason(seasonGroups);
          },
        });
      });
  }, []);

  // Converts YYYY-MM-DD to MM-DD
  function formatMonthDay(dateStr) {
    const parts = dateStr.split("-");
    return parts.length === 3 ? `${parts[1]}-${parts[2]}` : dateStr;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Arapahoe Basin Snow Report</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Open Runs % Over Time by Season</h2>
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {seasons.map((season) => (
                    <Line
                        key={season}
                        type="monotone"
                        dataKey={season}
                        stroke={getColorForSeason(season)}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}
