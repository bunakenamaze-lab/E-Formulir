import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Sun, Moon, Search, LogOut, User, Settings, ChevronDown,
} from 'lucide-react';import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import NotificationPanel from '@/components/shared/NotificationPanel';
import { cn, getInitials } from '@/lib/utils';

interface HeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  onMobileMenuToggle: () => void;
}

export default function Header({ sidebarOpen, onSidebarToggle, onMobileMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 gap-4">
      {/* Left side */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="hidden lg:flex"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb / Title */}
        <div className="hidden sm:block">
          <p className="text-xs text-muted-foreground">PCNU Kota Bandung</p>
          <p className="text-sm font-semibold">Sistem Formulir Digital</p>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-sm">
        <AnimatePresence>
          {showSearch ? (
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.8 }}
            >
              <Input
                placeholder="Cari formulir..."
                autoFocus
                className="h-8 text-sm"
                onBlur={() => setShowSearch(false)}
              />
            </motion.div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(true)}
              className="text-muted-foreground gap-2 hidden sm:flex"
            >
              <Search className="h-4 w-4" />
              <span className="text-xs">Cari formulir...</span>
              <kbd className="ml-1 text-[10px] border rounded px-1">⌘K</kbd>
            </Button>
          )}
        </AnimatePresence>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <NotificationPanel />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-nu-700 text-xs font-bold text-white">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
                {user?.name}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground font-normal truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
