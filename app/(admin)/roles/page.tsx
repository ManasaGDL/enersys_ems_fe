"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { API_URL } from "@/app/utils/api";

type Role = {
    id: string;
    title: string;
    status: "ACTIVE" | "INACTIVE";
};

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [title, setTitle] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /* ---------------- FETCH ROLES ---------------- */
    const fetchRoles = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/roles`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await res.json();
        setRoles(data.data);
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    /* ---------------- CREATE ROLE ---------------- */
    const createRole = async () => {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/api/roles`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title }),
        });
    };

    /* ---------------- EDIT ROLE NAME ---------------- */
    const updateRole = async (id: string) => {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/api/roles/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title }),
        });
    };

    /* ---------------- DELETE ROLE ---------------- */
    const deleteRole = async (id: string) => {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/api/roles/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    };

    /* ---------------- TOGGLE ROLE STATUS ---------------- */
    const toggleRoleStatus = async (role: Role) => {
        const token = localStorage.getItem("token");
        await fetch(
            `${API_URL}/api/roles/${role.id}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: role.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                }),
            }
        );
    };

    /* ---------------- SAVE HANDLER ---------------- */
    const handleSave = async () => {
        if (!title.trim()) {
            alert("Role title required");
            return;
        }

        setLoading(true);

        if (editingId) {
            await updateRole(editingId);
        } else {
            await createRole();
        }

        setTitle("");
        setEditingId(null);
        await fetchRoles();
        setLoading(false);
    };

    return (
        <div className="space-y-6 text-black">
            <h1 className="text-xl font-semibold">Roles</h1>

            {/* ADD / EDIT FORM */}
            <div className="border rounded bg-gray-50 p-4">
                <h2 className="font-medium mb-3">
                    {editingId ? "Edit Role" : "Add Role"}
                </h2>

                <div className="flex gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-600">
                            Role Name
                        </label>
                        <input
                            className="border px-3 py-2 rounded w-64 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter role name"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                                setTitle("");
                            }}
                            className="text-gray-600 px-3 py-2"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* ROLES TABLE */}
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
                        {roles.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="text-center py-6 text-gray-500"
                                >
                                    No roles found
                                </td>
                            </tr>
                        ) : (
                            roles.map((role) => (
                                <tr
                                    key={role.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="px-4 py-2">{role.title}</td>

                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full font-medium
                        ${role.status === "ACTIVE"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-200 text-gray-600"
                                                }`}
                                        >
                                            {role.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setEditingId(role.id);
                                                setTitle(role.title);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Edit"
                                        >
                                            <Pencil size={18} />
                                        </button>

                                        <button
                                            onClick={async () => {
                                                if (!confirm("Delete this role?")) return;
                                                await deleteRole(role.id);
                                                fetchRoles();
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <button
                                            onClick={async () => {
                                                await toggleRoleStatus(role);
                                                fetchRoles();
                                            }}
                                            title="Toggle status"
                                        >
                                            {role.status === "ACTIVE" ? (
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
