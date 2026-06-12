import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-white border-t border-sage-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-5 w-5 text-primary-600" />
              <span className="text-base font-bold text-gray-900 tracking-tight">AgroTrade</span>
            </div>
            <p className="text-sage-500 text-sm leading-relaxed max-w-xs">
              India's makhana marketplace — connecting Bihar's farmers to buyers across the country with real-time prices.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-sage-600 uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/prices',    label: 'Live Prices' },
                { to: '/profile',   label: 'My Profile' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sage-500 text-sm hover:text-primary-600 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-sage-600 uppercase tracking-wider mb-3">Contact</h4>
            <ul className="space-y-2 text-sage-500 text-sm">
              <li>support@agrotrade.in</li>
              <li>+91 98765 43210</li>
              <li>Darbhanga, Bihar, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sage-100 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sage-400 text-xs">
            © {new Date().getFullYear()} AgroTrade. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sage-400 text-xs">
            <span className="hover:text-sage-600 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-sage-600 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
