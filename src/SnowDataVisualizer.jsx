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
  const [metric, setMetric] = useState("runs"); // "runs" or "lifts"

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/MySnowData.csv')
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const filtered = results.data.filter(
              (row) => row["Date in season"]?.trim() !== "Out of Season"
            );

            const seasonGroups = {};

            filtered.forEach((row) => {
              const season = row["Season"];
              const snapshotDate = row["snapshot_date"];
              const monthDay = formatMonthDay(snapshotDate);
              const openRunsPct = parseFloat(row["Open Runs %"]?.replace("%", "") || 0);
              const openLiftsPct = parseFloat(row["Open Lifts %"]?.replace("%", "") || 0);

              if (!seasonGroups[season]) seasonGroups[season] = [];
              seasonGroups[season].push({
                date: monthDay,
                openRunsPct,
                openLiftsPct,
              });
            });

            setDataBySeason(seasonGroups);
          },
        });
      });
  }, []);

  function formatMonthDay(dateStr) {
    const parts = dateStr.split("-");
    return parts.length === 3 ? `${parts[1]}-${parts[2]}` : dateStr;
  }

  function getColorForSeason(season) {
    const palette = ["#8884d8", "#82ca9d", "#ff7300", "#ffc658", "#ff0000", "#00c49f", "#0088fe"];
    const seasonIndex = parseInt(season.split("-")[0]) % palette.length;
    return palette[seasonIndex];
  }

  const orderedDays = [];
  for (let month = 10; month <= 12; month++) {
    for (let day = 1; day <= 31; day++) {
      const d = String(day).padStart(2, '0');
      orderedDays.push(`${month}-${d}`);
    }
  }
  for (let month = 1; month <= 6; month++) {
    for (let day = 1; day <= 31; day++) {
      const d = String(day).padStart(2, '0');
      orderedDays.push(`${String(month).padStart(2, '0')}-${d}`);
    }
  }

  const allDatesSet = new Set();
  Object.values(dataBySeason).forEach((entries) => {
    entries.forEach(({ date }) => allDatesSet.add(date));
  });

  const allDates = orderedDays.filter((date) => allDatesSet.has(date));

  const combinedData = allDates.map((date) => {
    const row = { date };
    for (const season of Object.keys(dataBySeason)) {
      const entry = dataBySeason[season].find((d) => d.date === date);
      if (entry) {
        row[season] = metric === "runs" ? entry.openRunsPct : entry.openLiftsPct;
      }
    }
    return row;
  });

  const seasons = Object.keys(dataBySeason);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Arapahoe Basin Snow Report</h1>

      <div className="mb-4">
        <label className="mr-2 font-medium">Metric:</label>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="runs">Open Runs %</option>
          <option value="lifts">Open Lifts %</option>
        </select>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          {metric === "runs" ? "Open Runs %" : "Open Lifts %"} Over Time by Season
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip />
            <Legend />
            {seasons.map((season) => (
              <Line
                key={season}
                type="monotone"
                dataKey={season}
                stroke={getColorForSeason(season)}
                dot={false}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

