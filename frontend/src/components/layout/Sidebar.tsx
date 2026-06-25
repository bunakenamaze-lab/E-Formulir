import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, Settings, ClipboardList,
  BarChart3, ChevronRight, X, BookTemplate, ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/forms', icon: FileText, label: 'Formulir' },
  { to: '/templates', icon: BookTemplate, label: 'Template' },
  { to: '/users', icon: Users, label: 'Pengguna', roles: ['SUPER_ADMIN'] },
  { to: '/audit', icon: ScrollText, label: 'Audit Log', roles: ['SUPER_ADMIN'] },
  { to: '/settings', icon: Settings, label: 'Pengaturan', roles: ['SUPER_ADMIN'] },
];

interface SidebarProps {
  collapsed: boolean;
  onClose?: () => void;
}

export default function Sidebar({ collapsed, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <div className="flex h-full flex-col bg-nu-800 text-white dark:bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-nu-700/50">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <span className="text-base font-bold text-white">NU</span>
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-white">E-Formulir</p>
              <p className="text-[10px] text-nu-200">PCNU Kota Bandung</p>
            </div>
          </motion.div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <span className="text-sm font-bold text-white">NU</span>
          </div>
        )}

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10 h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <TooltipProvider delayDuration={0}>
          <ul className="space-y-0.5 px-2">
            {filteredItems.map((item) => (
              <li key={item.to}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                          isActive
                            ? 'bg-white/15 text-white shadow-sm'
                            : 'text-nu-100/80 hover:bg-white/10 hover:text-white',
                          collapsed && 'justify-center px-2'
                        )
                      }
                    >
                      <item.icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                      {!collapsed && location.pathname.startsWith(item.to) && (
                        <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="bg-gray-900 text-white border-0">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            ))}
          </ul>
        </TooltipProvider>
      </nav>

      {/* User info at bottom */}
      {!collapsed && user && (
        <div className="border-t border-nu-700/50 p-4">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-white/10 transition-colors"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nu-500 text-xs font-bold text-white">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{user.name}</p>
              <p className="truncate text-[10px] text-nu-300">{user.role.replace('_', ' ')}</p>
            </div>
          </NavLink>
        </div>
      )}
    </div>
  );
}
