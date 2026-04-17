"use client";
import React from "react";

interface SegmentedTabsProps {
    tabs: string[];
    activeTab: string;
    onChange: (tab: string) => void;
}

export default function SegmentedTabs({ tabs, activeTab, onChange }: SegmentedTabsProps) {
    return (
        <div className="flex bg-[#F8F9FA] rounded-full p-1 w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onChange(tab)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                        activeTab === tab 
                            ? "bg-[#05582E] text-white shadow-sm" 
                            : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}