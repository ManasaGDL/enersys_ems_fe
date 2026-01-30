"use client";

import { useRouter } from "next/navigation";

export default function Header() {
    const router = useRouter();

    const logout = () => {
        localStorage.removeItem("isAuthenticated");
        router.push("/login");
    };

    return (
        <header className="h-12 border-b flex items-center justify-between px-6 bg-white">
            <span className="font-semibold text-black">Admin Panel</span>
            <button
                onClick={logout}
                className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
            >
                Logout
            </button>
        </header>
    );
}
