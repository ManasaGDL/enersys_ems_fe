"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/app/utils/api";

type OtType = "FIXED" | "MULTIPLIER";

export default function OtSettingsPage() {
    const [otType, setOtType] = useState<OtType>("FIXED");

    const [fixedOtRate, setFixedOtRate] = useState<number>(150); // ₹ per hour
    const [otMultiplier, setOtMultiplier] = useState<number>(1.5); // multiplier

    const [sundayMultiplier, setSundayMultiplier] = useState<number>(2); // optional
    const [workingDays, setWorkingDays] = useState<number>(26);
    const [workingHours, setWorkingHours] = useState<number>(8);
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_URL}/api/settings`);
                if (!response.ok) {
                    throw new Error("Failed to fetch OT settings");
                }
                const data = await response.json();
                setOtType(data.otType);
                setFixedOtRate(data.fixedOtRate);
                setOtMultiplier(data.otMultiplier);
                setSundayMultiplier(data.sundayMultiplier);
                setWorkingDays(data.workingDays);
                setWorkingHours(data.workingHours);
            } catch (error) {
                console.error("Error fetching OT settings:", error);
            }
        };
        fetchSettings();
    }, []);
    const handleSave = async () => {
        // ✅ UI only for now
        const payload = {
            otType,
            fixedOtRate: otType === "FIXED" ? fixedOtRate : null,
            otMultiplier: otType === "MULTIPLIER" ? otMultiplier : null,
            sundayMultiplier,
            workingDays,
            workingHours,
        };
        try {
            const response = await fetch(`${API_URL}/api/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to save OT settings");
            }

            const data = await response.json();
            console.log("OT Settings saved successfully:", data);
            alert("OT Settings saved successfully ✅");
        } catch (error) {
            console.error("Error saving OT settings:", error);
            alert("Failed to save OT settings ❌");
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto text-black">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">OT Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure default OT rules for the entire application.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90"
                >
                    Save Settings
                </button>
            </div>

            {/* Card */}
            <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
                {/* OT Type */}
                <div>
                    <label className="block text-sm font-medium">OT Calculation Type</label>
                    <select
                        value={otType}
                        onChange={(e) => setOtType(e.target.value as OtType)}
                        className="w-full mt-1 border rounded-lg px-4 py-2"
                    >
                        <option value="FIXED">Fixed Rate (₹ per hour)</option>
                        <option value="MULTIPLIER">Multiplier (x of hourly pay)</option>
                    </select>
                </div>

                {/* Fixed OT Rate */}
                {otType === "FIXED" && (
                    <div>
                        <label className="block text-sm font-medium">Default OT Rate (₹/hour)</label>
                        <input
                            type="number"
                            min={0}
                            value={fixedOtRate}
                            onChange={(e) => setFixedOtRate(Number(e.target.value))}
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                            placeholder="Example: 150"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This rate will apply for all employees (unless overridden later).
                        </p>
                    </div>
                )}

                {/* Multiplier */}
                {otType === "MULTIPLIER" && (
                    <div>
                        <label className="block text-sm font-medium">Default OT Multiplier</label>
                        <input
                            type="number"
                            min={1}
                            step={0.1}
                            value={otMultiplier}
                            onChange={(e) => setOtMultiplier(Number(e.target.value))}
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                            placeholder="Example: 1.5"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Example: 1.5x means OT is paid 1.5 times the normal hourly wage.
                        </p>
                    </div>
                )}

                {/* Sunday OT */}
                <div>
                    <label className="block text-sm font-medium">Sunday / Holiday Multiplier (Optional)</label>
                    <input
                        type="number"
                        min={1}
                        step={0.1}
                        value={sundayMultiplier}
                        onChange={(e) => setSundayMultiplier(Number(e.target.value))}
                        className="w-full mt-1 border rounded-lg px-4 py-2"
                        placeholder="Example: 2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        If Sunday OT differs, use this. Otherwise keep same as OT multiplier.
                    </p>
                </div>

                {/* Work Settings */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Default Working Days / Month</label>
                        <input
                            type="number"
                            min={1}
                            value={workingDays}
                            onChange={(e) => setWorkingDays(Number(e.target.value))}
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                            placeholder="26"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Default Working Hours / Day</label>
                        <input
                            type="number"
                            min={1}
                            value={workingHours}
                            onChange={(e) => setWorkingHours(Number(e.target.value))}
                            className="w-full mt-1 border rounded-lg px-4 py-2"
                            placeholder="8"
                        />
                    </div>
                </div>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 mt-4">
                ✅ Later, we can allow employee-level override OT rules if needed.
            </p>
        </div>
    );
}
