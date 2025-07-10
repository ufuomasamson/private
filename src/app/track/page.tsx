"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/supabaseClient";
import jsPDF from "jspdf";
import { useCurrencyStore } from "@/lib/currencyManager";
import { useSearchParams } from "next/navigation";
import FlightTicket from "@/app/components/FlightTicket";
import { downloadTicket } from "@/lib/downloadTicket";

export default function TrackFlightPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [flight, setFlight] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { formatPrice } = useCurrencyStore();
  const searchParams = useSearchParams();
  const ticketRef = useRef<HTMLDivElement>(null);

  // Handle URL parameters for payment success/error
  useEffect(() => {
    const urlError = searchParams.get('error');
    const urlSuccess = searchParams.get('success');
    const txRef = searchParams.get('tx_ref');

    if (urlError) {
      setError(urlError);
    }
    if (urlSuccess) {
      setSuccess(urlSuccess);
      if (txRef) {
        setTrackingNumber(txRef);
        // Auto-track the flight
        handleTrackFlight(txRef);
      }
    }
  }, [searchParams]);

  const handleTrackFlight = async (trackNumber: string) => {
    setError("");
    setFlight(null);
    setBooking(null);
    setLoading(true);
    
    const { data: flightData, error: flightError } = await supabase
      .from("flights")
      .select(`
        *,
        airline:airlines(*),
        departure:locations!flights_departure_location_id_fkey(city, country),
        arrival:locations!flights_arrival_location_id_fkey(city, country)
      `)
      .eq("tracking_number", trackNumber)
      .single();
    
    if (flightError || !flightData) {
      setError("Flight not found with this tracking number");
      setLoading(false);
      return;
    }
    
    setFlight(flightData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .eq("flight_id", flightData.id)
        .single();
      if (bookingData) setBooking(bookingData);
    }
    setLoading(false);
  };

    const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTrackFlight(trackingNumber);
  };

  const handleMarkAsPaidAndGenerateTicket = async () => {
    if (!booking || !flight) return;
    
    setPaymentLoading(true);
    setError("");
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to make payment");
        setPaymentLoading(false);
      return;
    }
    
      // Use the new v2 payment API with USD currency
      const paymentData = {
        bookingId: booking.id,
        userId: user.id,
        amount: flight.price,
        currency: 'USD' // Force USD currency
      };

      const response = await fetch('/api/payment/initiate-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success && result.data?.payment_url) {
        // Redirect to Flutterwave payment page
        window.location.href = result.data.payment_url;
      } else {
        setError(result.error || 'Failed to initialize payment');
        setPaymentLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment initialization failed');
      setPaymentLoading(false);
    }
  };

  const handleBookFlight = async () => {
    if (!flight) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to book a flight.");
      return;
    }

    // Use full_name from user_metadata if available, otherwise fallback to email or N/A
    let passengerName = user.user_metadata?.full_name || user.email || "N/A";

    // Check if booking already exists
    const { data: existingBooking, error: existingBookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .eq("flight_id", flight.id)
      .single();
    if (existingBooking) {
      setBooking(existingBooking);
      setError("");
      return;
    }

    // Generate transaction reference
    const txRef = `FLW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase.from("bookings").insert([
      {
        user_id: user.id,
        flight_id: flight.id,
        passenger_name: passengerName,
        paid: false,
        tx_ref: txRef,
      },
    ]);

    if (error) {
      setError("Failed to book flight.");
    } else {
      // Refresh booking info
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .eq("flight_id", flight.id)
        .single();
      if (bookingData) setBooking(bookingData);
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#4f1032] to-[#4f1032]/90 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Track Your Flight</h1>
          <p className="text-xl mb-8">Enter your tracking number to view flight details and manage your booking</p>
          
          <form onSubmit={handleTrack} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter Tracking Number"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                className="flex-1 p-3 rounded text-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-[#cd7e0f] text-white px-6 py-3 rounded hover:bg-[#cd7e0f]/90 transition"
                disabled={loading}
              >
                {loading ? "Searching..." : "Track"}
              </button>
            </div>
            {error && <div className="text-red-200 mt-4 font-semibold">{error}</div>}
            {success && <div className="text-green-200 mt-4 font-semibold">{success}</div>}
          </form>
        </div>
      </section>

      {/* Flight Details */}
      {flight && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-[#4f1032] mb-6">Flight Details</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Flight Information */}
                <div className="space-y-6">
                  {/* Airline Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {flight.airline?.logo_url ? (
                      <img src={flight.airline.logo_url} alt={flight.airline.name} className="w-16 h-16 object-contain rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                        <span className="text-gray-500">Logo</span>
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-xl">{flight.airline?.name || "Airline"}</div>
                      <div className="text-gray-600">Flight No: <span className="font-mono">{flight.flight_number}</span></div>
                    </div>
                  </div>
                  
                  {/* Route Information */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-lg text-[#4f1032] mb-4">Route Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">Departure</div>
                          <div className="text-gray-600">{flight.departure?.city}, {flight.departure?.country}</div>
                        </div>
                        <div className="text-2xl text-[#cd7e0f]">→</div>
                        <div className="text-right">
                          <div className="font-semibold">Destination</div>
                          <div className="text-gray-600">{flight.arrival?.city}, {flight.arrival?.country}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Date and Time */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-lg text-[#4f1032] mb-4">Schedule</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold">Date</div>
                        <div className="text-gray-600">{flight.date}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Time</div>
                        <div className="text-gray-600">{flight.time}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="p-4 bg-[#4f1032] text-white rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatPrice(flight.price)}</div>
                      <div>Total Price</div>
                    </div>
                  </div>
                </div>
                
                {/* Booking Status and Actions */}
                <div className="space-y-6">
                  {/* Passenger Information */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-lg text-[#4f1032] mb-4">Passenger Information</h3>
                    {booking ? (
                      <div>
                        <div className="font-semibold">Passenger Name</div>
                        <div className="text-gray-600">{booking.passenger_name || "N/A"}</div>
                      </div>
                    ) : (
                      <div className="text-gray-600">No passenger information available</div>
                    )}
                  </div>
                  
                  {/* Booking Status */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-lg text-[#4f1032] mb-4">Booking Status</h3>
                    
                    {booking ? (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className={`w-3 h-3 rounded-full ${booking.paid ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className="font-semibold">
                            {booking.paid ? 'Payment Completed' : 'Payment Pending'}
                          </span>
                        </div>
                        
                        {booking.paid ? (
                          <div className="space-y-3">
                            <div className="text-green-600 font-semibold">✓ Your flight is confirmed!</div>
                            {/* Render the ticket visibly for PDF generation */}
                            <div className="my-6">
                              <FlightTicket
                                ref={ticketRef}
                                passengerName={booking.passenger_name}
                                flightNumber={flight.flight_number}
                                airlineName={flight.airline?.name || "-"}
                                airlineLogo={flight.airline?.logo_url || "/globe.svg"}
                                departure={flight.departure?.city || "-"}
                                arrival={flight.arrival?.city || "-"}
                                date={flight.date || "-"}
                                time={flight.time || "-"}
                                trackingNumber={flight.tracking_number || booking.id}
                                trip={flight.trip || "-"}
                                tourtype={flight.tour_type || "-"}
                                passengerclass={booking.passenger_class || "Economy"}
                              />
                            </div>
                            <button
                              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition text-center block"
                              onClick={() => downloadTicket(ticketRef)}
                            >
                              Download Ticket (PDF)
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-yellow-600 font-semibold">Payment required to confirm your booking</div>
                            <button
                              className="w-full bg-[#cd7e0f] text-white py-3 rounded-lg hover:bg-[#cd7e0f]/90 transition"
                              onClick={handleMarkAsPaidAndGenerateTicket}
                              disabled={paymentLoading}
                            >
                              {paymentLoading ? "Processing..." : "Pay Now"}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-600">
                        <p>No booking found for this flight.</p>
                        <p className="mt-2">Please log in and book this flight to manage your ticket.</p>
                        <button
                          className="mt-4 w-full bg-[#4f1032] text-white py-3 rounded-lg hover:bg-[#cd7e0f] transition"
                          onClick={handleBookFlight}
                        >
                          Book This Flight
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Tracking Information */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-[#4f1032]">Tracking Information</h4>
                    <div className="text-sm text-gray-600">
                      <p>Tracking Number: <span className="font-mono font-semibold">{flight.tracking_number}</span></p>
                      <p className="mt-2">Use this number to track your flight status anytime.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
} 