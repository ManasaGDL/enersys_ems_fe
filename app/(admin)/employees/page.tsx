"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { API_URL } from "@/app/utils/api";
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

type Employee = {
    id: string;
    firstName: string;
    email: string;
    phone: string;
    department?: string | null;
    role?: string | null;
    status: "ACTIVE" | "INACTIVE";
};

export default function EmployeesPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
    const [selectedEmployeeName, setSelectedEmployeeName] = useState('')

    /* ---------------- FETCH ---------------- */
    const fetchEmployees = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/employees`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const json = await res.json();
        setEmployees(json);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    /* ---------------- DELETE ---------------- */
    const deleteEmployee = async (id: string) => {
        const token = localStorage.getItem("token");

        await fetch(`${API_URL}/api/employees/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        fetchEmployees();
    };

    /* ---------------- STATUS TOGGLE ---------------- */
    const toggleEmployeeStatus = async (emp: Employee) => {
        const token = localStorage.getItem("token");

        await fetch(
            `${API_URL}/api/employees/${emp.id}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                }),
            }
        );

        fetchEmployees();
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setSelectedEmployeeId("");
        setSelectedEmployeeName("")
        setNewPassword("");
        setConfirmPassword("");
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword || !confirmPassword) {
            alert("Password is required");
            return;
        }

        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const res = await fetch(
            `${API_URL}/api/employees/${selectedEmployeeId}/password`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: newPassword }),
            }
        );

        if (res.ok) {
            alert("Password updated successfully");
            closePasswordModal();
        } else {
            const err = await res.json();
            alert(err.message || "Failed to update password");
        }
    };

    return (
        <div className="space-y-4 text-black">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold">Employees</h1>

                <button
                    onClick={() => router.push("/employees/add")}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Add Employee
                </button>
            </div>

            {/* Employees Table */}
            <div className="border rounded overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Phone</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Department</th>
                            <th className="px-4 py-2 text-left">Role</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {employees?.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center py-6 text-gray-500"
                                >
                                    No employees found
                                </td>
                            </tr>
                        ) : (
                            employees?.map((emp) => {
                                const isIncomplete =
                                    !emp.department || !emp.role;



                                return (
                                    <tr
                                        key={emp.id}
                                        className={`border-t hover:bg-gray-50 ${isIncomplete ? "bg-yellow-50" : ""
                                            }`}
                                    >
                                        <td className="px-4 py-2">{emp.firstName}</td>
                                        <td className="px-4 py-2">{emp.phone}</td>
                                        <td className="px-4 py-2">{emp.email}</td>
                                        <td className="px-4 py-2">
                                            {emp.department || "—"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {emp.role || "—"}
                                        </td>

                                        {/* STATUS BADGE */}
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full font-medium
                          ${emp.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-200 text-gray-600"
                                                    }`}
                                            >
                                                {emp.status}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-4 py-2 flex items-center gap-3">
                                            {/* EDIT */}
                                            <button
                                                onClick={() =>
                                                    router.push(`/employees/${emp.id}/edit`)
                                                }
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            {/* DELETE */}
                                            <button
                                                onClick={() => {
                                                    if (
                                                        !confirm(
                                                            "Are you sure you want to delete this employee?"
                                                        )
                                                    )
                                                        return;
                                                    deleteEmployee(emp.id);
                                                }}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            {/* STATUS TOGGLE */}
                                            <button
                                                onClick={() => toggleEmployeeStatus(emp)}
                                                title="Toggle status"
                                            >
                                                {emp.status === "ACTIVE" ? (
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
                                            <button title="Update Password"
                                                onClick={() => {
                                                    setSelectedEmployeeId(emp.id);
                                                    setSelectedEmployeeName(emp.firstName)
                                                    setShowPasswordModal(true);
                                                }}
                                                className="text-purple-600 hover:underline"
                                            >
                                                🔑
                                            </button>

                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg w-[420px] p-6">
                            <h2 className="text-lg font-semibold mb-4">
                                Update Password  -<b>  {selectedEmployeeName}</b>
                            </h2>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <Label text="New Password" required />
                                    <input
                                        type="password"
                                        className="border px-3 py-2 rounded"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label text="Confirm Password" required />
                                    <input
                                        type="password"
                                        className="border px-3 py-2 rounded"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={closePasswordModal}
                                    className="px-4 py-2 border rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handlePasswordUpdate}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
