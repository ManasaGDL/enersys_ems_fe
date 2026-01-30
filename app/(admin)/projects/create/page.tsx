"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProjectForm, { ProjectFormValues } from "@/components/projects/ProjectForm";
import { API_URL } from "@/app/utils/api";

export default function CreateProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async (values: ProjectFormValues) => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_URL}/api/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to create project");

            router.push("/projects");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            {error && (
                <div className="max-w-2xl mx-auto mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                    {error}
                </div>
            )}

            <ProjectForm
                title="Create Project"
                subtitle="Create a new project and assign employees to it."
                buttonText="Create Project"
                loading={loading}
                onSubmit={handleCreate}
            />
        </div>
    );
}
