"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck2, IndianRupee, Settings2, Users } from "lucide-react";

export default function PayrollPage() {
    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-black">Payroll</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage salary structure, monthly attendance and generate payroll.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Salary Structure */}
                <Link
                    href="/payroll/salary-structure"
                    className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-black" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-black">Salary Structure</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure Basic, HRA and Allowances for employees.
                        </p>
                    </div>
                </Link>

                {/* Attendance */}
                <Link
                    href="/attendance"
                    className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <CalendarCheck2 className="w-5 h-5 text-black" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-black">Monthly Attendance</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Enter present days and OT hours for each employee.
                        </p>
                    </div>
                </Link>

                {/* Generate Payroll */}
                <Link
                    href="/payroll/generate"
                    className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <IndianRupee className="w-5 h-5 text-black" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-black">Generate Payroll</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Review totals and generate payslips for a month.
                        </p>
                    </div>
                </Link>

                {/* OT Settings */}
                <Link
                    href="/settings/ot"
                    className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Settings2 className="w-5 h-5 text-black" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-black">OT Settings</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure default OT calculation for the company.
                        </p>
                    </div>
                </Link>
            </div>

            {/* Info Section */}
            <div className="mt-8 bg-white border rounded-2xl shadow-sm p-5">
                <h3 className="text-lg font-semibold text-black">Recommended Flow ✅</h3>
                <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
                    <li>Update employee salary in Employee page</li>
                    <li>Configure Salary Structure breakup</li>
                    <li>Fill Monthly Attendance (Present Days + OT)</li>
                    <li>Generate Payroll + Payslips</li>
                </ul>
            </div>
        </div>
    );
}
