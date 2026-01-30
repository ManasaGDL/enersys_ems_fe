"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/app/utils/api";

const formatSegment = (segment: string) => {
    if (!segment) return "";
    if (segment === "create") return "Create";
    if (segment === "edit") return "Edit";

    return segment
        .replaceAll("-", " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

// ✅ small helper to detect prisma cuid-ish ids
const looksLikeId = (value: string) => {
    return value.length >= 20; // cuid usually long
};

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

    const [projectName, setProjectName] = useState<string>("");

    // ✅ find projectId if route looks like /projects/:id or /projects/edit/:id
    const projectId = useMemo(() => {
        const projectsIndex = segments.indexOf("projects");
        if (projectsIndex === -1) return null;

        // /projects/:id
        const possibleId = segments[projectsIndex + 1];

        // ignore create/edit
        if (!possibleId) return null;
        if (possibleId === "create" || possibleId === "edit") return null;

        // /projects/:id exists
        return possibleId;
    }, [segments]);

    useEffect(() => {
        const fetchProjectName = async () => {
            try {
                if (!projectId || !looksLikeId(projectId)) return;

                const token = localStorage.getItem("token");

                const res = await fetch(`${API_URL}/api/projects/${projectId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) return;

                const data = await res.json();
                setProjectName(data?.name || "");
            } catch (err) {
                console.log("Breadcrumb Project fetch error:", err);
            }
        };

        fetchProjectName();
    }, [projectId]);

    if (segments.length === 0) return null;

    let currentPath = "";

    return (
        <div className="mb-5">
            <nav className="text-sm text-gray-500 flex items-center flex-wrap gap-2">
                <Link href="/dashboard" className="hover:text-black">
                    Home
                </Link>

                {segments.map((seg, index) => {
                    currentPath += `/${seg}`;
                    const isLast = index === segments.length - 1;

                    // ✅ Replace projectId with projectName
                    const label =
                        seg === projectId && projectName ? projectName : formatSegment(seg);

                    return (
                        <div key={index} className="flex items-center gap-2">
                            <span className="text-gray-300">/</span>

                            {isLast ? (
                                <span className="text-gray-900 font-medium">{label}</span>
                            ) : (
                                <Link href={currentPath} className="hover:text-black">
                                    {label}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
