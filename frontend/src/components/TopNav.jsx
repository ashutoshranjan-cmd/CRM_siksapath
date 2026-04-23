import { useAuth } from "../context/AuthContext";

function getInitials(name = "") {
    const parts = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (parts.length === 0) {
        return "CRM";
    }

    return parts.map((part) => part[0].toUpperCase()).join("");
}

export default function TopNav({ onMenuToggle }) {
    const { user } = useAuth();

    return (
        <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 z-30 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 font-sans antialiased text-sm font-medium">
            {/* Left: Mobile menu + Search */}
            <div className="flex items-center flex-1 gap-4">
                <button
                    onClick={onMenuToggle}
                    className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors lg:hidden"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="relative w-full max-w-md hidden md:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface placeholder-gray-500 text-sm"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:bg-gray-50 transition-colors rounded-full">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-50 transition-colors rounded-full">
                    <span className="material-symbols-outlined">settings</span>
                </button>
                <div className="h-8 w-px bg-gray-200 mx-2" />
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-on-surface">{user?.name || "CRM User"}</p>
                    <p className="text-xs text-on-surface-variant">{user?.role === "super_admin" ? "Super Admin" : "Admin"}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-container overflow-hidden border border-outline-variant cursor-pointer flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user?.name)}
                </div>
            </div>
        </header>
    );
}
