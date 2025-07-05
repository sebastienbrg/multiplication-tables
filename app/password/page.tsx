"use client";
import { useState } from "react";

export default function PasswordPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetch("/api/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        })
            .then((res) => {
                if (res.ok) {
                    window.location.href = "/";
                } else {
                    setError("Mot de passe incorrect");
                }
            });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-xs w-full flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Mot de passe</h1>
                <input
                    type="password"
                    className="border px-4 py-2 rounded text-lg"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Entrez le mot de passe"
                />
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <button type="submit" className="bg-blue-600 text-white py-2 rounded">Valider</button>
            </form>
        </div>
    );
}
