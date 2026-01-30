"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { API_URL } from "@/app/utils/api";
type AdjustmentType = "ADDITION" | "DEDUCTION";

type PayrollAdjustment = {
    id: string;
    date: string;
    type: AdjustmentType;
    amount: string | number;
    reason: string;
    notes?: string | null;
};

type PayslipData = {
    id: string;

    payrollRun: {
        month: number;
        year: number;
        status: "DRAFT" | "GENERATED" | "PAID";
    };

    employee: {
        firstName: string;
        lastName?: string | null;
        email: string;
        phone?: string | null;
        hireDate?: string | null;
        department?: { name: string } | null;
        role?: { title: string } | null;
    };

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

const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const formatCurrency = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(n);
};

const monthName = (m: number) =>
    new Date(2024, m - 1, 1).toLocaleString("en-IN", { month: "long" });

export default function PayslipPage() {
    const params = useParams();
    const router = useRouter();
    const payrollItemId = params.payrollItemId as string;

    const [data, setData] = useState<PayslipData | null>(null);
    const [loading, setLoading] = useState(true);

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchPayslip = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/payslip/${payrollItemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();

            if (!res.ok) {
                alert(json?.error || "Failed to load payslip");
                return;
            }

            setData(json);
        } catch (e) {
            alert("Failed to load payslip");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayslip();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payrollItemId]);

    const totals = useMemo(() => {
        if (!data) return null;
        const additions = data.adjustments
            .filter((a) => a.type === "ADDITION")
            .reduce((acc, a) => acc + toNum(a.amount), 0);

        const deductions = data.adjustments
            .filter((a) => a.type === "DEDUCTION")
            .reduce((acc, a) => acc + toNum(a.amount), 0);

        return { additions, deductions };
    }, [data]);

    if (loading) {
        return <div className="p-6 text-gray-600">Loading payslip...</div>;
    }

    if (!data) {
        return (
            <div className="p-6">
                <p className="text-gray-700">Payslip not found.</p>
                <button
                    onClick={() => router.push("/payroll/generate")}
                    className="mt-3 px-4 py-2 border rounded-lg"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const employeeName = `${data.employee.firstName} ${data.employee.lastName || ""
        }`.trim();

    return (
        <div className="p-6 text-black">
            {/* Top bar */}
            <div className="mb-4 flex items-center justify-between print:hidden">
                <button
                    onClick={() => router.push("/payroll/generate")}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg hover:opacity-90"
                >
                    <Printer className="w-4 h-4" />
                    Print Payslip
                </button>
            </div>

            {/* Payslip container */}
            <div className="bg-white border rounded-2xl shadow-sm p-6 max-w-4xl mx-auto">
                {/* Company header */}
                <div className="flex items-start justify-between gap-4 border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Payslip</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {monthName(data.payrollRun.month)} {data.payrollRun.year} •{" "}
                            <span className="font-medium">{data.payrollRun.status}</span>
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold">Your Company Name</p>
                        <p className="text-sm text-gray-600">Hyderabad, India</p>
                    </div>
                </div>

                {/* Employee Info */}
                <div className="grid md:grid-cols-2 gap-4 mt-5">
                    <div className="border rounded-xl p-4">
                        <h2 className="font-semibold mb-2">Employee Details</h2>
                        <p className="text-sm">
                            <span className="text-gray-600">Name:</span>{" "}
                            <span className="font-medium">{employeeName}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-600">Email:</span> {data.employee.email}
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-600">Department:</span>{" "}
                            {data.employee.department?.name || "—"}
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-600">Role:</span>{" "}
                            {data.employee.role?.title || "—"}
                        </p>
                    </div>

                    <div className="border rounded-xl p-4">
                        <h2 className="font-semibold mb-2">Attendance Summary</h2>
                        <p className="text-sm">
                            <span className="text-gray-600">Present Days:</span>{" "}
                            <span className="font-medium">{toNum(data.presentDays)}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-600">OT Hours:</span>{" "}
                            <span className="font-medium">{toNum(data.otHours)}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-gray-600">Monthly Salary:</span>{" "}
                            <span className="font-medium">
                                {formatCurrency(toNum(data.monthlySalary))}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Salary Breakup */}
                <div className="grid md:grid-cols-2 gap-4 mt-5">
                    <div className="border rounded-xl p-4">
                        <h2 className="font-semibold mb-3">Salary Breakup</h2>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">Basic Pay</span>
                            <span className="font-medium">
                                {formatCurrency(toNum(data.basicPay))}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">HRA</span>
                            <span className="font-medium">
                                {formatCurrency(toNum(data.hra))}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">Allowance</span>
                            <span className="font-medium">
                                {formatCurrency(toNum(data.allowance))}
                            </span>
                        </div>
                    </div>

                    <div className="border rounded-xl p-4">
                        <h2 className="font-semibold mb-3">Earnings</h2>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">Regular Pay</span>
                            <span className="font-medium">
                                {formatCurrency(toNum(data.regularPay))}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">OT Pay</span>
                            <span className="font-medium">
                                {formatCurrency(toNum(data.otPay))}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-t mt-2 pt-2">
                            <span className="font-semibold">Gross Pay</span>
                            <span className="font-semibold">
                                {formatCurrency(toNum(data.grossPay))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Adjustments */}
                <div className="mt-5 border rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h2 className="font-semibold">Adjustments</h2>
                        <div className="text-sm text-gray-600">
                            Additions:{" "}
                            <span className="text-green-700 font-semibold">
                                {formatCurrency(totals?.additions || 0)}
                            </span>{" "}
                            | Deductions:{" "}
                            <span className="text-red-700 font-semibold">
                                {formatCurrency(totals?.deductions || 0)}
                            </span>
                        </div>
                    </div>

                    {data.adjustments.length === 0 ? (
                        <p className="text-sm text-gray-500 mt-3">No adjustments added.</p>
                    ) : (
                        <div className="overflow-auto mt-3">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="text-left p-2">Date</th>
                                        <th className="text-left p-2">Type</th>
                                        <th className="text-left p-2">Amount</th>
                                        <th className="text-left p-2">Reason</th>
                                        <th className="text-left p-2">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.adjustments.map((a) => (
                                        <tr key={a.id} className="border-t">
                                            <td className="p-2">{a.date.slice(0, 10)}</td>
                                            <td className="p-2">{a.type}</td>
                                            <td className="p-2 font-medium">
                                                {formatCurrency(toNum(a.amount))}
                                            </td>
                                            <td className="p-2">{a.reason}</td>
                                            <td className="p-2 text-gray-600">{a.notes || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Net Pay */}
                <div className="mt-5 border rounded-xl p-4">
                    <div className="flex justify-between text-base">
                        <span className="font-semibold">Net Pay</span>
                        <span className="font-bold text-lg">
                            {formatCurrency(toNum(data.netPay))}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        This payslip is auto-generated from attendance + salary structure +
                        adjustments.
                    </p>
                </div>
            </div>
        </div>
    );
}
