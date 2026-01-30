"use client";

import { useEffect, useMemo, useState } from "react";
import {
    X,
    Plus,
    Trash2,
    FileText,
    RefreshCcw,
    CheckCircle2,
    BadgeIndianRupee,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/utils/api";

type AdjustmentType = "ADDITION" | "DEDUCTION";

type PayrollAdjustment = {
    id: string;
    payrollItemId: string;
    date: string; // ISO string from backend
    type: AdjustmentType;
    amount: string | number;
    reason: string;
    notes?: string | null;
};

type PayrollEmployee = {
    id: string;
    firstName: string;
    lastName?: string | null;
    email: string;
    department?: { id: string; name: string } | null;
};

type PayrollItem = {
    id: string;
    employeeId: string;

    employee: PayrollEmployee;

    monthlySalary: string | number;
    presentDays: string | number;
    otHours: string | number;

    basicPay: string | number;
    hra: string | number;
    allowance: string | number;

    regularPay: string | number;
    otPay: string | number;
    grossPay: string | number;

    adjustmentTotal: string | number;
    netPay: string | number;

    adjustments: PayrollAdjustment[];
};

type PayrollRun = {
    id: string;
    month: number;
    year: number;
    status: "DRAFT" | "GENERATED" | "PAID";
    items: PayrollItem[];
};

function toNum(v: any) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function round2(n: number) {
    return Math.round(n * 100) / 100;
}

function sumAdjustments(adjs: PayrollAdjustment[]) {
    return adjs.reduce((acc, a) => {
        const amount = toNum(a.amount);
        return acc + (a.type === "ADDITION" ? amount : -amount);
    }, 0);
}

function sumAdditions(adjs: PayrollAdjustment[]) {
    return adjs
        .filter((a) => a.type === "ADDITION")
        .reduce((acc, a) => acc + toNum(a.amount), 0);
}

function sumDeductions(adjs: PayrollAdjustment[]) {
    return adjs
        .filter((a) => a.type === "DEDUCTION")
        .reduce((acc, a) => acc + toNum(a.amount), 0);
}

function getStatusBadge(status?: PayrollRun["status"]) {
    if (!status)
        return (
            <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                NOT GENERATED
            </span>
        );

    if (status === "DRAFT")
        return (
            <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                DRAFT
            </span>
        );

    if (status === "GENERATED")
        return (
            <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                GENERATED
            </span>
        );

    return (
        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
            PAID
        </span>
    );
}

export default function PayrollGeneratePage() {
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());

    const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [generating, setGenerating] = useState<boolean>(false);
    const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const [openPayrollItemId, setOpenPayrollItemId] = useState<string | null>(
        null
    );
    const router = useRouter();
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchPayrollRun = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(
                `${API_URL}/api/payroll/run?month=${month}&year=${year}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) throw new Error("Failed to fetch payroll run");

            const data = await res.json();
            setPayrollRun(data); // can be null
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const generatePayroll = async () => {
        try {
            setGenerating(true);
            setError("");

            const res = await fetch(`${API_URL}/api/payroll/run/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ month, year }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to generate payroll");
            }

            alert("Payroll generated ✅");
            await fetchPayrollRun();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setGenerating(false);
        }
    };

    const updatePayrollStatus = async (status: PayrollRun["status"]) => {
        if (!payrollRun?.id) return;

        try {
            setUpdatingStatus(true);
            setError("");

            const res = await fetch(
                `${API_URL}/api/payroll/run/${payrollRun.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to update payroll status");
            }

            alert(`Payroll marked as ${status} ✅`);
            await fetchPayrollRun();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    useEffect(() => {
        fetchPayrollRun();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year]);

    const payrollItems: PayrollItem[] = payrollRun?.items || [];

    const selectedItem = useMemo(() => {
        return payrollItems.find((i) => i.id === openPayrollItemId) || null;
    }, [openPayrollItemId, payrollItems]);

    const payrollLocked = payrollRun?.status === "PAID";

    const addAdjustment = async (payload: {
        payrollItemId: string;
        date: string;
        type: AdjustmentType;
        amount: number;
        reason: string;
        notes?: string;
    }) => {
        const res = await fetch(`${API_URL}/api/payroll-adjustments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error || "Failed to add adjustment");
        }
    };

    const deleteAdjustment = async (id: string) => {
        const res = await fetch(`${API_URL}/api/payroll-adjustments/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error || "Failed to delete adjustment");
        }
    };

    return (
        <div className="p-6 text-black">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold text-black">Generate Payroll</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Generate monthly payroll and manage adjustments safely with audit.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={fetchPayrollRun}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </button>

                    <button
                        disabled={generating || payrollLocked}
                        onClick={generatePayroll}
                        className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                        title={payrollLocked ? "Payroll is PAID and locked" : ""}
                    >
                        <FileText className="w-4 h-4" />
                        {generating ? "Generating..." : "Generate Payroll"}
                    </button>

                    {/* ✅ Finalize Payroll */}
                    <button
                        disabled={
                            updatingStatus ||
                            !payrollRun ||
                            payrollRun.status !== "DRAFT"
                        }
                        onClick={() => updatePayrollStatus("GENERATED")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Finalize
                    </button>


                    {/* ✅ Mark Paid */}
                    <button
                        disabled={
                            updatingStatus ||
                            !payrollRun ||
                            payrollRun.status !== "GENERATED"
                        }
                        onClick={() => updatePayrollStatus("PAID")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <BadgeIndianRupee className="w-4 h-4" />
                        Mark Paid
                    </button>
                </div>
            </div>

            {/* Status display */}
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-gray-600">
                    Status: {getStatusBadge(payrollRun?.status)}
                </div>

                {payrollLocked && (
                    <div className="text-sm bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl">
                        Payroll is PAID ✅ Adjustments are locked.
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white border rounded-2xl shadow-sm p-4 mb-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Month</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2024, i, 1).toLocaleString("en-IN", {
                                        month: "long",
                                    })}
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

                    <div className="flex items-end justify-end">
                        <div className="text-sm text-gray-600">
                            Employees:{" "}
                            <span className="font-semibold text-black">
                                {payrollItems.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white border rounded-xl shadow-sm p-6">
                    Loading payroll...
                </div>
            ) : !payrollRun ? (
                <div className="bg-white border rounded-2xl shadow-sm p-6">
                    <p className="text-gray-700 font-medium">
                        Payroll is not generated for this month.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Click <b>Generate Payroll</b> to create salary snapshots.
                    </p>
                </div>
            ) : (
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">Payroll Summary</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage additions/deductions per employee with date-wise details.
                        </p>
                    </div>

                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left p-4">Employee</th>
                                    <th className="text-left p-4">Regular Pay</th>
                                    <th className="text-left p-4">OT Pay</th>
                                    <th className="text-left p-4">Adjustments</th>
                                    <th className="text-left p-4">Net Pay</th>
                                    <th className="text-left p-4">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {payrollItems.map((item) => {
                                    const adjTotal = sumAdjustments(item.adjustments || []);
                                    const netPay = round2(toNum(item.grossPay) + adjTotal);

                                    return (
                                        <tr key={item.id} className="border-t">
                                            <td className="p-4">
                                                <p className="font-medium">
                                                    {item.employee.firstName}{" "}
                                                    {item.employee.lastName || ""}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {item.employee.email}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {item.employee.department?.name || "—"}
                                                </p>
                                                {/* <p>
                                                    <button
                                                        onClick={() => router.push(`/payroll/payslip/${item.id}`)}
                                                        className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                                                    >
                                                        Payslip
                                                    </button>
                                                </p> */}

                                            </td>

                                            <td className="p-4 font-medium">
                                                ₹ {round2(toNum(item.regularPay))}
                                            </td>
                                            <td className="p-4 font-medium">
                                                ₹ {round2(toNum(item.otPay))}
                                            </td>

                                            <td className="p-4">
                                                {adjTotal === 0 ? (
                                                    <span className="text-gray-500">₹ 0</span>
                                                ) : adjTotal > 0 ? (
                                                    <span className="text-green-700 font-medium">
                                                        + ₹ {round2(adjTotal)}
                                                    </span>
                                                ) : (
                                                    <span className="text-red-700 font-medium">
                                                        - ₹ {round2(Math.abs(adjTotal))}
                                                    </span>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {(item.adjustments || []).length} record(s)
                                                </p>
                                            </td>

                                            <td className="p-4 font-semibold">₹ {netPay}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {/* ✅ Payslip is always available once payroll exists */}
                                                    <button
                                                        onClick={() => router.push(`/payroll/payslip/${item.id}`)}
                                                        className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                                                        title={
                                                            payrollRun?.status === "DRAFT"
                                                                ? "Draft payslip (not final)"
                                                                : payrollRun?.status === "GENERATED"
                                                                    ? "Finalized payslip"
                                                                    : "Paid payslip (locked)"
                                                        }
                                                    >
                                                        Payslip
                                                    </button>

                                                    {/* ✅ Manage adjustments allowed until PAID */}
                                                    <button
                                                        disabled={payrollLocked}
                                                        onClick={() => setOpenPayrollItemId(item.id)}
                                                        className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50"
                                                        title={
                                                            payrollLocked
                                                                ? "Payroll is PAID and locked"
                                                                : "Manage adjustments"
                                                        }
                                                    >
                                                        Manage
                                                    </button>
                                                </div>

                                                {/* ✅ Small status hint under buttons */}
                                                <div className="mt-2">
                                                    {payrollRun?.status === "DRAFT" && (
                                                        <span className="text-[11px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                                            DRAFT • Payslip not final
                                                        </span>
                                                    )}

                                                    {payrollRun?.status === "GENERATED" && (
                                                        <span className="text-[11px] px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                            FINALIZED
                                                        </span>
                                                    )}

                                                    {payrollRun?.status === "PAID" && (
                                                        <span className="text-[11px] px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                            PAID • Locked
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* <td className="p-4">
                                                <button
                                                    disabled={payrollLocked}
                                                    onClick={() => setOpenPayrollItemId(item.id)}
                                                    className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50"
                                                    title={
                                                        payrollLocked
                                                            ? "Payroll is PAID and locked"
                                                            : "Manage adjustments"
                                                    }
                                                >
                                                    Manage
                                                </button>
                                            </td> */}
                                        </tr>
                                    );
                                })}

                                {payrollItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center text-gray-500">
                                            No payroll items found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {selectedItem && (
                <AdjustmentsModal
                    employeeName={`${selectedItem.employee.firstName} ${selectedItem.employee.lastName || ""
                        }`.trim()}
                    employeeEmail={selectedItem.employee.email}
                    adjustments={selectedItem.adjustments || []}
                    payrollItemId={selectedItem.id}
                    onClose={() => setOpenPayrollItemId(null)}
                    onAdd={async (adj) => {
                        await addAdjustment(adj);
                        await fetchPayrollRun();
                    }}
                    onDelete={async (id) => {
                        await deleteAdjustment(id);
                        await fetchPayrollRun();
                    }}
                    isLocked={payrollLocked}
                />
            )}
        </div>
    );
}

function AdjustmentsModal({
    employeeName,
    employeeEmail,
    adjustments,
    onClose,
    onAdd,
    onDelete,
    payrollItemId,
    isLocked,
}: {
    employeeName: string;
    employeeEmail: string;
    adjustments: PayrollAdjustment[];
    onClose: () => void;
    onAdd: (payload: {
        payrollItemId: string;
        date: string;
        type: AdjustmentType;
        amount: number;
        reason: string;
        notes?: string;
    }) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    payrollItemId: string;
    isLocked: boolean;
}) {
    const [type, setType] = useState<AdjustmentType>("DEDUCTION");
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [amount, setAmount] = useState<number>(0);
    const [reason, setReason] = useState<string>("Advance Salary");
    const [notes, setNotes] = useState<string>("");

    const additions = sumAdditions(adjustments);
    const deductions = sumDeductions(adjustments);
    const net = sumAdjustments(adjustments);

    const handleAdd = async () => {
        if (!date) return alert("Please select date");
        if (!amount || amount <= 0) return alert("Amount must be greater than 0");
        if (!reason.trim()) return alert("Reason is required");

        await onAdd({
            payrollItemId,
            date,
            type,
            amount: Number(amount),
            reason: reason.trim(),
            notes: notes.trim() || undefined,
        });

        setAmount(0);
        setNotes("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Payroll Adjustments</h3>
                        <p className="text-sm text-gray-500">
                            {employeeName} • {employeeEmail}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isLocked && (
                    <div className="p-4 bg-green-50 border-b border-green-200 text-green-700 text-sm">
                        Payroll is PAID ✅ Adjustments are locked.
                    </div>
                )}

                {/* Add Form */}
                <div className="p-4 border-b">
                    <div className="grid md:grid-cols-5 gap-3 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-600">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                disabled={isLocked}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full mt-1 border rounded-lg px-3 py-2 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600">
                                Type
                            </label>
                            <select
                                value={type}
                                disabled={isLocked}
                                onChange={(e) => setType(e.target.value as AdjustmentType)}
                                className="w-full mt-1 border rounded-lg px-3 py-2 disabled:bg-gray-100"
                            >
                                <option value="ADDITION">Addition (+)</option>
                                <option value="DEDUCTION">Deduction (-)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600">
                                Amount
                            </label>
                            <input
                                type="number"
                                min={0}
                                disabled={isLocked}
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full mt-1 border rounded-lg px-3 py-2 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600">
                                Reason
                            </label>
                            <input
                                value={reason}
                                disabled={isLocked}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full mt-1 border rounded-lg px-3 py-2 disabled:bg-gray-100"
                                placeholder="Advance / Bonus / Recovery..."
                            />
                        </div>

                        <button
                            disabled={isLocked}
                            onClick={handleAdd}
                            className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>

                    <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600">
                            Notes (optional)
                        </label>
                        <input
                            value={notes}
                            disabled={isLocked}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full mt-1 border rounded-lg px-3 py-2 disabled:bg-gray-100"
                            placeholder="Extra details..."
                        />
                    </div>
                </div>

                {/* Records */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Adjustment Records</h4>
                        <div className="text-sm text-gray-600">
                            Additions:{" "}
                            <span className="text-green-700 font-semibold">
                                ₹ {round2(additions)}
                            </span>{" "}
                            | Deductions:{" "}
                            <span className="text-red-700 font-semibold">
                                ₹ {round2(deductions)}
                            </span>{" "}
                            | Net:{" "}
                            <span className="font-semibold">
                                {net >= 0 ? (
                                    <span className="text-green-700">+ ₹ {round2(net)}</span>
                                ) : (
                                    <span className="text-red-700">
                                        - ₹ {round2(Math.abs(net))}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left p-3">Date</th>
                                    <th className="text-left p-3">Type</th>
                                    <th className="text-left p-3">Amount</th>
                                    <th className="text-left p-3">Reason</th>
                                    <th className="text-left p-3">Notes</th>
                                    <th className="text-left p-4 w-[240px]">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {adjustments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-gray-500">
                                            No adjustments added.
                                        </td>
                                    </tr>
                                ) : (
                                    adjustments
                                        .slice()
                                        .sort((a, b) => a.date.localeCompare(b.date))
                                        .map((a) => (
                                            <tr key={a.id} className="border-t">
                                                <td className="p-3">{a.date.slice(0, 10)}</td>
                                                <td className="p-3">
                                                    {a.type === "ADDITION" ? (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                                            Addition
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                                                            Deduction
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 font-medium">
                                                    ₹ {round2(toNum(a.amount))}
                                                </td>
                                                <td className="p-3">{a.reason}</td>
                                                <td className="p-3 text-gray-600">{a.notes || "—"}</td>
                                                <td className="p-3">
                                                    <button
                                                        disabled={isLocked}
                                                        onClick={() => onDelete(a.id)}
                                                        className="p-2 rounded-lg hover:bg-gray-100 text-red-600 disabled:opacity-50"
                                                        title={isLocked ? "Locked" : "Delete"}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
