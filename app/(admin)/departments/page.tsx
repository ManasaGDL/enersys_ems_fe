"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { API_URL } from "@/app/utils/api";
type Department = {
    id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE";
};

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /* ---------------- FETCH ---------------- */
    const fetchDepartments = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/departments`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await res.json();
        setDepartments(data.data);
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    /* ---------------- CREATE ---------------- */
    const createDepartment = async () => {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/api/departments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });
    };

    /* ---------------- EDIT ---------------- */
    const updateDepartment = async (id: string) => {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/api/departments/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });
    };

    /* ---------------- DELETE ---------------- */
    const deleteDepartment = async (id: string) => {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/api/departments/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    };

    /* ---------------- STATUS TOGGLE ---------------- */
    const toggleStatus = async (dept: Department) => {
        const token = localStorage.getItem("token");
        await fetch(
            `${API_URL}/api/departments/${dept.id}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: dept.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                }),
            }
        );
    };

    /* ---------------- SAVE HANDLER ---------------- */
    const handleSave = async () => {
        if (!name.trim()) {
            alert("Department name required");
            return;
        }

        setLoading(true);

        if (editingId) {
            await updateDepartment(editingId);
        } else {
            await createDepartment();
        }

        setName("");
        setEditingId(null);
        await fetchDepartments();
        setLoading(false);
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="space-y-6 text-black">
            <h1 className="text-xl font-semibold">Departments</h1>

            {/* FORM */}
            <div className="border rounded bg-gray-50 p-4">
                <h2 className="font-medium mb-3">
                    {editingId ? "Edit Department" : "Add Department"}
                </h2>

                <div className="flex gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">
                            Department Name
                        </label>
                        <input
                            className="border px-3 py-2 rounded w-64 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter department name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {editingId ? "Update" : "Add"}
                    </button>

                    {editingId && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setName("");
                            }}
                            className="text-gray-600 px-3 py-2"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* TABLE */}
            <div className="border rounded overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {departments.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="text-center py-6 text-gray-500"
                                >
                                    No departments found
                                </td>
                            </tr>
                        ) : (
                            departments.map((dept) => (
                                <tr
                                    key={dept.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="px-4 py-2">{dept.name}</td>

                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full font-medium
                        ${dept.status === "ACTIVE"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-200 text-gray-600"
                                                }`}
                                        >
                                            {dept.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setEditingId(dept.id);
                                                setName(dept.name);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Edit"
                                        >
                                            <Pencil size={18} />
                                        </button>

                                        <button
                                            onClick={async () => {
                                                if (!confirm("Delete this department?")) return;
                                                await deleteDepartment(dept.id);
                                                fetchDepartments();
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <button
                                            onClick={async () => {
                                                await toggleStatus(dept);
                                                fetchDepartments();
                                            }}
                                            title="Toggle status"
                                        >
                                            {dept.status === "ACTIVE" ? (
                                                <ToggleRight
                                                    size={22}
                                                    className="text-green-600"
                                                />
                                            ) : (
                                                <ToggleLeft
                                                    size={22}
                                                    className="text-gray-400"
                                                />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
