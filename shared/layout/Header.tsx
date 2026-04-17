"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Lock, User as UserIcon } from "lucide-react";
import { USER_MOCK } from "../../mockData";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40">
      <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>

      <div className="relative" ref={dropdownRef}>
        <div 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-all"
        >
          <div className="w-10 h-10 bg-[#1E4637] rounded-full flex items-center justify-center text-white">
            <UserIcon size={20} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-gray-900 leading-none">{USER_MOCK.name}</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">System Admin</p>
          </div>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
        </div>

        {/* Profile Card / Dropdown */}
        {isProfileOpen && (
          <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* User Banner */}
            <div className="h-24 bg-gradient-to-br from-[#D9E392] to-[#B5C94B] p-6" />
            
            <div className="px-6 pb-6 -mt-10">
              <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md mb-3">
                <div className="w-full h-full bg-[#1E4637] rounded-full flex items-center justify-center text-white">
                  <UserIcon size={32} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 leading-none">{USER_MOCK.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{USER_MOCK.id}</p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Role", value: USER_MOCK.role, icon: UserIcon },
                  { label: "Institution", value: USER_MOCK.institution, icon: Lock }, // Icon just for placeholder
                ].map((info, idx) => (
                  <div key={idx} className="flex gap-3">
                    <info.icon size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{info.label}</p>
                      <p className="text-sm font-semibold text-gray-700">{info.value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[#05582E] font-bold text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {USER_MOCK.status}
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button className="w-full py-3 border border-[#05582E] text-[#05582E] rounded-xl text-sm font-bold hover:bg-green-50 transition-colors">
                  Change Password
                </button>
                <button className="w-full py-3 bg-[#1E4637] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#163529] transition-colors">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}