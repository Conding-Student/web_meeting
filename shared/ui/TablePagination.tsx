import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function TablePagination({ totalRecords, currentPage }: { totalRecords: number; currentPage: number }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-100 gap-4">
      <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
        <div className="flex items-center gap-2">
          <span>Items:</span>
          <select className="border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4637]">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
        <span>Showing 1-10 of {totalRecords} records</span>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 text-gray-400 hover:text-gray-900"><ChevronsLeft size={18}/></button>
        <button className="p-2 text-gray-400 hover:text-gray-900"><ChevronLeft size={18}/></button>
        
        {[3, 4].map((page) => (
          <button
            key={page}
            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
              page === currentPage ? "bg-[#1E4637] text-white shadow-lg shadow-green-900/20" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}
        
        <span className="px-2 text-gray-400">...</span>
        <button className="w-10 h-10 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100">12</button>
        
        <button className="p-2 text-gray-400 hover:text-gray-900"><ChevronRight size={18}/></button>
        <button className="p-2 text-gray-400 hover:text-gray-900"><ChevronsRight size={18}/></button>
      </div>
    </div>
  );
}