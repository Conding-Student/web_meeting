// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import { ChevronDown, LogOut, Lock, User as UserIcon } from "lucide-react";
// import { USER_MOCK } from "../../mockData";

// export default function Header() {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsProfileOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40">
//       <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>

//       <div className="relative" ref={dropdownRef}>
//         <div 
//           onClick={() => setIsProfileOpen(!isProfileOpen)}
//           className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-all"
//         >
//           <div className="w-10 h-10 bg-[#1E4637] rounded-full flex items-center justify-center text-white">
//             <UserIcon size={20} />
//           </div>
//           <div className="hidden md:block">
//             <p className="text-sm font-bold text-gray-900 leading-none">{USER_MOCK.name}</p>
//             <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">System Admin</p>
//           </div>
//           <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
//         </div>

//         {/* Profile Card / Dropdown */}
//         {isProfileOpen && (
//           <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
//             {/* User Banner */}
//             <div className="h-24 bg-linear-to-br from-[#D9E392] to-[#B5C94B] p-6" />
            
//             <div className="px-6 pb-6 -mt-10">
//               <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md mb-3">
//                 <div className="w-full h-full bg-[#1E4637] rounded-full flex items-center justify-center text-white">
//                   <UserIcon size={32} />
//                 </div>
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 leading-none">{USER_MOCK.name}</h3>
//               <p className="text-sm text-gray-400 mt-1">{USER_MOCK.id}</p>

//               <div className="mt-6 space-y-4">
//                 {[
//                   { label: "Role", value: USER_MOCK.role, icon: UserIcon },
//                   { label: "Institution", value: USER_MOCK.institution, icon: Lock }, // Icon just for placeholder
//                 ].map((info, idx) => (
//                   <div key={idx} className="flex gap-3">
//                     <info.icon size={16} className="text-gray-400 mt-1" />
//                     <div>
//                       <p className="text-[10px] font-bold text-gray-400 uppercase">{info.label}</p>
//                       <p className="text-sm font-semibold text-gray-700">{info.value}</p>
//                     </div>
//                   </div>
//                 ))}
//                 <div className="flex items-center gap-2 text-[#05582E] font-bold text-sm">
//                   <span className="w-2 h-2 rounded-full bg-green-500" />
//                   {USER_MOCK.status}
//                 </div>
//               </div>

//               <div className="mt-8 space-y-3">
//                 <button className="w-full py-3 border border-[#05582E] text-[#05582E] rounded-xl text-sm font-bold hover:bg-green-50 transition-colors">
//                   Change Password
//                 </button>
//                 <button className="w-full py-3 bg-[#1E4637] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#163529] transition-colors">
//                   <LogOut size={18} /> Logout
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }









// // shared/layout/Header.tsx
// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import { ChevronDown, LogOut, Lock, User as UserIcon, Home } from "lucide-react";
// import { USER_MOCK } from "mockData";

// // Page title mapping
// const PAGE_TITLES: Record<string, string> = {
//   "/dashboard": "Dashboard",
//   "/ui-test": "UI Components",
//   "/staff": "Staff Management",
//   "/reports": "Reports",
//   "/settings": "Settings",
//   "/error-handler/stay-tuned": "Stay Tuned",
//   "/error-handler/404": "404 Error Page",
// };

// // Breadcrumb mapping for custom labels
// const BREADCRUMB_LABELS: Record<string, string> = {
//   "dashboard": "Dashboard",
//   "ui-test": "UI Components",
//   "staff": "Staff Management",
//   "reports": "Reports",
//   "settings": "Settings",
//   "error-handler": "Error Handler",
//   "stay-tuned": "Stay Tuned",
//   "404": "404 Error",
// };

// export default function Header() {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const pathname = usePathname();

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsProfileOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Generate breadcrumbs from pathname
//   const generateBreadcrumbs = () => {
//     const paths = pathname.split("/").filter((path) => path !== "");
    
//     const breadcrumbs = paths.map((path, index) => {
//       const href = "/" + paths.slice(0, index + 1).join("/");
//       const label = BREADCRUMB_LABELS[path] || path.charAt(0).toUpperCase() + path.slice(1);
      
//       return {
//         href,
//         label,
//         isLast: index === paths.length - 1,
//       };
//     });

