"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface Option {
    id: string;
    label: string;
}

interface DropdownProps {
    options: Option[];
    onSelect: (id: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchableDropdown({
    options,
    onSelect,
    placeholder = "Select option...",
    className = "",
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<Option | null>(options[0] || null);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter logic
    const filtered = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelection = (opt: Option) => {
        setSelected(opt);
        onSelect(opt.id);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div ref={dropdownRef} className={`relative w-full md:w-[350px] ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between px-6 py-3 
                    bg-white border border-gray-100 rounded-full 
                    text-sm font-bold shadow-sm transition-all duration-200
                    ${isOpen ? "ring-2 ring-[#05582E]/5 border-[#05582E]/20" : "hover:bg-gray-50"}
                    ${selected ? "text-[#05582E]" : "text-gray-400"}
                `}
            >
                <span className="truncate">{selected?.label || placeholder}</span>
                <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                    {/* Search Input Area */}
                    <div className="p-4 border-b border-gray-50">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                                size={16}
                            />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#05582E]/5 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                        {filtered.length > 0 ? (
                            <div className="p-2">
                                {filtered.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleSelection(opt)}
                                        className={`
                                            w-full flex items-center justify-between px-4 py-3 
                                            text-sm rounded-xl transition-all mb-1 last:mb-0
                                            ${selected?.id === opt.id
                                                ? "bg-[#05582E] text-white font-bold"
                                                : "text-gray-600 hover:bg-[#05582E]/5 hover:text-[#05582E]"
                                            }
                                        `}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {selected?.id === opt.id && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 px-4 text-center">
                                <div className="inline-flex p-3 bg-gray-50 rounded-full mb-3 text-gray-300">
                                    <Search size={20} />
                                </div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                    No results found
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Injected Styles for Custom Scrollbar */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </div>
    );
}