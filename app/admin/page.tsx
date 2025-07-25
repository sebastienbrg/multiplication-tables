"use client";
import React, { useEffect, useState } from "react";

interface User {
    id: number;
    name: string;
    minTable: number;
    maxTable: number;
    password: string;
    maxResponseTime: number;
    targetResponseTime: number;
}

const AdminPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editUser, setEditUser] = useState<string | null>(null);
    const [minTable, setMinTable] = useState<number>(2);
    const [maxTable, setMaxTable] = useState<number>(9);
    const [maxResponseTime, setMaxResponseTime] = useState<number>(9);
    const [targetResponseTime, setTargetResponseTime] = useState<number>(3);
    const [password, setPassword] = useState<string>('');
    const [addingUser, setAddingUser] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data.users || []);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('Unknown error');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const startEdit = (user: User) => {
        setEditUser(user.name);
        setMinTable(user.minTable);
        setMaxTable(user.maxTable);
        setPassword(user.password);
        setMaxResponseTime(user.maxResponseTime);
        setTargetResponseTime(user.targetResponseTime);
    };

    const saveEdit = async (user: User) => {
        const res = await fetch("/api/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: user.name, minTable, maxTable, maxResponseTime, targetResponseTime, password }),
        });
        if (!res.ok) {
            alert("Failed to update user");
            return;
        }
        setEditUser(null);
        fetchUsers();
    };

    const deleteUser = async (user: User) => {
        if (!confirm(`Supprimer l'utilisateur ${user.name} ?`)) return;
        const res = await fetch(`/api/users?userId=${(user.id)}`, { method: "DELETE" });
        if (!res.ok) {
            alert("Failed to delete user");
            return;
        }
        fetchUsers();
    };

    const deleteResults = async (user: User) => {
        if (!confirm(`Supprimer tous les résultats de ${user.name} ?`)) return;
        const res = await fetch(`/api/result?userId=${user.id}`, { method: "DELETE" });
        if (!res.ok) {
            alert("Failed to delete results");
            return;
        }
        alert("Résultats supprimés");
    };

    const createNewUser = async (username: string) => {
        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: username }),
        });
        if (!res.ok) {
            console.error("Failed to create user:", await res.text());
            return;
        }
        const newUser = await res.json();
        setUsers((prev) => [...prev, newUser.name]);
        setAddingUser(false);
        fetchUsers();
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Admin: Gestion des utilisateurs</h1>
            {loading ? (
                <div>Chargement...</div>
            ) : error ? (
                <div className="text-red-600">Erreur: {error}</div>
            ) : (
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2">Nom</th>
                            <th className="p-2">minTable</th>
                            <th className="p-2">maxTable</th>
                            <th className="p-2">Temps max (s)</th>
                            <th className="p-2">Temps cible (s)</th>
                            <th className="p-2">Mot de passe</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.name} className="border-t">
                                <td className="p-2 font-mono">{user.name}</td>
                                <td className="p-2">
                                    {editUser === user.name ? (
                                        <input
                                            type="number"
                                            min={2}
                                            max={maxTable}
                                            value={minTable}
                                            onChange={e => setMinTable(Number(e.target.value))}
                                            className="w-16 border rounded px-2"
                                        />
                                    ) : (
                                        user.minTable
                                    )}
                                </td>
                                <td className="p-2">
                                    {editUser === user.name ? (
                                        <input
                                            type="number"
                                            min={2}
                                            max={9}
                                            value={maxTable}
                                            onChange={e => setMaxTable(Number(e.target.value))}
                                            className="w-16 border rounded px-2"
                                        />
                                    ) : (
                                        user.maxTable
                                    )}
                                </td>
                                <td className="p-2">
                                    {editUser === user.name ? (
                                        <input
                                            type="number"
                                            min={3}
                                            max={12}
                                            value={maxResponseTime}
                                            onChange={e => setMaxResponseTime(Number(e.target.value))}
                                            placeholder="Temps max (s)"
                                            className="border rounded px-2 w-32"
                                        />
                                    ) : (
                                        user.maxResponseTime
                                    )}
                                </td>
                                <td className="p-2">
                                    {editUser === user.name ? (
                                        <input
                                            type="text"
                                            value={targetResponseTime}
                                            onChange={e => setTargetResponseTime(Number(e.target.value))}
                                            placeholder="Temps cible (s)"
                                            className="border rounded px-2 w-32"
                                        />
                                    ) : (
                                        user.targetResponseTime
                                    )}
                                </td>
                                <td className="p-2">
                                    {editUser === user.name ? (
                                        <input
                                            type="text"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Mot de passe"
                                            className="border rounded px-2 w-40"
                                        />
                                    ) : (
                                        "******"
                                    )}
                                </td>
                                <td className="p-2 flex gap-2">
                                    {editUser === user.name ? (
                                        <>
                                            <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => saveEdit(user)}>💾</button>
                                            <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => setEditUser(null)}>Annuler</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="px-2 py-1 text-white rounded" onClick={() => startEdit(user)}>✏️</button>
                                            <button className="px-2 py-1 bg-grey-900 text-white rounded" onClick={() => deleteUser(user)}>🗑️</button>
                                            <button className="px-2 py-1 bg-red-300 text-black rounded" onClick={() => deleteResults(user)}>Effacer résultats</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div key="add-user" className="mt-4">
                {addingUser
                    ? <><p className="text-lg text-gray-600">Nom d&apos;utilisateur:</p>
                        <input
                            type="text"
                            className="border px-4 py-2 rounded text-lg w-64"
                            placeholder="Nouveau nom d'utilisateur"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    createNewUser(e.currentTarget.value.trim());
                                }
                            }}
                        />
                        <p className="text-sm text-gray-500 mt-2">Appuyez sur <b>Entrée</b> pour valider</p>

                    </> :
                    <button
                        className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg hover:bg-green-700 transition"
                        onClick={() => setAddingUser(true)}
                    >
                        Ajouter un utilisateur
                    </button>
                }
            </div>
        </div>
    );
};

export default AdminPage;
