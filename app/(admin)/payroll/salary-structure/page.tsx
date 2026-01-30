"use client";

import Link from "next/link";
import { Edit } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/app/utils/api";

type OtType = "FIXED" | "MULTIPLIER";

type SalaryRow = {
    employeeId: string;
    name: string;
    email: string;
    department?: string | null;

    monthlySalary: number;
    basicPay: number;
    hra: number;
    allowance: number;

    otType: OtType;
    otRatePerHour: number | null;
    otMultiplier: number | null;
};

function round2(n: number) {
    return Math.round(n * 100) / 100;
}

export default function SalaryStructurePage() {
    const [search, setSearch] = useState("");
    const [workingDays, setWorkingDays] = useState(26);
    const [workingHours, setWorkingHours] = useState(8);

    const [rows, setRows] = useState<SalaryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchSalaryStructures = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_URL}/api/salary-structure`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch salary structures");

            const data = await res.json();

            // ✅ backend gives employees array with salaryStructure inside
            const mapped: SalaryRow[] = data.map((emp: any) => ({
                employeeId: emp.id,
                name: `${emp.firstName} ${emp.lastName || ""}`.trim(),
                email: emp.email,
                department: emp.department?.name || null,

                monthlySalary: Number(emp.salaryStructure?.monthlySalary ?? emp.salary ?? 0),
                basicPay: Number(emp.salaryStructure?.basicPay || 0),
                hra: Number(emp.salaryStructure?.hra || 0),
                allowance: Number(emp.salaryStructure?.allowance || 0),

                otType: (emp.salaryStructure?.otType || "FIXED") as OtType,
                otRatePerHour:
                    emp.salaryStructure?.otRatePerHour !== undefined
                        ? Number(emp.salaryStructure?.otRatePerHour)
                        : null,
                otMultiplier:
                    emp.salaryStructure?.otMultiplier !== undefined
                        ? Number(emp.salaryStructure?.otMultiplier)
                        : null,
            }));

            setRows(mapped);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalaryStructures();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredRows = useMemo(() => {
        return rows.filter((r) => {
            const text = `${r.name} ${r.email} ${r.department || ""}`.toLowerCase();
            return text.includes(search.toLowerCase());
        });
    }, [rows, search]);

    const updateRow = (employeeId: string, update: Partial<SalaryRow>) => {
        setRows((prev) =>
            prev.map((r) => (r.employeeId === employeeId ? { ...r, ...update } : r))
        );
    };

    const previewOtRate = (row: SalaryRow) => {
        const perDay = workingDays > 0 ? row.monthlySalary / workingDays : 0;
        const hourly = workingHours > 0 ? perDay / workingHours : 0;

        if (row.otType === "FIXED") return round2(row.otRatePerHour || 0);
        return round2(hourly * (row.otMultiplier || 1));
    };

    const validateBreakup = (row: SalaryRow) => {
        const total = (row.basicPay || 0) + (row.hra || 0) + (row.allowance || 0);
        const diff = (row.monthlySalary || 0) - total;

        return {
            total: round2(total),
            diff: round2(diff),
            ok: diff === 0,
        };
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");

            // ✅ build backend payload
            const payload = {
                salaryStructures: rows.map((r) => ({
                    employeeId: r.employeeId,
                    monthlySalary: r.monthlySalary,
                    basicPay: r.basicPay,
                    hra: r.hra,
                    allowance: r.allowance,
                    otType: r.otType,
                    otRatePerHour: r.otType === "FIXED" ? r.otRatePerHour : null,
                    otMultiplier: r.otType === "MULTIPLIER" ? r.otMultiplier : null,
                })),
            };

            const res = await fetch(`${API_URL}/api/salary-structure/bulk`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save salary structures");

            alert("Salary Structure saved successfully ✅");
            await fetchSalaryStructures(); // refresh
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 text-black">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Salary Structure</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure salary breakup & OT policy per employee.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Salary Structure"}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="bg-white border rounded-2xl shadow-sm p-4 mb-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Search Employee</label>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name/email/department..."
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Working Days (Monthly)
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={workingDays}
                            onChange={(e) => setWorkingDays(Number(e.target.value))}
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Working Hours / Day
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={workingHours}
                            onChange={(e) => setWorkingHours(Number(e.target.value))}
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                        />
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="bg-white border rounded-xl shadow-sm p-6">
                    Loading salary structure...
                </div>
            )}

            {/* Table */}
            {!loading && (
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">
                            Employee Salary Breakup + OT Policy
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Monthly Salary = Basic + HRA + Allowance
                        </p>
                    </div>

                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left p-4">Employee</th>
                                    <th className="text-left p-4">Monthly Salary</th>
                                    <th className="text-left p-4">Basic</th>
                                    <th className="text-left p-4">HRA</th>
                                    <th className="text-left p-4">Allowance</th>
                                    {/* <th className="text-left p-4">OT Type</th>
                                    <th className="text-left p-4">OT Config</th>
                                    <th className="text-left p-4">OT Rate Preview</th> */}
                                    <th className="text-left p-4">Breakup</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRows.map((row) => {
                                    const breakup = validateBreakup(row);
                                    const otPreview = previewOtRate(row);

                                    return (
                                        <tr key={row.employeeId} className="border-t">
                                            <td className="p-4">
                                                <p className="font-medium">{row.name}</p>
                                                <p className="text-xs text-gray-500">{row.email}</p>
                                                <p className="text-xs text-gray-500">
                                                    {row.department || "—"}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/employees/${row.employeeId}/edit`}
                                                        className="text-[11px] text-blue-600 hover:underline w-fit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <input
                                                        type="number"
                                                        value={row.monthlySalary}
                                                        disabled
                                                        className="w-28 border rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                                                    />


                                                </div>
                                            </td>



                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={row.basicPay}
                                                    onChange={(e) =>
                                                        updateRow(row.employeeId, {
                                                            basicPay: Number(e.target.value),
                                                        })
                                                    }
                                                    className="w-24 border rounded-lg px-3 py-2"
                                                />
                                            </td>

                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={row.hra}
                                                    onChange={(e) =>
                                                        updateRow(row.employeeId, {
                                                            hra: Number(e.target.value),
                                                        })
                                                    }
                                                    className="w-24 border rounded-lg px-3 py-2"
                                                />
                                            </td>

                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={row.allowance}
                                                    onChange={(e) =>
                                                        updateRow(row.employeeId, {
                                                            allowance: Number(e.target.value),
                                                        })
                                                    }
                                                    className="w-24 border rounded-lg px-3 py-2"
                                                />
                                            </td>

                                            {/* <td className="p-4">
                                                <select
                                                    value={row.otType}
                                                    onChange={(e) =>
                                                        updateRow(row.employeeId, {
                                                            otType: e.target.value as OtType,
                                                            otRatePerHour:
                                                                e.target.value === "FIXED"
                                                                    ? row.otRatePerHour ?? 0
                                                                    : null,
                                                            otMultiplier:
                                                                e.target.value === "MULTIPLIER"
                                                                    ? row.otMultiplier ?? 1.5
                                                                    : null,
                                                        })
                                                    }
                                                    className="border rounded-lg px-3 py-2"
                                                >
                                                    <option value="FIXED">Fixed Rate</option>
                                                    <option value="MULTIPLIER">Multiplier</option>
                                                </select>
                                            </td> */}

                                            {/* <td className="p-4">
                                                {row.otType === "FIXED" ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">₹/hr</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={row.otRatePerHour ?? 0}
                                                            onChange={(e) =>
                                                                updateRow(row.employeeId, {
                                                                    otRatePerHour: Number(e.target.value),
                                                                })
                                                            }
                                                            className="w-24 border rounded-lg px-3 py-2"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">x</span>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            step={0.1}
                                                            value={row.otMultiplier ?? 1.5}
                                                            onChange={(e) =>
                                                                updateRow(row.employeeId, {
                                                                    otMultiplier: Number(e.target.value),
                                                                })
                                                            }
                                                            className="w-24 border rounded-lg px-3 py-2"
                                                        />
                                                    </div>
                                                )}
                                            </td> */}
                                            {/* 
                                            <td className="p-4 font-medium">₹ {otPreview}</td> */}

                                            <td className="p-4">
                                                {breakup.ok ? (
                                                    <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                                        OK
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                                        Diff ₹{breakup.diff}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredRows.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="p-6 text-center text-gray-500">
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
                ✅ Salary structure and OT policy are saved employee-wise using bulk upsert.
            </p>
        </div>
    );
}
