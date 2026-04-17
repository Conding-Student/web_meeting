"use client";
import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface Option {
    id: string;
    label: string;
}

export default function SearchableDropdown({
    options,
    onSelect,
}: {
    options: Option[]; // Use the interface here
    onSelect: (id: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(options[0]);
    const [search, setSearch] = useState("");

    // FIX: Define the 'filtered' variable
    const filtered = options.filter((opt: Option) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelection = (opt: Option) => {
        setSelected(opt);
        onSelect(opt.id);
        setIsOpen(false);
        setSearch(""); // Optional: Clear search on select
    };

    return (
        <div className="relative w-full md:w-[350px]">
            <button
                type="button" // Good practice to prevent accidental form submits
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-6 py-3 bg-white border border-gray-100 rounded-full text-sm font-bold text-[#05582E] shadow-sm hover:bg-gray-50 transition-all"
            >
                <span>{selected?.label || "Select option..."}</span>
                <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <>
                    {/* Optional: Backdrop to close dropdown when clicking outside */}
                    <div 
                        className="fixed inset-0 z-[50]" 
                        onClick={() => setIsOpen(false)} 
                    />
                    
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-3 border-b border-gray-50">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                                    size={16}
                                />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search sites..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {filtered.length > 0 ? (
                                filtered.map((opt: Option) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleSelection(opt)}
                                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                            selected.id === opt.id
                                                ? "bg-[#05582E]/5 text-[#05582E] font-bold"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-gray-400 font-medium">
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}