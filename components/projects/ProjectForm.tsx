"use client";

import { useState } from "react";

type ProjectStatus = "ACTIVE" | "INACTIVE";

export type ProjectFormValues = {
    name: string;
    description: string;
    status: ProjectStatus;
};

type Props = {
    initialValues?: ProjectFormValues;
    onSubmit: (values: ProjectFormValues) => void;
    loading?: boolean;
    title: string;
    subtitle?: string;
    buttonText: string;
};

export default function ProjectForm({
    initialValues,
    onSubmit,
    loading,
    title,
    subtitle,
    buttonText,
}: Props) {
    const [form, setForm] = useState<ProjectFormValues>({
        name: initialValues?.name || "",
        description: initialValues?.description || "",
        status: initialValues?.status || "ACTIVE",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white border rounded-2xl shadow-sm p-6 text-black">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>

            <form
                className="space-y-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(form);
                }}
            >
                <div>
                    <label className="block text-sm font-medium">Project Name</label>
                    <input
                        name="name"
                        value={form.name}
                        required
                        onChange={handleChange}
                        placeholder="Project A"
                        className="w-full mt-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe the project briefly..."
                        className="w-full mt-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full mt-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? "Please wait..." : buttonText}
                </button>
            </form>
        </div>
    );
}
