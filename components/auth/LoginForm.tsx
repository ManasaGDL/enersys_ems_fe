"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_URL } from "@/app/utils/api";

export default function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const adminLogin = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/super-admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Invalid credentials");
            }

            localStorage.setItem("token", data.token);
            router.push("/dashboard");
        } catch (e: any) {
            setError(e.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);
        adminLogin(email, password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* LEFT: BRAND / LOGO SECTION */}
                <div className="hidden md:flex flex-col justify-center items-center bg-slate-900 text-white p-12">
                    {/* Logo placeholder */}
                    <div className="h-16 w-16 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold mb-6">
                        LOGO
                    </div>

                    <h1 className="text-3xl font-semibold mb-4 text-center">
                        Admin Portal
                    </h1>

                    <p className="text-slate-300 text-center max-w-sm">
                        Secure access to the administration dashboard.
                        Manage users, data, and settings from one place.
                    </p>
                </div>

                {/* RIGHT: LOGIN FORM */}
                <div className="flex flex-col justify-center p-10 md:p-14">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                        Sign in
                    </h2>

                    <p className="text-slate-500 mb-8">
                        Enter your credentials to continue
                    </p>

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-slate-900 py-3 text-white font-medium hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
