import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Calendar, Hotel, LogOut, Loader2, Info, 
  LayoutDashboard, BedDouble, Settings, ChevronLeft, CreditCard, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '../components/InvoicePDF';
import { API_URL, safeFetchJson } from '../utils/api';

export const UserDashboard = ({ authUser, setAuthUser, setActivePage }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'Confirmed', 'Completed'
  const [activeView, setActiveView] = useState('bookings'); // 'bookings' or 'billing'

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!authUser?.token) return;
      
      try {
        const { ok, data } = await safeFetchJson(`${API_URL}/bookings/mybookings`, {
          headers: {
            'Authorization': `Bearer ${authUser.token}`
          }
        });
        
        if (ok && Array.isArray(data)) {
          setBookings(data);
        } else {
          toast.error((data && data.message) || "Failed to fetch bookings");
        }
      } catch (error) {
        toast.error("Network error fetching bookings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMyBookings();
  }, [authUser]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    if (setAuthUser) setAuthUser(null);
    setActivePage('home');
    toast.success("Successfully logged out");
  };

  const filteredBookings = activeTab === 'All' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab);

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Cancelled': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Completed': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20'; // Pending
    }
  };

  const getInvoicePrice = (roomName) => {
    // Generate a consistent pseudo-random price based on room string
    let hash = 0;
    for (let i = 0; i < roomName.length; i++) {
      hash = roomName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const price = 250 + (Math.abs(hash) % 800);
    return price.toFixed(2);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-stone-300 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-72 bg-stone-950 border-r border-stone-800 flex flex-col hidden md:flex">
        <div className="p-8 border-b border-stone-900">
          <div className="text-gold-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M11.645 20.91l-.007-.003-.003-.001a.752.752 0 01-.7-.45l-4.5-9a.75.75 0 01.378-1.026l5.25-2.25a.75.75 0 01.57 0l5.25 2.25a.75.75 0 01.377 1.025l-4.5 9a.752.752 0 01-.701.452l-.003.001-.007.003-.06.027a.75.75 0 01-.616 0l-.06-.027zM12 4.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-6 3.75a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25zm12 0a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25z" />
            </svg>
          </div>
          <h2 className="font-serif text-xl tracking-[0.2em] uppercase text-stone-100">Client Portal</h2>
        </div>
        
        <div className="p-6 border-b border-stone-900 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-stone-900 border border-gold-500/20 flex items-center justify-center text-gold-500">
            <User size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-stone-200 truncate">{authUser?.name}</p>
            <p className="text-xs text-gold-500/70 uppercase tracking-wider mt-0.5">VIP Member</p>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => setActiveView('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeView === 'bookings' ? 'bg-stone-900/50 text-gold-500 border border-gold-500/10' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'}`}
          >
            <LayoutDashboard size={18} />
            My Bookings
          </button>
          <button 
            onClick={() => setActiveView('billing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeView === 'billing' ? 'bg-stone-900/50 text-gold-500 border border-gold-500/10' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'}`}
          >
            <CreditCard size={18} />
            Billing & Invoices
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-600 rounded-lg cursor-not-allowed text-sm font-medium">
            <Settings size={18} />
            Account Settings (Coming Soon)
          </button>
        </nav>

        <div className="p-4 border-t border-stone-900 space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        
        <div className="md:hidden flex items-center justify-between p-4 bg-stone-950 border-b border-stone-800">
          <h2 className="font-serif text-lg tracking-widest uppercase text-gold-500">Portal</h2>
        </div>

        {/* Dashboard Header */}
        <header className="px-8 py-10 bg-stone-900/20">
          <h1 className="text-3xl font-serif text-stone-100 mb-2">
            {activeView === 'bookings' ? 'Reservations' : 'Billing & Invoices'}
          </h1>
          <p className="text-stone-400 text-sm">
            {activeView === 'bookings' 
              ? 'Manage your past, present, and future stays with us.'
              : 'Review your transaction history and download invoices.'}
          </p>
        </header>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8">
          
          {activeView === 'bookings' ? (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-8 border-b border-stone-800/50 pb-4 overflow-x-auto hide-scrollbar">
                {['All', 'Pending', 'Confirmed', 'Completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab 
                        ? 'bg-gold-500 text-stone-950 shadow-[0_0_15px_rgba(212,168,83,0.3)]' 
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    {tab} Bookings
                  </button>
                ))}
              </div>

              {/* Bookings List */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 text-gold-500">
                  <Loader2 className="animate-spin w-10 h-10 mb-4" />
                  <p className="text-stone-400 text-sm">Retrieving your reservations...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="bg-stone-900/30 border border-stone-800/50 rounded-2xl p-16 text-center flex flex-col items-center">
                  <BedDouble className="text-stone-600 mb-6 w-16 h-16" />
                  <h3 className="text-xl text-stone-200 mb-2 font-serif">No {activeTab !== 'All' ? activeTab : ''} Reservations Found</h3>
                  <p className="text-stone-500 mb-8 max-w-md text-sm">
                    You don't currently have any reservations matching this status. Explore our luxurious rooms and plan your next getaway.
                  </p>
                  <button 
                    onClick={() => setActivePage('rooms')}
                    className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-stone-950 font-semibold tracking-widest text-xs uppercase rounded-lg transition-all shadow-lg"
                  >
                    Browse Accommodations
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredBookings.map((booking) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={booking._id} 
                        className="bg-stone-900/40 border border-stone-800/60 p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-start md:items-center hover:bg-stone-900/60 transition-colors"
                      >
                        <div className="w-full md:w-40 h-28 bg-stone-950 rounded-xl overflow-hidden flex-shrink-0 border border-stone-800/50">
                          <div className="w-full h-full flex flex-col items-center justify-center text-stone-600">
                            <Hotel className="w-8 h-8 mb-2" />
                            <span className="text-[10px] uppercase tracking-widest">{booking.room.split(' ')[0]}</span>
                          </div>
                        </div>
                        
                        <div className="flex-grow w-full">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-serif text-2xl text-stone-100">{booking.room}</h4>
                              <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-mono">ID: {booking._id}</p>
                            </div>
                            <span className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full border ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-stone-950/50 rounded-xl border border-stone-800/30">
                            <div>
                              <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Check-in Date</p>
                              <div className="flex items-center gap-2 text-sm text-stone-200 font-medium">
                                <Calendar className="w-4 h-4 text-gold-500" />
                                {booking.date}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Guest Name</p>
                              <div className="flex items-center gap-2 text-sm text-stone-200 font-medium">
                                <User className="w-4 h-4 text-gold-500" />
                                {booking.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            /* Billing & Invoices View */
            <div className="animate-fade-in">
              <div className="bg-stone-900/40 border border-stone-800/60 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-5 p-4 border-b border-stone-800/50 text-xs font-medium text-stone-500 uppercase tracking-wider bg-stone-950/50">
                  <div className="col-span-2">Invoice Details</div>
                  <div>Date Issued</div>
                  <div>Amount</div>
                  <div className="text-right">Action</div>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin w-8 h-8 text-gold-500" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-12 text-center text-stone-500">
                    <p>No billing history available.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-800/30">
                    {bookings.map(booking => (
                      <div key={`invoice-${booking._id}`} className="grid grid-cols-5 p-4 items-center hover:bg-stone-800/20 transition-colors">
                        <div className="col-span-2">
                          <p className="text-stone-200 font-medium text-sm">{booking.room}</p>
                          <p className="text-xs text-stone-500 font-mono mt-0.5">INV-{booking._id.substring(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="text-stone-400 text-sm">
                          {booking.date}
                        </div>
                        <div>
                          <p className={`font-serif ${booking.status === 'Cancelled' ? 'text-stone-500 line-through' : 'text-gold-500'}`}>
                            ${getInvoicePrice(booking.room)}
                          </p>
                          <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${
                            booking.status === 'Cancelled' ? 'text-rose-400' : 
                            booking.status === 'Pending' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {booking.status === 'Cancelled' ? 'Voided' : booking.status === 'Pending' ? 'Unpaid' : 'Paid'}
                          </p>
                        </div>
                        <div className="text-right flex justify-end">
                          {booking.status === 'Cancelled' ? (
                            <button 
                              disabled
                              className="flex items-center gap-2 px-3 py-1.5 border border-stone-700 text-stone-400 text-xs uppercase tracking-wider rounded-md opacity-30 cursor-not-allowed"
                            >
                              <Download size={14} /> PDF
                            </button>
                          ) : (
                            <PDFDownloadLink
                              document={<InvoicePDF booking={booking} />}
                              fileName={`Invoice_${booking._id.substring(0,8).toUpperCase()}.pdf`}
                              className="flex items-center gap-2 px-3 py-1.5 border border-stone-700 hover:border-gold-500 hover:text-gold-500 text-stone-400 text-xs uppercase tracking-wider rounded-md transition-colors"
                            >
                              {({ loading }) => (
                                <>
                                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                                  {loading ? 'Loading...' : 'PDF'}
                                </>
                              )}
                            </PDFDownloadLink>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
