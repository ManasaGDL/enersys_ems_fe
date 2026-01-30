"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    useEffect(() => {
        const isAuth = localStorage.getItem("token");

        if (!isAuth) {
            router.push("/login");
        }
        else {
            setChecking(false);
        }
    }, []);
    if (checking) {
        return null;
    }
    return <>{children}</>
}