//     return breadcrumbs;
//   };

//   const breadcrumbs = generateBreadcrumbs();
//   const pageTitle = PAGE_TITLES[pathname] || breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard";

//   return (
//     <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
//       <div className="flex flex-col">
//         {/* Dynamic Page Title */}
//         <h2 className="text-xl font-bold text-gray-800">{pageTitle}</h2>
        
//         {/* Breadcrumbs */}
//         {breadcrumbs.length > 0 && (
//           <nav className="flex items-center gap-2 text-sm mt-1">
//             <Link href="/" className="text-gray-400 hover:text-teal-600 transition-colors">
//               <Home size={14} />
//             </Link>
//             {breadcrumbs.map((crumb, idx) => (
//               <React.Fragment key={crumb.href}>
//                 <span className="text-gray-300">/</span>
//                 {crumb.isLast ? (
//                   <span className="text-teal-600 font-medium">{crumb.label}</span>
//                 ) : (
//                   <Link 
//                     href={crumb.href} 
//                     className="text-gray-500 hover:text-teal-600 transition-colors"
//                   >
//                     {crumb.label}
//                   </Link>
//                 )}
//               </React.Fragment>
//             ))}
//           </nav>
//         )}
//       </div>

//       <div className="relative" ref={dropdownRef}>
//         <div 
//           onClick={() => setIsProfileOpen(!isProfileOpen)}
//           className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-all"
//         >
//           <div className="w-10 h-10 bg-[#1E4637] rounded-full flex items-center justify-center text-white">
//             <UserIcon size={20} />
//           </div>
//           <div className="hidden md:block">
//             <p className="text-sm font-bold text-gray-900 leading-none">{USER_MOCK.name}</p>
//             <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">System Admin</p>
//           </div>
//           <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
//         </div>

//         {/* Profile Card / Dropdown */}
//         {isProfileOpen && (
//           <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
//             {/* User Banner */}
//             <div className="h-24 bg-gradient-to-br from-[#D9E392] to-[#B5C94B] p-6" />
            
//             <div className="px-6 pb-6 -mt-10">
//               <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md mb-3">
//                 <div className="w-full h-full bg-[#1E4637] rounded-full flex items-center justify-center text-white">
//                   <UserIcon size={32} />
//                 </div>
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 leading-none">{USER_MOCK.name}</h3>
//               <p className="text-sm text-gray-400 mt-1">{USER_MOCK.id}</p>

//               <div className="mt-6 space-y-4">
//                 {[
//                   { label: "Role", value: USER_MOCK.role, icon: UserIcon },
//                   { label: "Institution", value: USER_MOCK.institution, icon: Lock },
//                 ].map((info, idx) => (
//                   <div key={idx} className="flex gap-3">
//                     <info.icon size={16} className="text-gray-400 mt-1" />
//                     <div>
//                       <p className="text-[10px] font-bold text-gray-400 uppercase">{info.label}</p>
//                       <p className="text-sm font-semibold text-gray-700">{info.value}</p>
//                     </div>
//                   </div>
//                 ))}
//                 <div className="flex items-center gap-2 text-[#05582E] font-bold text-sm">
//                   <span className="w-2 h-2 rounded-full bg-green-500" />
//                   {USER_MOCK.status}
//                 </div>
//               </div>

//               <div className="mt-8 space-y-3">
//                 <button className="w-full py-3 border border-[#05582E] text-[#05582E] rounded-xl text-sm font-bold hover:bg-green-50 transition-colors">
//                   Change Password
//                 </button>
//                 <button className="w-full py-3 bg-[#1E4637] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#163529] transition-colors">
//                   <LogOut size={18} /> Logout
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }


// shared/layout/Header.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronDown, LogOut, Lock, User as UserIcon, Home, 
  ChevronRight, Settings, Bell, Search 
} from "lucide-react";
import { USER_MOCK } from "mockData";

interface Breadcrumb {
  href: string;
  label: string;
  isLast: boolean;
  isClickable: boolean; // New property to determine if breadcrumb should be clickable
}

// Define which routes are actual pages (leaf nodes)
const CLICKABLE_ROUTES = new Set([
  "/dashboard",
  "/ui-test",
  "/staff",
  "/reports", 
  "/settings",
  "/error-handler/stay-tuned",
  "/error-handler/404",
]);

