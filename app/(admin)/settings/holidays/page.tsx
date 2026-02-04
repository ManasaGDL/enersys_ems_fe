"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/app/utils/api";

type Holiday = {
    id: string;
    date: string; // ISO string
    name?: string | null;
    isActive: boolean;
};

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ✅ Convert ISO date -> yyyy-mm-dd for input[type="date"]
function toInputDate(isoDate: string) {
    const d = new Date(isoDate);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function HolidaysSettingsPage() {
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());

    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // ✅ add holiday form
    const [holidayDate, setHolidayDate] = useState<string>("");
    const [holidayName, setHolidayName] = useState<string>("");
    const [isAllView, setIsAllView] = useState(false);

    // ✅ edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDate, setEditDate] = useState<string>("");
    const [editName, setEditName] = useState<string>("");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            setError("");
            setIsAllView(false);

            const res = await fetch(`${API_URL}/api/settings/holidays?month=${month}&year=${year}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch holidays");

            const data = await res.json();
            setHolidays(data || []);
        } catch (e: any) {
            setError(e.message || "Something went wrong");
            setHolidays([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHoliday = async () => {
        try {
            if (!holidayDate) {
                setError("Please select holiday date");
                return;
            }

            setSaving(true);
            setError("");

            const res = await fetch(`${API_URL}/api/settings/holidays`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    date: holidayDate,
                    name: holidayName || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to add holiday");
            }

            setHolidayDate("");
            setHolidayName("");

            await fetchHolidays();
            alert("Holiday added ✅");
        } catch (e: any) {
            setError(e.message || "Failed to add holiday");
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (h: Holiday) => {
        setEditingId(h.id);
        setEditDate(toInputDate(h.date));
        setEditName(h.name || "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditDate("");
        setEditName("");
    };

    const handleUpdateHoliday = async (id: string) => {
        try {
            if (!editDate) {
                setError("Please select holiday date");
                return;
            }

            setSaving(true);
            setError("");

            const res = await fetch(`${API_URL}/api/settings/holidays/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    date: editDate,
                    name: editName || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to update holiday");
            }

            cancelEdit();
            await fetchHolidays();
            alert("Holiday updated ✅");
        } catch (e: any) {
            setError(e.message || "Failed to update holiday");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteHoliday = async (id: string) => {
        try {
            const ok = confirm("Are you sure you want to delete this holiday?");
            if (!ok) return;

            setSaving(true);
            setError("");

            const res = await fetch(`${API_URL}/api/settings/holidays/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to delete holiday");
            }

            await fetchHolidays();
        } catch (e: any) {
            setError(e.message || "Failed to delete holiday");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year]);

    const monthLabel = useMemo(() => {
        return new Date(year, month - 1, 1).toLocaleString("en-IN", { month: "long" });
    }, [month, year]);
    const showAll = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_URL}/api/settings/holidays?year=${year}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            setHolidays(data || []);
        } catch (e: any) {
            setError("Failed to load holidays");
        } finally {
            setLoading(false);
        }
    };

    function getDayName(dateStr: string) {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { weekday: "long" }); // Monday, Tuesday...
    }

    return (
        <div className="p-6 text-black">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Settings → Holidays</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Add / Edit holidays for selected month ✅
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white border rounded-2xl shadow-sm p-4 mb-6">
                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Month</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2024, i, 1).toLocaleString("en-IN", { month: "long" })}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Year</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                        />
                    </div>

                    <div className="md:col-span-2 flex items-end  gap-2">
                        <button
                            onClick={fetchHolidays}
                            disabled={loading}
                            className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? "Loading..." : `Refresh ${monthLabel}`}
                        </button>
                        <button
                            onClick={showAll}
                            disabled={loading}
                            className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 "
                        >
                            View All
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Holiday Form */}
            <div className="bg-white border rounded-2xl shadow-sm p-4 mb-6">
                <h2 className="text-lg font-semibold mb-3">Add Holiday</h2>

                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Holiday Date</label>
                        <input
                            type="date"
                            value={holidayDate}
                            onChange={(e) => setHolidayDate(e.target.value)}
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Holiday Name</label>
                        <input
                            value={holidayName}
                            onChange={(e) => setHolidayName(e.target.value)}
                            placeholder="Independence Day / Diwali..."
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleAddHoliday}
                            disabled={saving}
                            className="bg-black text-white w-full px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Add Holiday"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Holiday List */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Holidays List</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {isAllView ? "Showing all holidays" : `Showing holidays for ${monthLabel} ${year}`}
                    </p>

                </div>

                {loading ? (
                    <div className="p-6 text-gray-500">Loading holidays...</div>
                ) : holidays.length === 0 ? (
                    <div className="p-6 text-gray-500">No holidays added for this month.</div>
                ) : (
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left p-4">Date</th>
                                    <th className="text-left p-4">Day</th>

                                    <th className="text-left p-4">Holiday Name</th>
                                    <th className="text-left p-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {holidays.map((h) => {
                                    const isEditing = editingId === h.id;

                                    return (
                                        <tr key={h.id} className="border-t">
                                            {/* Date */}
                                            <td className="p-4">
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        value={editDate}
                                                        onChange={(e) => setEditDate(e.target.value)}
                                                        className="border rounded-lg px-3 py-2"
                                                    />
                                                ) : (
                                                    <span className="font-medium">{formatDate(h.date)}</span>
                                                )}
                                            </td>
                                            <td className="p-4">{getDayName(h.date)}</td>

                                            {/* Name */}
                                            <td className="p-4">
                                                {isEditing ? (
                                                    <input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="border rounded-lg px-3 py-2 w-full"
                                                        placeholder="Holiday name"
                                                    />
                                                ) : (
                                                    <span>{h.name || "—"}</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4">
                                                {isEditing ? (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleUpdateHoliday(h.id)}
                                                            disabled={saving}
                                                            className="text-green-700 hover:underline disabled:opacity-50"
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            onClick={cancelEdit}
                                                            disabled={saving}
                                                            className="text-gray-600 hover:underline disabled:opacity-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => startEdit(h)}
                                                            disabled={saving}
                                                            className="text-blue-700 hover:underline disabled:opacity-50"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => handleDeleteHoliday(h.id)}
                                                            disabled={saving}
                                                            className="text-red-600 hover:underline disabled:opacity-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
