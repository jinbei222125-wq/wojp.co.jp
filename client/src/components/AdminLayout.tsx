import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Newspaper, 
  Briefcase, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Home,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAdminAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-anthracite flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brass" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Use effect to redirect to avoid render-time navigation
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    return (
      <div className="min-h-screen bg-anthracite flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brass mx-auto mb-4" />
          <p className="text-gray-400">ログインページへリダイレクト中...</p>
        </div>
      </div>
    );
  }

  // Check admin role
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-anthracite flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-white mb-4">アクセス権限がありません</h1>
          <p className="text-gray-400 mb-6">管理者としてログインしてください。</p>
          <Link href="/">
            <Button variant="outline" className="border-brass text-brass hover:bg-brass hover:text-anthracite">
              トップページへ戻る
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
    { href: "/admin/news", label: "NEWS管理", icon: Newspaper },
    { href: "/admin/recruit", label: "採用情報管理", icon: Briefcase },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-anthracite border-b border-white/10 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-white hover:text-brass transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-display text-brass font-bold">W.O.JP Admin</span>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-anthracite border-r border-white/10 z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="font-display text-xl font-bold text-brass">W.O.JP</span>
          <span className="text-white/60 text-sm ml-2">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/admin" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? "bg-brass/20 text-brass" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200 mb-2">
              <Home size={20} />
              <span className="font-medium">サイトを見る</span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">ログアウト</span>
          </button>
          <div className="mt-4 px-4 text-xs text-gray-500">
            <p>{user.name || user.email || "管理者"}</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
