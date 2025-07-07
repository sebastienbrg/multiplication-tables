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
                    className={`p-1 sm:p-2 text-center font-bold border border-gray-200 bg-opacity-80`}
                    style={{ background: getCellColor(stat), color: "#222", minWidth: 32, maxWidth: 44 }}
                >

                    {getDisplayText(stat)}

                </td>
            );
        }
        rows.push(
            <tr key={i} className="hover:bg-blue-50 transition">
                <th className="text-right pr-2 bg-blue-50 text-blue-900 font-semibold border border-gray-200">{i}</th>
                {cells}
            </tr>
        );
    }
    return (
        <div className="overflow-x-auto w-full">
            {loading ? <Loader /> : (
                <table className="border-collapse w-full text-center bg-white rounded-lg shadow overflow-hidden">
                    <thead>
                        <tr>
                            <th className="bg-blue-100 text-gray-700 font-semibold p-2"></th>
                            {Array.from({ length: 8 }, (_, i) => (
                                <th key={i + 2} className="bg-blue-100 text-gray-700 font-semibold p-2">{i + 2}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TableOfTables;