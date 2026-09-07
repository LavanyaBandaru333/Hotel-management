import React, { useState } from 'react';
import { ShieldCheck, Calendar, Users, Hotel, ChevronRight, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL, safeFetchJson } from '../utils/api';

// Import local assets
import roomDeluxeImg from '../assets/room_deluxe.jpg';
import roomJuniorImg from '../assets/room_junior.jpg';
import roomExecutiveImg from '../assets/room_executive.jpg';
import roomPresidentialImg from '../assets/room_presidential.jpg';

export const Booking = ({ bookingState, setBookingState, authUser, setActivePage }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [successCode, setSuccessCode] = useState('');
  const [formData, setFormData] = useState({
    firstName: authUser ? authUser.name.split(' ')[0] : '',
    lastName: authUser && authUser.name.split(' ').length > 1 ? authUser.name.split(' ').slice(1).join(' ') : '',
    email: authUser ? authUser.email : '',
    phone: '',
    requests: ''
  });

  const roomsData = {
    'Deluxe Room': { price: 350, taxRate: 0.12, image: roomDeluxeImg },
    'Junior Suite': { price: 550, taxRate: 0.12, image: roomJuniorImg },
    'Executive Suite': { price: 950, taxRate: 0.12, image: roomExecutiveImg },
    'Presidential Villa': { price: 2500, taxRate: 0.12, image: roomPresidentialImg }
  };

  const selectedRoom = bookingState.selectedRoom || 'Deluxe Room';
  const checkIn = bookingState.checkIn || '';
  const guests = bookingState.guests || '2 Guests';
  const roomsCount = bookingState.rooms || 1;

  // Pricing calculations
  const defaultRoomData = { price: 400, taxRate: 0.12, image: roomDeluxeImg };
  const roomInfo = roomsData[selectedRoom] || defaultRoomData;
  const pricePerNight = roomInfo.price;
  const nights = 3; // Mocking a 3 night stay
  const subtotal = pricePerNight * nights * roomsCount;
  const taxes = subtotal * roomInfo.taxRate;
  const grandTotal = subtotal + taxes;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleRoomChange = (room) => {
    setBookingState(prev => ({ ...prev, selectedRoom: room }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        room: selectedRoom,
        date: checkIn || '2026-07-20',
        status: 'Pending'
      };
      
      const { ok, data } = await safeFetchJson(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser?.token}`
        },
        body: JSON.stringify(payload)
      });
      if(ok && data.success) {
        toast.success("Reservation successful!");
        // Immediately redirect to the user's dashboard to see the booking
        setTimeout(() => {
          if(setActivePage) setActivePage('dashboard');
        }, 1000); // Small delay to let the toast show
      } else {
        toast.error("Booking failed: " + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting booking");
    }
  };

  return (
    <div className="pt-28 pb-20 bg-luxury-bg">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-16">
        <h1 className="font-serif text-4xl md:text-6xl text-gold-500 font-light tracking-wider mb-4">
          Reserve Your Stay
        </h1>
        <p className="text-stone-400 max-w-xl mx-auto text-sm tracking-widest uppercase font-light font-sans">
          Complete the fields below to confirm your private sanctuary.
        </p>
        <div className="w-16 h-[1px] bg-gold-500/50 mx-auto mt-6"></div>
      </div>

      {isSuccess ? (
        <div className="max-w-3xl mx-auto px-6 text-center py-16 bg-[#13100e] border border-gold-500/20 rounded-sm shadow-2xl">
          <div className="w-20 h-20 bg-gold-500/10 border border-gold-500/30 rounded-full flex items-center justify-center text-gold-500 mx-auto mb-8 animate-bounce">
            <Award size={40} />
          </div>
          <h2 className="font-serif text-4xl text-gold-500 mb-2">Reservation Confirmed</h2>
          <p className="text-stone-300 font-light max-w-md mx-auto mb-8 text-sm leading-relaxed font-sans">
            Your reservation is complete. A confirmation email including airport transfer details, pre-arrival checklist, and itinerary has been sent to <strong className="text-stone-100 font-semibold">{formData.email}</strong>.
          </p>

          <div className="max-w-sm mx-auto bg-stone-950/60 border border-gold-500/10 rounded-sm p-6 mb-10 text-left flex flex-col gap-3 font-light text-sm">
            <div className="flex justify-between border-b border-gold-500/10 pb-2">
              <span className="text-stone-500">Booking Code:</span>
              <span className="text-gold-500 font-mono font-semibold">{successCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Guest:</span>
              <span className="text-stone-200">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Accommodation:</span>
              <span className="text-stone-200">{selectedRoom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Rooms & Capacity:</span>
              <span className="text-stone-200">{roomsCount} Room / {guests}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gold-500/10 text-base font-serif">
              <span className="text-gold-500">Total Charged:</span>
              <span className="text-stone-100">${grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSuccess(false);
              setBookingState({});
              setFormData({ firstName: '', lastName: '', email: '', phone: '', requests: '' });
            }}
            className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-stone-950 hover:text-stone-900 transition-all duration-300 font-serif tracking-[0.25em] text-xs uppercase rounded-sm font-semibold"
          >
            Book Another Room
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-12 font-sans">
          
          {/* Reservation details Form */}
          <div className="lg:col-span-2 bg-[#13100e] border border-gold-500/5 p-8 md:p-12 rounded-sm shadow-xl flex flex-col gap-8">
            <div>
              <span className="text-gold-500 text-xs tracking-[0.25em] uppercase font-semibold">Step 1 of 2</span>
              <h2 className="font-serif text-3xl text-stone-100 mt-2">Guest Specifications</h2>
              <div className="w-12 h-[1px] bg-gold-500/30 mt-3"></div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase text-stone-400 tracking-wider font-semibold">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-stone-900 border border-gold-500/15 focus:border-gold-500 text-stone-300 text-sm px-4 py-3 rounded-sm focus:outline-none transition-colors"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase text-stone-400 tracking-wider font-semibold">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-stone-900 border border-gold-500/15 focus:border-gold-500 text-stone-300 text-sm px-4 py-3 rounded-sm focus:outline-none transition-colors"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase text-stone-400 tracking-wider font-semibold">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-stone-900 border border-gold-500/15 focus:border-gold-500 text-stone-300 text-sm px-4 py-3 rounded-sm focus:outline-none transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase text-stone-400 tracking-wider font-semibold">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-stone-900 border border-gold-500/15 focus:border-gold-500 text-stone-300 text-sm px-4 py-3 rounded-sm focus:outline-none transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase text-stone-400 tracking-wider font-semibold">Special Requests (Optional)</label>
                <textarea
                  rows={4}
                  value={formData.requests}
                  onChange={(e) => handleInputChange('requests', e.target.value)}
                  className="bg-stone-900 border border-gold-500/15 focus:border-gold-500 text-stone-300 text-sm px-4 py-3 rounded-sm focus:outline-none transition-colors resize-none"
                  placeholder="Dietary requests, pillows type, airport transfer flight code, etc."
                />
              </div>

              {/* Verification & Secure checkout banner */}
              <div className="flex items-center gap-4 bg-stone-900 border border-gold-500/5 p-4 rounded-sm">
                <ShieldCheck className="text-gold-500 shrink-0" size={24} />
                <p className="text-xs text-stone-400 font-light leading-relaxed">
                  Payments are secure. We charge a credit card guarantee, but full payment is settled at checkout. Free cancellation up to 48 hours prior to arrival.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gold-500 hover:bg-gold-600 text-stone-950 hover:text-stone-900 transition-all duration-300 font-serif tracking-[0.25em] text-sm uppercase rounded-sm font-semibold mt-4 shadow-lg flex items-center justify-center gap-2"
              >
                <span>Confirm Luxury Reservation</span>
                <ChevronRight size={18} />
              </button>
            </form>
          </div>

          {/* Booking Summary sidebar */}
          <div className="flex flex-col gap-6">
            
            {/* Summary details */}
            <div className="bg-[#13100e] border border-gold-500/5 p-8 rounded-sm shadow-xl flex flex-col gap-6">
              <div>
                <h3 className="font-serif text-2xl text-stone-100">Reservation Summary</h3>
                <div className="w-10 h-[1px] bg-gold-500/30 mt-2"></div>
              </div>

              {/* Room Selected Image */}
              <div className="h-44 overflow-hidden rounded-sm border border-gold-500/10">
                <img 
                  src={roomInfo.image} 
                  alt={selectedRoom} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details specifications */}
              <div className="flex flex-col gap-4 text-xs font-light text-stone-300 border-b border-gold-500/10 pb-6">
                
                {/* Select Room type inline dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-stone-500 tracking-wider font-semibold">Select Accommodation</label>
                  <select 
                    value={selectedRoom} 
                    onChange={(e) => handleRoomChange(e.target.value)}
                    className="w-full bg-stone-900 border border-gold-500/15 focus:border-gold-500 text-stone-300 text-sm px-3 py-2 rounded-sm focus:outline-none cursor-pointer appearance-none"
                  >
                    {Object.keys(roomsData).map((room) => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gold-500/60" />
                    <span>Check-in Date:</span>
                  </div>
                  <span className="font-sans font-semibold text-stone-200">{checkIn || '2026-07-20'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gold-500/60" />
                    <span>Check-out Date:</span>
                  </div>
                  <span className="font-sans font-semibold text-stone-200">2026-07-23 (3 Nights)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gold-500/60" />
                    <span>Guests Capacity:</span>
                  </div>
                  <span className="font-sans font-semibold text-stone-200">{guests}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hotel size={14} className="text-gold-500/60" />
                    <span>Rooms Count:</span>
                  </div>
                  <span className="font-sans font-semibold text-stone-200">{roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'}</span>
                </div>
              </div>

              {/* Checkout Calculation */}
              <div className="flex flex-col gap-3 text-xs font-light">
                <div className="flex justify-between">
                  <span className="text-stone-400">${pricePerNight} x {nights} nights x {roomsCount} room</span>
                  <span className="text-stone-200">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Luxury Taxes & Fees (12%)</span>
                  <span className="text-stone-200">${taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gold-500/10 text-lg font-serif">
                  <span className="text-gold-500">Estimated Total:</span>
                  <span className="text-stone-100 font-semibold">${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Exclusive VIP Benefit banner */}
            <div className="bg-[#100e0d] border border-gold-500/10 p-6 rounded-sm text-center">
              <Award className="text-gold-500 mx-auto mb-2" size={24} />
              <h4 className="font-serif text-sm text-stone-200 mb-1">Direct Booking Benefits</h4>
              <p className="text-[10px] text-stone-400 font-light leading-relaxed">
                Book direct with Majestic to enjoy early check-in, late checkout, and a complimentary bottle of premium champagne on arrival.
              </p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
