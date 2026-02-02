"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck2, IndianRupee, Settings2, Users, Building2, UserCog, Clock } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-black">Configure</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Configure roles, permissions, departments and other settings.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Salary Structure */}
                <Link
                    href="/roles"
                    className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-black" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-black">Roles</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure roles for employees.
                        </p>
                    </div>
                </Link>

                {/* Attendance */}
                {/* <Link
                    href="/permissions"
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
                </Link> */}

                {/* Generate Payroll */}
                <Link
                    href="/departments"
                    className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-black" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-black">Departments</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure departments for employees.
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

        </div>
    );
}
