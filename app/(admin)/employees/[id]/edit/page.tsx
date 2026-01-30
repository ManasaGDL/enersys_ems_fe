"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/app/utils/api";
/* ===================== TYPES ===================== */

type Department = {
    id: string;
    name: string;
};

type Role = {
    id: string;
    title: string;
};

/* ===================== LABEL ===================== */

const Label = ({
    text,
    required,
}: {
    text: string;
    required?: boolean;
}) => (
    <label className="text-sm font-medium text-gray-700">
        {text}
        {required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

/* ===================== UTILS ===================== */

// ISO -> YYYY-MM-DD (for <input type="date" />)
const formatDateForInput = (date?: string | null) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
};

/* ===================== PAGE ===================== */

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const employeeId = params.id as string;

    /* ---------- Form state ---------- */

    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [departmentId, setDepartmentId] = useState("");
    const [roleId, setRoleId] = useState("");

    const [salary, setSalary] = useState<number | "">("");
    const [experience, setExperience] = useState<number | "">("");
    const [address, setAddress] = useState("");

    // ✅ NEW
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [hireDate, setHireDate] = useState("");

    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [type, setType] = useState("CONTRACT");
    const [paymentType, setPaymentType] = useState("MONTHLY");

    const [loading, setLoading] = useState(true);

    /* ===================== FETCH DEPARTMENTS & ROLES ===================== */

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchMeta = async () => {
            try {
                const [deptRes, roleRes] = await Promise.all([
                    fetch(`${API_URL}/api/departments`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_URL}/api/roles`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const deptJson = await deptRes.json();
                const roleJson = await roleRes.json();

                setDepartments(deptJson.data || []);
                setRoles(roleJson.data || []);
            } catch (err) {
                console.error("Failed to load departments/roles");
            }
        };

        fetchMeta();
    }, []);

    /* ===================== FETCH EMPLOYEE ===================== */

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchEmployee = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/api/employees/${employeeId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const emp = await res.json();

                setFirstName(emp?.firstName ?? "");
                setEmail(emp.email ?? "");
                setPhone(emp.phone ?? "");

                setDepartmentId(emp.departmentId ?? "");
                setRoleId(emp.roleId ?? "");

                setSalary(emp.salary ?? emp.salaryStructure?.monthlySalary ?? "");
                setExperience(emp.experience ?? "");
                setAddress(emp.address ?? "");

                setType(emp.type ?? "CONTRACT");
                setPaymentType(emp.paymentType ?? "MONTHLY");

                // ✅ NEW PREFILL
                setDateOfBirth(formatDateForInput(emp.dateOfBirth));
                setHireDate(formatDateForInput(emp.hireDate));
            } catch (err) {
                console.error("Failed to fetch employee");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [employeeId]);

    /* ===================== UPDATE ===================== */

    const handleUpdate = async () => {
        if (!firstName || !email || !phone) {
            alert("First name, email and phone are required");
            return;
        }

        const payload = {
            firstName,
            email,
            phone,

            departmentId: departmentId || null,
            roleId: roleId || null,

            salary: salary === "" ? null : salary,
            experience: experience === "" ? null : experience,
            address: address || null,

            type,
            paymentType,

            // ✅ NEW
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
            hireDate: hireDate ? new Date(hireDate).toISOString() : null,
        };

        const res = await fetch(
            `${API_URL}/api/employees/${employeeId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        if (res.ok) {
            router.push("/employees");
        } else {
            const err = await res.json();
            alert(err.message || "Failed to update employee");
        }
    };

    /* ===================== UI ===================== */

    if (loading) {
        return <div className="p-6 text-gray-600">Loading employee...</div>;
    }

    return (
        <div className="space-y-6 text-black">
            {/* Breadcrumbs */}
            <div className="text-sm text-gray-600">
                <span
                    className="cursor-pointer text-blue-600"
                    onClick={() => router.push("/employees")}
                >
                    Employees
                </span>
                <span className="mx-2">{">"}</span>
                <span>Edit Employee</span>
            </div>

            <h1 className="text-xl font-semibold">
                Edit Employee – {firstName}
            </h1>

            <div className="border p-4 rounded bg-gray-50">
                <div className="grid grid-cols-2 gap-4">

                    {/* First Name */}
                    <div className="flex flex-col gap-1">
                        <Label text="First Name" required />
                        <input
                            className="border px-3 py-2 rounded"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                        <Label text="Phone" required />
                        <input
                            className="border px-3 py-2 rounded"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1 col-span-2">
                        <Label text="Email" required />
                        <input
                            className="border px-3 py-2 rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Date of Birth */}
                    <div className="flex flex-col gap-1">
                        <Label text="Date of Birth" />
                        <input
                            type="date"
                            className="border px-3 py-2 rounded"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                    </div>

                    {/* Hire Date */}
                    <div className="flex flex-col gap-1">
                        <Label text="Hire Date" />
                        <input
                            type="date"
                            className="border px-3 py-2 rounded"
                            value={hireDate}
                            onChange={(e) => setHireDate(e.target.value)}
                        />
                    </div>

                    {/* Department */}
                    <div className="flex flex-col gap-1">
                        <Label text="Department" />
                        <select
                            className="border px-3 py-2 rounded"
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                        >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-1">
                        <Label text="Role" />
                        <select
                            className="border px-3 py-2 rounded"
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                        >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Salary */}
                    <div className="flex flex-col gap-1">
                        <Label text="Salary" />
                        <input
                            type="number"
                            className="border px-3 py-2 rounded"
                            value={salary}
                            onChange={(e) =>
                                setSalary(e.target.value === "" ? "" : Number(e.target.value))
                            }
                        />
                    </div>

                    {/* Experience */}
                    <div className="flex flex-col gap-1">
                        <Label text="Experience (years)" />
                        <input
                            type="number"
                            className="border px-3 py-2 rounded"
                            value={experience}
                            onChange={(e) =>
                                setExperience(
                                    e.target.value === "" ? "" : Number(e.target.value)
                                )
                            }
                        />
                    </div>

                    {/* Type */}
                    <div className="flex flex-col gap-1">
                        <Label text="Type" />
                        <select
                            className="border px-3 py-2 rounded"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="CONTRACT">Contract</option>
                            <option value="PERMANENT">Permanent</option>
                        </select>
                    </div>

                    {/* Payment Type */}
                    <div className="flex flex-col gap-1">
                        <Label text="Payment Type" />
                        <select
                            className="border px-3 py-2 rounded"
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value)}
                        >
                            <option value="MONTHLY">Monthly</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="DAILY">Daily</option>
                        </select>
                    </div>

                    {/* Address */}
                    <div className="flex flex-col gap-1 col-span-2">
                        <Label text="Address" />
                        <textarea
                            className="border px-3 py-2 rounded"
                            rows={3}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleUpdate}
                        className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Update Employee
                    </button>
                </div>
            </div>
        </div>
    );
}
