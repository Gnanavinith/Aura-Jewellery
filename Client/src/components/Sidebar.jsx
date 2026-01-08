import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, TrendingUp, Gem } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Billing', path: '/billing', icon: Receipt },
    { name: 'Rates', path: '/rates', icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="flex items-center justify-center h-20 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
            <Gem className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-white text-lg font-bold">Aura</span>
            <span className="text-amber-400 text-lg font-bold ml-1">Jewellary</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-400 border-l-4 border-amber-400'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-400' : ''}`} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700/50">
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl p-4">
          <p className="text-amber-400 text-xs font-medium mb-1">Coimbatore</p>
          <p className="text-gray-400 text-xs">Gold Rate Location</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
