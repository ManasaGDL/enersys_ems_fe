"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/utils/api";

type Project = {
    id: string;
    name: string;
    description?: string | null;
    status: "ACTIVE" | "INACTIVE";
};

export default function ProjectsPage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_URL}/api/projects`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch projects");
            const data = await res.json();
            console.log(data);
            setProjects(data?.projects);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this project?");
        if (!confirmDelete) return;

        try {
            setDeletingId(id);

            const res = await fetch(`${API_URL}/api/projects/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("Failed to delete project");

            await fetchProjects();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-6 text-black">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Projects</h1>
                    <p className="text-sm text-gray-500">
                        Create projects, edit details, and assign employees.
                    </p>
                </div>

                <button
                    onClick={() => router.push("/projects/create")}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                    + Add Project
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                    Loading projects...
                </div>
            )}

            {/* Empty */}
            {!loading && projects.length === 0 && (
                <div className="bg-white border rounded-xl p-8 shadow-sm text-center">
                    <h2 className="text-lg font-medium">No projects found</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Create your first project to start assigning employees.
                    </p>
                    <button
                        onClick={() => router.push("/projects/create")}
                        className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
                    >
                        Create Project
                    </button>
                </div>
            )}

            {/* Projects Table */}
            {!loading && projects.length > 0 && (
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="text-left p-4">Project</th>
                                <th className="text-left p-4">Description</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-right p-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {projects.map((p) => (
                                <tr key={p.id} className="border-t">
                                    <td className="p-4 font-medium">{p.name}</td>
                                    <td className="p-4 text-gray-600">
                                        {p.description || "—"}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === "ACTIVE"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-200 text-gray-700"
                                                }`}
                                        >
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => router.push(`/projects/${p.id}`)}
                                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
                                            >
                                                Assign
                                            </button>

                                            <button
                                                onClick={() => router.push(`/projects/edit/${p.id}`)}
                                                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:opacity-90"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                disabled={deletingId === p.id}
                                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:opacity-90 disabled:opacity-50"
                                            >
                                                {deletingId === p.id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
