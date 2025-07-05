import React, { useEffect, useState } from "react";

type UserStatsProps = {
    userName: string;
};

type Stat = {
    correct: number;
    incorrect: number;
};

type StatsData = {
    [question: string]: Stat; // e.g. "3x4": { correct: 2, incorrect: 1 }
};

// Helper to compute error rate and color
function getCellColor(stat?: Stat) {
    if (!stat || stat.correct + stat.incorrect === 0) {
        return "#cccccc"; // grey
    }
    const total = stat.correct + stat.incorrect;
    const errorRate = stat.incorrect / total;
    // Interpolate from green (#4caf50) to red (#f44336)
    // errorRate 0 => green, 1 => red
    const r = Math.round(76 + (244 - 76) * errorRate);
    const g = Math.round(175 + (67 - 175) * errorRate);
    const b = Math.round(80 + (54 - 80) * errorRate);
    return `rgb(${r},${g},${b})`;
}

function getErrorRate(stat?: Stat) {
    if (!stat || stat.correct + stat.incorrect === 0) return "-";
    const total = stat.correct + stat.incorrect;
    const errorRate = (stat.incorrect / total) * 100;
    return `${errorRate.toFixed(0)}%`;
}

// Fetch user stats from API
async function fetchUserStats(userName: string): Promise<{ operations: StatsData, minTable: number, maxTable: number }> {
    const res = await fetch(`/api/multiplication/stats?user=${encodeURIComponent(userName)}`);
    if (!res.ok) return { operations: {}, minTable: 2, maxTable: 10 };
    const data = await res.json();
    // API returns operations as an object already
    return { operations: data.operations, minTable: data.minTable, maxTable: data.maxTable };
}

const UserStats: React.FC<UserStatsProps> = ({ userName }) => {
    const [stats, setStats] = useState<StatsData>({});
    const [loading, setLoading] = useState(true);
    const [maxTable, setMaxTable] = useState(10);
    const [minTable, setMinTable] = useState(2);

    useEffect(() => {
        setLoading(true);
        fetchUserStats(userName).then((data: { operations: StatsData, minTable: number, maxTable: number }) => {
            setStats(data.operations);
            setMaxTable(data.maxTable || 10);
            setMinTable(data.minTable || 2);
            setLoading(false);
        });
    }, [userName]);

    const rows = [];
    for (let i = minTable; i <= maxTable; i++) {
        const cells = [];
        for (let j = 2; j < 10; j++) {
            const stat = stats[`${i}x${j}`];
            cells.push(
                <td
                    key={j}
                    style={{
                        background: getCellColor(stat),
                        color: "#222",
                        textAlign: "center",
                        minWidth: 60,
                        padding: "8px 4px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                    }}

                >

                    <span style={{ fontSize: "1.2em", color: "#555" }}>
                        {stat ? `${stat.correct} / ${stat.correct + stat.incorrect}` : "-"}
                    </span>

                </td>
            );
        }
        rows.push(
            <tr key={i}>
                <th style={{ textAlign: "right", paddingRight: 8 }}>{i} ×</th>
                {cells}
            </tr>
        );
    }

    return (
        <div>
            <h3>Stats pour <span style={{ color: "#1976d2" }}>{userName}</span></h3>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table style={{ borderCollapse: "collapse", margin: "1em 0" }}>
                    <thead>
                        <tr>
                            <th></th>
                            {Array.from({ length: 8 }, (_, i) => (

                                <th key={i + 2} style={{ textAlign: "center" }}>{i + 2}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            )}
            <div style={{ fontSize: "1.2em", color: "#666" }}>
                <span style={{ background: "#cccccc", padding: "0 8px", marginRight: 8 }}>Jamais demandé</span>
                <span style={{ background: "#4caf50", padding: "0 8px", marginRight: 8, color: "white" }}>100% juste</span>
                <span style={{ background: "#f44336", padding: "0 8px", color: "black" }}>100% faux</span>
            </div>
        </div>
    );
};

export default UserStats;