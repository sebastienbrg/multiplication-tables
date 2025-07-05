import React, { useEffect, useState } from "react";
import UserStats from "./UserStats";

interface SelectUserProps {
    onSelect: (user: string) => void;
}

const Loader = () => (
    <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
    </div>
);

const SelectUser: React.FC<SelectUserProps> = ({ onSelect }) => {
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showStats, setShowStats] = useState<string | null>(null);
    // Fetch users from backend
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const res = await fetch("/api/users");
            if (!res.ok) {
                setUsers([]);
                setLoading(false);
                return;
            }
            const data = await res.json();
            setUsers(data.users?.map((u: { name: string }) => u.name) || []);
            setLoading(false);
        };
        fetchUsers();
    }, []);



    return <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <h1 className="text-3xl font-bold mb-4">{"Qui s'entraine?"}</h1>
        <div className="flex gap-6 flex-col ">
            {loading ? <Loader /> : users.map((user) => (
                <div key={user} className="flex items-center gap-2">
                    <button
                        className="px-6 w-48 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                        onClick={() => onSelect(user)}
                    >
                        {user}
                    </button>
                    <button
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-blue-700 text-xl"
                        title="Voir les stats"
                        onClick={() => setShowStats(user)}
                    >
                        📊
                    </button>
                </div>
            ))}
        </div>

        {showStats && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="fixed inset-0 bg-black bg-opacity-40"
                    onClick={() => setShowStats(null)}
                />
                <div className="relative bg-white rounded-lg shadow-lg p-6 z-10 max-w-2xl w-full max-h-[90vh] overflow-auto">
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                        onClick={() => setShowStats(null)}
                        title="Fermer"
                    >
                        ×
                    </button>
                    <UserStats userName={showStats} />
                </div>
            </div>
        )}
    </div>
};

export default SelectUser;
