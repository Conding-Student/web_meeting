"use client";
import React from "react";
import { Eye } from "lucide-react";
import { TablePagination } from "./TablePagination";

interface TableProps {
    title: string;
    countLabel?: string;
    countValue?: number | string;
    headers: string[];
    data: any[];
}

export default function DataTable({
    title,
    countLabel,
    countValue,
    headers,
    data,
}: TableProps) {
    return (
        <div className="bg-white rounded-[2rem] p-8 border border-gray-50 shadow-sm">
            {/* Table Header - Simplified for Management */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-700">{title}</h2>
                    {countLabel && (
                        <p className="text-xs text-gray-400 font-medium mt-1">
                            {countLabel}: <span className="text-gray-900 font-bold">{countValue}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="bg-[#F8F9FA]">
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest first:rounded-l-2xl last:rounded-r-2xl"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="before:block before:h-2">
                        {data.map((row, idx) => (
                            <tr key={idx} className="bg-white hover:bg-gray-50 transition-all group">
                                <td className="p-4 text-sm text-gray-500 font-medium first:rounded-l-2xl border-y border-l border-gray-100">{row.cid}</td>
                                <td className="p-4 text-sm text-gray-900 font-bold border-y border-gray-100">{row.name}</td>
                                <td className="p-4 text-sm text-gray-500 border-y border-gray-100">{row.institution}</td>
                                <td className="p-4 text-sm text-[#05582E] font-bold border-y border-gray-100">₱ {row.mbl}</td>
                                <td className="p-4 text-sm text-gray-900 font-semibold border-y border-gray-100">₱ {row.dental}</td>
                                <td className="p-4 text-sm text-gray-500 border-y border-gray-100">{row.contact}</td>
                                <td className="p-4 last:rounded-r-2xl border-y border-r border-gray-100">
                                    <button className="p-2 text-gray-400 hover:text-[#05582E] transition-all">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <TablePagination totalRecords={113} currentPage={3} />
        </div>
    );
}