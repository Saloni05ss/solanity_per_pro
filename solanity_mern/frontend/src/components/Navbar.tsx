import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { api } from '../api/axios';

interface SearchedUser {
  uid: string;
  username: string;
  useravatarurl: string | null;
}

export default function Navbar() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchedUser[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced user search suggestions lookup
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    const delayDebounceFn = setTimeout(() => {
      api
        .get(`/users/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => {
          setSuggestions(res.data.users || []);
        })
        .catch((err) => {
          console.error('Error fetching user suggestions:', err);
        })
        .finally(() => {
          setLoadingSuggestions(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  function handleSelectUser(uid: string) {
    navigate(`/profile/${uid}`);
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  }

  return (
    <header className="sticky top-0 z-25 border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-800/80 dark:bg-[#0b0f19]/80 transition-colors duration-300">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-1.5 text-xl font-extrabold text-brand-600 dark:text-brand-400 tracking-tight shrink-0">
          <span className="text-2xl">🌱</span>
          <span className="hidden sm:inline">Solanity</span>
        </Link>

        {/* User Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-xs mx-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 dark:text-gray-500 text-xs">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-full border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-800/70 dark:bg-gray-900/50 dark:text-gray-100 dark:focus:ring-brand-400/20 dark:focus:border-brand-400 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-[#111827] overflow-hidden z-30 max-h-60 overflow-y-auto">
              {loadingSuggestions ? (
                <div className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                  Searching...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {suggestions.map((u) => (
                    <button
                      key={u.uid}
                      onClick={() => handleSelectUser(u.uid)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                      <img
                        src={u.useravatarurl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=random`}
                        alt={u.username}
                        className="h-7 w-7 rounded-full object-cover ring-1 ring-gray-100 dark:ring-gray-850"
                      />
                      <span className="text-xs font-bold text-gray-850 dark:text-gray-200 truncate">
                        {u.username}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {darkMode ? (
              <span className="text-lg">☀️</span>
            ) : (
              <span className="text-lg">🌙</span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2.5">
              <Link to={`/profile/${user.uid}`} className="flex items-center gap-2 group">
                <img
                  src={user.useravatarurl || `https://ui-avatars.com/api/?name=${user.username}`}
                  alt={user.username}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-brand-500 transition-all duration-200"
                />
                <span className="hidden text-xs font-bold text-gray-700 dark:text-gray-300 md:inline group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {user.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-850 transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-sm transition-all"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