// Define parent routes that should NOT be clickable
const NON_CLICKABLE_PARENTS = new Set([
  "/error-handler",
]);

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

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

  // Page configuration
  const pageConfig: Record<string, { title: string; icon?: React.ReactNode }> = {
    "/dashboard": { title: "Dashboard" },
    "/ui-test": { title: "UI Components" },
    "/staff": { title: "Staff Management" },
    "/reports": { title: "Reports" },
    "/settings": { title: "Settings" },
    "/error-handler/stay-tuned": { title: "Stay Tuned" },
    "/error-handler/404": { title: "404 Error Page" },
  };

  // Generate breadcrumbs from pathname with clickable logic
  const generateBreadcrumbs = (): Breadcrumb[] => {
    const paths = pathname.split("/").filter((path) => path !== "");
    
    const breadcrumbs: Breadcrumb[] = [
      { 
        href: "/", 
        label: "Home", 
        isLast: paths.length === 0,
        isClickable: true // Home is always clickable
      }
    ];
    
    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      let label = path.charAt(0).toUpperCase() + path.slice(1);
      
      // Custom labels for specific paths
      if (path === "ui-test") label = "UI Components";
      if (path === "error-handler") label = "Error Handler";
      if (path === "stay-tuned") label = "Stay Tuned";
      if (path === "dashboard") label = "Dashboard";
      
      // Determine if this breadcrumb should be clickable
      const isClickable = CLICKABLE_ROUTES.has(currentPath) && !NON_CLICKABLE_PARENTS.has(currentPath);
      const isLast = index === paths.length - 1;
      
      breadcrumbs.push({
        href: currentPath,
        label,
        isLast,
        isClickable,
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const currentPageConfig = pageConfig[pathname] || { title: breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard" };
  const pageTitle = currentPageConfig.title;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      {/* Left Section - Title & Breadcrumbs */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {currentPageConfig.icon && (
            <span className="text-teal-600">{currentPageConfig.icon}</span>
          )}
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            {pageTitle}
          </h1>
        </div>
        
        {/* Breadcrumbs Navigation */}
        {breadcrumbs.length > 1 && (
          <nav className="flex items-center gap-1.5 text-sm mt-1" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight size={14} className="text-gray-300" />}
                {crumb.isLast ? (
                  <span className="text-[#1E4637]  font-medium text-xs">
                    {crumb.label}
                  </span>
                ) : crumb.isClickable ? (
                  <Link 
                    href={crumb.href} 
                    className="text-gray-500 hover:text-[#1E4637]  transition-colors text-xs"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-400 text-xs cursor-default">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {/* Right Section - Search & Profile */}
      <div className="flex items-center gap-4">
        {/* Global Search (Optional) */}
        <form onSubmit={handleSearch} className="hidden lg:block">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
            />
          </div>
        </form>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#1E4637] to-[#2a6b4e] rounded-full flex items-center justify-center text-white shadow-md">
              <UserIcon size={20} />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-gray-900 leading-none">{USER_MOCK.name}</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">{USER_MOCK.role}</p>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="h-24 bg-gradient-to-br from-[#D9E392] to-[#B5C94B]" />
              
              <div className="px-6 pb-6 -mt-10">
                <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md mb-3">
                  <div className="w-full h-full bg-gradient-to-br from-[#1E4637] to-[#2a6b4e] rounded-full flex items-center justify-center text-white">
                    <UserIcon size={32} />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900">{USER_MOCK.name}</h3>
                <p className="text-sm text-gray-500">{USER_MOCK.id}</p>

                <div className="mt-6 space-y-4">
                  <div className="flex gap-3">
                    <UserIcon size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Role</p>
                      <p className="text-sm font-semibold text-gray-700">{USER_MOCK.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Lock size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Institution</p>
                      <p className="text-sm font-semibold text-gray-700">{USER_MOCK.institution}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-semibold text-green-700">{USER_MOCK.status}</span>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button className="w-full py-3 border border-[#05582E] text-[#05582E] rounded-xl text-sm font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                    <Settings size={16} /> Change Password
                  </button>
                  <button className="w-full py-3 bg-[#1E4637] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#163529] transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}