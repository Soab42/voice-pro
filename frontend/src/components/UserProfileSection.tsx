import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export function UserProfileSection() {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  const onLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={profileRef}>
      <Button variant="ghost" className="w-full justify-start p-2" onClick={() => setIsOpen(!isOpen)}>
        <Avatar className="h-8 w-8 mr-3">
          <AvatarFallback className="bg-indigo-100 text-indigo-700">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <p className="text-sm text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
      </Button>
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="p-2">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="border-t border-gray-200" />
          <div className="p-2">
            <Button variant="ghost" className="w-full justify-start p-2" onClick={() => alert('Profile settings clicked')}>
              <Settings className="mr-2 h-4 w-4" />
              Profile Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start p-2" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
