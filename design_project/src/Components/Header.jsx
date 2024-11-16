import React from 'react';
import { FileText, LogOut } from 'lucide-react';

const Header = ({ onLogout }) => {
  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <FileText className="w-6 h-6 text-purple-600" />
            <nav className="flex gap-4">
              
            </nav>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;