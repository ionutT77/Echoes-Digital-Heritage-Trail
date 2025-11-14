import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, Settings } from 'lucide-react';

function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-neutral-200 z-[1000]">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-heritage-700 rounded-lg flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-neutral-900">Echoes</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/admin"
            className={`p-2 rounded-lg transition-colors ${
              location.pathname === '/admin'
                ? 'bg-heritage-100 text-heritage-700'
                : 'text-heritage-700 hover:bg-heritage-50'
            }`}
            aria-label="Admin"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
