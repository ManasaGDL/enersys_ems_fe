"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/app/utils/api";

type AttendanceRow = {
    employeeId: string;
    name: string;
    email: string;
    department?: string | null;
    hireDate: string;

    salary: number;

    absentDays: number;
    otHours: number;
};

const DEFAULT_WORKING_DAYS = 26;

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AttendancePage() {
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [workingDays, setWorkingDays] = useState<number>(DEFAULT_WORKING_DAYS);

    const [rows, setRows] = useState<AttendanceRow[]>([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [holidaysCount, setHolidaysCount] = useState<number>(0);
    const [sundays, setSundays] = useState<number>(0);
    const [totalDays, setTotalDays] = useState<number>(0);


    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchWorkingDays = async (m: number, y: number) => {
        try {
            const res = await fetch(`${API_URL}/api/attendance/working-days?month=${m}&year=${y}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch working days");

            const data = await res.json();
            setWorkingDays(Number(data.workingDays || DEFAULT_WORKING_DAYS));
            setHolidaysCount(Number(data.holidaysCount || 0));
            setSundays(Number(data.sundays || 0));
            setTotalDays(Number(data.totalDays || 0));
        } catch (e: any) {
            console.error(e);
            setWorkingDays(DEFAULT_WORKING_DAYS);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_URL}/api/attendance?month=${month}&year=${year}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch attendance");

            const data = await res.json();

            const mapped: AttendanceRow[] = data.map((item: any) => ({
                employeeId: item.employeeId,
                name: item.name,
                email: item.email,
                department: item.department,
                hireDate: item.hireDate,
                salary: Number(item.salary || 0),
                absentDays: Number(item.absentDays || 0),
                otHours: Number(item.otHours || 0),
            }));

            setRows(mapped);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkingDays(month, year);
        fetchAttendance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year]);

    const filteredRows = useMemo(() => {
        return rows.filter((r) => {
            const text = `${r.name} ${r.email} ${r.department || ""}`.toLowerCase();
            return text.includes(search.toLowerCase());
        });
    }, [rows, search]);

    const updateRow = (employeeId: string, update: Partial<AttendanceRow>) => {
        setRows((prev) => prev.map((r) => (r.employeeId === employeeId ? { ...r, ...update } : r)));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");

            const payload = {
                month,
                year,
                workingDays, // ✅ store working days also
                attendance: rows.map((r) => {
                    const safeAbsentDays = Math.max(0, Math.min(Number(r.absentDays || 0), workingDays));

                    return {
                        employeeId: r.employeeId,
                        absentDays: safeAbsentDays,
                        otHours: Number(r.otHours || 0),
                    };
                }),
            };

            const res = await fetch(`${API_URL}/api/attendance/bulk`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save attendance");

            alert("Attendance saved successfully ✅");
            await fetchAttendance();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 text-black">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Attendance (Monthly)</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Fill absent days + OT hours for selected month.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Attendance"}
                </button>
            </div>
            <div className="text-right text-sm text-gray-600 border-b-2 border-gray-300 pb-2">
                {/* <p><span className="font-medium">Total Days:</span> {totalDays}</p>
                <p><span className="font-medium">Sundays:</span> {sundays}</p> */}
                <p><span className="font-medium">Holidays:</span> {holidaysCount}</p>
                <p><span className="font-medium">Working Days:</span> {workingDays}</p>
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

                    <div>
                        <label className="block text-sm font-medium">Working Days</label>
                        <input
                            type="number"
                            value={workingDays}
                            disabled
                            className="w-full mt-1 border rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Search Employee</label>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name/email/department..."
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                        />
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="bg-white border rounded-xl shadow-sm p-6">Loading attendance...</div>
            )}

            {/* Table */}
            {!loading && (
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">Attendance Entries</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Present days will be auto calculated as (Working Days - Absent Days).
                        </p>
                    </div>

                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left p-4">Employee</th>
                                    <th className="text-left p-4">Join Date</th>
                                    <th className="text-left p-4">Working Days</th>
                                    <th className="text-left p-4">Absent Days</th>
                                    <th className="text-left p-4">Present Days</th>
                                    <th className="text-left p-4">OT Hours</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRows.map((row) => {
                                    const presentDays = Math.max(0, workingDays - Number(row.absentDays || 0));

                                    return (
                                        <tr key={row.employeeId} className="border-t">
                                            <td className="p-4">
                                                <p className="font-medium">{row.name}</p>
                                                <p className="text-xs text-gray-500">{row.email}</p>
                                                <p className="text-xs text-gray-500">{row.department || "—"}</p>
                                            </td>

                                            <td className="p-4">{formatDate(row.hireDate)}</td>

                                            <td className="p-4 font-medium">{workingDays}</td>

                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={workingDays}
                                                    step={0.5}
                                                    value={row.absentDays}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        const safe = Math.max(0, Math.min(val, workingDays));
                                                        updateRow(row.employeeId, { absentDays: safe });
                                                    }}
                                                    className="w-28 border rounded-lg px-3 py-2"
                                                />
                                            </td>

                                            <td className="p-4 font-medium">{presentDays}</td>

                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    step={0.5}
                                                    value={row.otHours}
                                                    onChange={(e) => updateRow(row.employeeId, { otHours: Number(e.target.value) })}
                                                    className="w-28 border rounded-lg px-3 py-2"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredRows.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center text-gray-500">
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
