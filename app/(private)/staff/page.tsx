"use client";
import React, { useState } from "react";
import SearchableDropdown from "@/shared/ui/SearchableDropdown";
import { Search, UserPlus } from "lucide-react";
import DataTable from "@/shared/ui/DataTable";
import SegmentedTabs from "@/shared/ui/SegmentedTabs";

const INSTITUTIONS = [
    { id: "1", label: "Bakawan Data Analytics" },
    { id: "1387", label: "CARD Indogrosir HO (ID: 1387)" },
];

const STAFF_DATA = [
    { cid: "CID-2026-0001", name: "Juan Dela Cruz", institution: "Bakawan Data Analytics", mbl: "185,000.00", dental: "8,500.00", contact: "09171234567" },
    { cid: "CID-2026-0002", name: "Maria Santos", institution: "Bakawan Data Analytics", mbl: "185,000.00", dental: "0.00", contact: "09171234567" },
    { cid: "CID-2026-0003", name: "Carlos Reyes", institution: "Bakawan Data Analytics", mbl: "185,000.00", dental: "10,000.00", contact: "09171234567" },
];

export default function StaffManagementPage() {
    const [activeTab, setActiveTab] = useState("Sample1");

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4">
            {/* Reusable Segmented Tabs matching reference */}
            <SegmentedTabs 
                tabs={["Sample1", "Sample2", "Sample3"]} 
                activeTab={activeTab} 
                onChange={setActiveTab} 
            />

            {/* Control Row matching Screenshot 2026-04-17 at 4.48.24 PM */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* Searchable Dropdown - Styled with rounded-full */}
                    <SearchableDropdown 
                        options={INSTITUTIONS} 
                        onSelect={() => {}} 
                    />
                    
                    {/* Search Bar - Matching the rounded white style with left icon */}
                    <div className="relative w-full md:w-112.5">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Client CID or Name"
                            className="w-full pl-14 pr-6 py-3 bg-white border border-gray-100 rounded-full text-sm font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#05582E]/5 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Add Staff Button - Styled like "Review Variance" in Screenshot */}
                    <button className="px-8 py-3 bg-[#1E4637] text-white rounded-xl text-sm font-bold hover:bg-[#163a2d] transition-all flex items-center gap-2 shadow-sm">
                        <UserPlus size={18} />
                        Add New Staff
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <DataTable
                title="Staff Directory"
                countLabel="Total Active Records"
                countValue={113}
                headers={["CID", "Full Name", "Institution", "Remaining MBL", "Remaining Dental", "Contact No.", "Action"]}
                data={STAFF_DATA}
            />
        </div>
    );
}