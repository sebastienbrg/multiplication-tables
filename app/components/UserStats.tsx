import React, { useEffect, useState, useCallback } from "react";
import { User } from "../appState";
import TableOfTables from "./TableOfTables";
import { StatsData, Stat } from "./StatsData";
import { getCellColorErrorRate, getDisplayTextResponseTime } from "../tools/statsDisplayTools";

type UserStatsProps = {
    user: User;
};



// Fetch user stats from API
async function fetchUserStats(userId: number): Promise<{ operations: StatsData, minTable: number, maxTable: number }> {
    const res = await fetch(`/api/multiplication/stats?userId=${userId}`);
    if (!res.ok) return { operations: {}, minTable: 2, maxTable: 10 };
    const data = await res.json();
    // API returns operations as an object already
    return { operations: data.operations, minTable: data.minTable, maxTable: data.maxTable };
}

const UserStats: React.FC<UserStatsProps> = ({ user }) => {
    const [stats, setStats] = useState<StatsData>({});
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<"correctOrNot" | "responseTime">("responseTime");

    useEffect(() => {
        setLoading(true);
        fetchUserStats(user.id).then((data: { operations: StatsData }) => {
            setStats(data.operations);
            console.log(data.operations);
            setLoading(false);
        });
    }, [user.id]);

    // const getDisplayText = (stat: Stat) => {
    //     return stat ? `${stat.correct} / ${stat.correct + stat.incorrect}` : "-";
    // };
    const getDisplayText = useCallback((stat: Stat) => {
        if (!user) {
            return "-";
        }
        if (mode === "correctOrNot") {
            return stat ? `${stat.correct} / ${stat.correct + stat.incorrect}` : "-";
        }
        return getDisplayTextResponseTime(stat, user);
    }, [user, mode]);

    return (
        <div>
            <h3>
                Stats pour <span className="text-blue-600">{user.name}</span>
            </h3>
            <div className="mb-4">
                <button
                    className={`px-4 py-2 mr-2 rounded ${mode === "responseTime" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setMode("responseTime")}
                >
                    Temps de réponse
                </button>
                <button
                    className={`px-4 py-2 rounded ${mode === "correctOrNot" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setMode("correctOrNot")}
                >
                    Bonnes réponses
                </button>
            </div>
            <TableOfTables
                user={user}
                stats={stats}
                getCellColor={getCellColorErrorRate}
                getDisplayText={getDisplayText}
                loading={loading}
            />
            <div className="text-lg text-gray-600">
                <span className="bg-gray-300 px-2 mr-2">Jamais demandé</span>
                <span className="bg-green-500 px-2 mr-2 text-white">100% juste</span>
                <span className="bg-red-500 px-2 text-black">100% faux</span>
            </div>
        </div>
    );
};

export default UserStats;