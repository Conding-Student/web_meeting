import React from "react";
import { DASHBOARD_STATS } from "@/mockData";
import { CheckCircle, Users, Briefcase } from "lucide-react";

const icons = {
  "Active Projects": Briefcase,
  "Team Members": Users,
  "Overall Progress": CheckCircle,
};

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {DASHBOARD_STATS.map((stat) => {
        const Icon = icons[stat.label as keyof typeof icons] || Briefcase;
        return (
          <div key={stat.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50">
              <p className="text-sm font-semibold text-[#05582E]">{stat.remarks}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}