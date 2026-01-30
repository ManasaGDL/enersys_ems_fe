"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProjectForm, { ProjectFormValues } from "@/components/projects/ProjectForm";
import { API_URL } from "@/app/utils/api";

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [project, setProject] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchProject = async () => {
        try {
            setFetching(true);
            const res = await fetch(`${API_URL}/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch project");
            const data = await res.json();
            setProject(data?.project);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleUpdate = async (values: ProjectFormValues) => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_URL}/api/projects/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to update project");

            router.push("/projects");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="p-6">
                <div className="max-w-2xl mx-auto bg-white border rounded-2xl shadow-sm p-6">
                    Loading project...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {error && (
                <div className="max-w-2xl mx-auto mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                    {error}
                </div>
            )}

            <ProjectForm
                title="Edit Project"
                subtitle="Update project details."
                buttonText="Update Project"
                loading={loading}
                initialValues={{
                    name: project?.name || "",
                    description: project?.description || "",
                    status: project?.status || "ACTIVE",
                }}
                onSubmit={handleUpdate}
            />
        </div>
    );
}
