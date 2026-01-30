"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/app/utils/api";
/**
 * Employee form page
 * Mandatory:
 *  - First Name
 *  - Email
 *  - Phone
 *  - Password
 *
 * Optional:
 *  - Date of Birth
 *  - Hire Date
 *  - Department
 *  - Role
 *  - Salary
 *  - Aadhaar
 *  - Experience
 *  - Address
 *  - Type
 *  - Payment Type
 */

type Department = {
    id: string;
    name: string;
};

type Role = {
    id: string;
    title: string;
};

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

export default function AddEmployeePage() {
    const router = useRouter();

    // mandatory fields
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    // optional fields
    const [dateOfBirth, setDateOfBirth] = useState(""); // YYYY-MM-DD
    const [hireDate, setHireDate] = useState(""); // YYYY-MM-DD

    const [department, setDepartment] = useState("");
    const [role, setRole] = useState("");

    const [salary, setSalary] = useState<number | "">("");
    const [aadhaar, setAadhaar] = useState("");
    const [experience, setExperience] = useState<number | "">("");
    const [address, setAddress] = useState("");

    const [type, setType] = useState("CONTRACT");
    const [paymentType, setPaymentType] = useState("MONTHLY");

    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // ✅ Auto set hireDate to today (optional)
        setHireDate(new Date().toISOString().slice(0, 10));

        const fetchDepartments = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${API_URL}/api/departments`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                setDepartments(data.data || []);
            } catch (e) {
                console.error("Failed to fetch departments", e);
            }
        };

        const fetchRoles = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${API_URL}/api/roles`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                setRoles(data.data || []);
            } catch (e) {
                console.error("Failed to fetch roles", e);
            }
        };

        fetchDepartments();
        fetchRoles();
    }, []);

    const handleSave = async () => {
        setError(null);

        // ✅ basic validation
        if (!firstName || !email || !phone || !password) {
            setError("First name, email, phone number and password are required");
            return;
        }

        if (phoneError) {
            setError("Please fix phone number error before saving");
            return;
        }

        try {
            setLoading(true);

            const payload: any = {
                firstName,
                email,
                phone,
                password,

                departmentId: department || undefined,
                roleId: role || undefined,

                salary: salary === "" ? undefined : salary,
                aadhaar: aadhaar || undefined,
                experience: experience === "" ? undefined : experience,
                address: address || undefined,

                type,
                paymentType,

                dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
                hireDate: hireDate ? new Date(hireDate).toISOString() : undefined,
            };

            const token = localStorage.getItem("token");

            const res = await fetch(`${API_URL}/api/employees`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.status === 201) {
                router.push("/employees");
            } else {
                setError(data?.message || "Failed to create employee");
            }
        } catch (err: any) {
            console.error(err?.message);
            setError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

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
                <span>Add Employee</span>
            </div>

            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-semibold">Add Employee</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Create a new employee profile with salary & joining details.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Employee"}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Employee Form */}
            <div className="border p-4 rounded-2xl bg-white shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mandatory fields */}
                    <div className="flex flex-col gap-1">
                        <Label text="First Name" required />
                        <input
                            className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label text="Phone" required />
                        <input
                            className={`border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${phoneError
                                ? "border-red-500 focus:ring-red-500"
                                : "focus:ring-blue-500"
                                }`}
                            placeholder="Enter phone number"
                            value={phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setPhone(value);

                                if (value.length === 0) {
                                    setPhoneError("");
                                } else if (!/^[6-9]\d{9}$/.test(value)) {
                                    setPhoneError("Enter a valid 10-digit mobile number");
                                } else {
                                    setPhoneError("");
                                }
                            }}
                        />
                        {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                        <Label text="Email" required />
                        <input
                            type="email"
                            className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                        <Label text="Password" required />
                        <input
                            type="password"
                            className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Set initial password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* New: DOB & Hire Date */}
                    <div className="flex flex-col gap-1">
                        <Label text="Date of Birth" />
                        <input
                            type="date"
                            className="border px-3 py-2 rounded-lg"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label text="Hire Date" />
                        <input
                            type="date"
                            className="border px-3 py-2 rounded-lg"
                            value={hireDate}
                            onChange={(e) => setHireDate(e.target.value)}
                        />
                    </div>

                    {/* Optional dropdowns */}
                    <div className="flex flex-col gap-1">
                        <Label text="Department" />
                        <select
                            className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="">Select Department</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label text="Role" />
                        <select
                            className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">Select Role</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Salary / experience */}
                    <div className="flex flex-col gap-1">
                        <Label text="Salary" />
                        <input
                            className="border px-3 py-2 rounded-lg"
                            placeholder="Salary"
                            type="number"
                            value={salary}
                            onChange={(e) =>
                                setSalary(e.target.value === "" ? "" : Number(e.target.value))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label text="Experience (Years)" />
                        <input
                            className="border px-3 py-2 rounded-lg"
                            placeholder="Experience"
                            type="number"
                            value={experience}
                            onChange={(e) =>
                                setExperience(e.target.value === "" ? "" : Number(e.target.value))
                            }
                        />
                    </div>

                    {/* Aadhaar / Type */}
                    <div className="flex flex-col gap-1">
                        <Label text="Aadhaar Number" />
                        <input
                            className="border px-3 py-2 rounded-lg"
                            placeholder="Aadhaar number"
                            value={aadhaar}
                            onChange={(e) => setAadhaar(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label text="Type" />
                        <select
                            className="border px-3 py-2 rounded-lg"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="CONTRACT">Contract</option>
                            <option value="PERMANENT">Permanent</option>
                        </select>
                    </div>

                    {/* Payment type / Address */}
                    <div className="flex flex-col gap-1">
                        <Label text="Payment Type" />
                        <select
                            className="border px-3 py-2 rounded-lg"
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value)}
                        >
                            <option value="MONTHLY">Monthly</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="DAILY">Daily</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                        <Label text="Address" />
                        <textarea
                            className="border px-3 py-2 rounded-lg"
                            placeholder="Address"
                            rows={3}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    {/* Bottom save button */}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="md:col-span-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Employee"}
                    </button>
                </div>
            </div>
        </div>
    );
}
