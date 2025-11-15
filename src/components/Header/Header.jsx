import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, Settings, LogOut, User, Trophy, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Swal from 'sweetalert2';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();

  const handleSignOut = async () => {
    const result = await Swal.fire({
      title: 'Sign Out',
      text: 'Are you sure you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6f4e35',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, sign out'
    });

    if (result.isConfirmed) {
      const { success, error } = await signOut();
      
      if (success) {
        await Swal.fire({
          title: 'Signed Out',
          text: 'You have been successfully signed out.',
          icon: 'success',
          confirmButtonColor: '#6f4e35',
          timer: 1500
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: error || 'Failed to sign out. Please try again.',
          icon: 'error',
          confirmButtonColor: '#6f4e35'
        });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 z-[1000]">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-heritage-700 rounded-lg flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-neutral-900 dark:text-white">Echoes</span>
        </Link>

        <nav className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-heritage-700 dark:text-heritage-300 hover:bg-heritage-50 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <Link
            to="/leaderboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/leaderboard'
                ? 'bg-heritage-100 dark:bg-heritage-800 text-heritage-700 dark:text-heritage-300'
                : 'text-heritage-700 dark:text-heritage-300 hover:bg-heritage-50 dark:hover:bg-neutral-700'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Leaderboard</span>
          </Link>
          
          {user && (
            <>
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-heritage-50 dark:hover:bg-neutral-700 px-3 py-2 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-heritage-700 dark:text-heritage-300" />
                <span className="text-heritage-700 dark:text-heritage-300 font-medium">
                  {profile?.username || 'User'}
                </span>
              </div>
              {profile?.is_admin && (
                <Link
                  to="/admin"
                  className={`p-2 rounded-lg transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-heritage-100 dark:bg-heritage-800 text-heritage-700 dark:text-heritage-300'
                      : 'text-heritage-700 dark:text-heritage-300 hover:bg-heritage-50 dark:hover:bg-neutral-700'
                  }`}
                  aria-label="Admin"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-heritage-700 dark:text-heritage-300 hover:bg-heritage-50 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
          {!user && (
          <Link
            to="/login"
            className={`p-2 rounded-lg transition-colors ${
              location.pathname === '/login'
                ? 'bg-heritage-100 dark:bg-heritage-800 text-heritage-700 dark:text-heritage-300'
                : 'text-heritage-700 dark:text-heritage-300 hover:bg-heritage-50 dark:hover:bg-neutral-700'
            }`}
            aria-label="Log In"
          >
            <User className="w-5 h-5" />
          </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;