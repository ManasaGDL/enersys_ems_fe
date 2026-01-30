"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "@/app/utils/api";
type Employee = {
    id: string;
    firstName: string;
    lastName?: string | null;
    email: string;
};

export default function ProjectDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);
    const [projectName, setProjectName] = useState("");

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchEmployees = async () => {
        const res = await fetch(`${API_URL}/api/employees`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    };

    const fetchProjectEmployees = async () => {
        const res = await fetch(`${API_URL}/api/projects/${projectId}/employees`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    };

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const [employeesData, projectEmployeesData] = await Promise.all([
                    fetchEmployees(),
                    fetchProjectEmployees(),
                ]);

                setAllEmployees(employeesData);

                const assigned = projectEmployeesData?.employees?.map(
                    (x: any) => x.employeeId
                );
                setAssignedEmployeeIds(assigned || []);

                if (projectEmployeesData?.project?.name) {
                    setProjectName(projectEmployeesData.project.name);
                }
            } catch (err) {
                console.error(err);
                alert("Failed to load project data");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [projectId]);

    const filteredEmployees = useMemo(() => {
        return allEmployees.filter((e) => {
            const fullName = `${e.firstName} ${e.lastName || ""}`.toLowerCase();
            return (
                fullName.includes(search.toLowerCase()) ||
                e.email.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [allEmployees, search]);

    const toggleEmployee = (employeeId: string) => {
        setAssignedEmployeeIds((prev) => {
            if (prev.includes(employeeId)) return prev.filter((id) => id !== employeeId);
            return [...prev, employeeId];
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const res = await fetch(`${API_URL}/api/projects/${projectId}/assign-employees`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ employeeIds: assignedEmployeeIds }),
            });

            if (!res.ok) throw new Error("Failed to update employees");

            alert("Employees updated successfully ✅");
            router.push("/projects");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading project employees...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto text-black">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Assign Employees {projectName ? `- ${projectName}` : ""}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Select employees using checkboxes and click Save.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-4 text-gray-600">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search employees by name or email..."
                    className="w-full border rounded-lg px-4 py-2 mb-4"
                />

                <div className="space-y-3 max-h-[500px] overflow-auto pr-2">
                    {filteredEmployees.map((emp) => (
                        <label
                            key={emp.id}
                            className="flex items-center justify-between gap-3 border rounded-lg px-4 py-3 hover:bg-gray-50 cursor-pointer"
                        >
                            <div>
                                <p className="font-medium">
                                    {emp.firstName} {emp.lastName || ""}
                                </p>
                                <p className="text-xs text-gray-500">{emp.email}</p>
                            </div>

                            <input
                                type="checkbox"
                                checked={assignedEmployeeIds.includes(emp.id)}
                                onChange={() => toggleEmployee(emp.id)}
                                className="h-5 w-5"
                            />
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
