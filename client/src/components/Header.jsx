import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks';
import { Menu, X, Moon, Sun, LogOut, User, Plus } from 'lucide-react';

/**
 * Header component with navigation and user menu
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-muted bg-opacity-95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg" />
            <span className="font-bold text-xl hidden sm:inline">VibeBlog</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-primary border-b-2 border-primary'
                  : 'link-hover'
              }`}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/create"
                  className={`text-sm font-medium flex items-center gap-1 transition-colors ${
                    isActive('/create')
                      ? 'text-primary border-b-2 border-primary'
                      : 'link-hover'
                  }`}
                >
                  <Plus size={16} />
                  Create Blog
                </Link>
                <Link
                  to="/profile"
                  className={`text-sm font-medium flex items-center gap-1 transition-colors ${
                    isActive('/profile')
                      ? 'text-primary border-b-2 border-primary'
                      : 'link-hover'
                  }`}
                >
                  <User size={16} />
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 hover:bg-background rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Auth buttons or user menu */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                {/* User avatar and name */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/10 border border-muted/30">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-text">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary px-3 py-2 flex items-center gap-1"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link to="/login" className="btn-secondary px-4 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-background rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className={`block px-4 py-2 rounded transition-colors ${
                isActive('/') ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-background'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                {/* Mobile user info */}
                <div className="px-4 py-3 mx-2 rounded-lg bg-muted/10 border border-muted/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-text">
                      {user?.name}
                    </span>
                  </div>
                </div>
                <Link
                  to="/create"
                  className={`block px-4 py-2 rounded transition-colors ${
                    isActive('/create')
                      ? 'bg-primary/20 text-primary font-semibold'
                      : 'hover:bg-background'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Blog
                </Link>
                <Link
                  to="/profile"
                  className={`block px-4 py-2 rounded transition-colors ${
                    isActive('/profile')
                      ? 'bg-primary/20 text-primary font-semibold'
                      : 'hover:bg-background'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded hover:bg-background transition-colors text-danger font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-4 py-2 rounded transition-colors ${
                    isActive('/login') ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-background'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`block px-4 py-2 rounded transition-colors ${
                    isActive('/register')
                      ? 'bg-primary/20 text-primary font-semibold'
                      : 'hover:bg-background'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
