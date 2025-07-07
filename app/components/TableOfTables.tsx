import React from "react";
import { User } from "../appState";
import { Loader } from "./Loader";
import { Stat, StatsData } from "./StatsData";

export interface TableOfTablesProps {
    user: User | null;
    stats: StatsData;
    getCellColor: (stat: Stat) => string;
    getDisplayText: (stat: Stat) => string | React.ReactNode;
    loading: boolean;
}

const TableOfTables: React.FC<TableOfTablesProps> = ({ user, stats, getCellColor, loading, getDisplayText }) => {
    const { minTable, maxTable } = user || { minTable: 2, maxTable: 9 };
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
                        {getDisplayText(stat)}
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
            {loading ? <Loader /> : (
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
        </div>
    );
};


export default TableOfTables;