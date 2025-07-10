"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabaseClient";
import FlightTicket from "@/app/components/FlightTicket";
import { downloadTicket } from "@/lib/downloadTicket";

export default function TicketPage() {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [airlineLogo, setAirlineLogo] = useState<string>("");
  const [error, setError] = useState("");
  const router = useRouter();
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to view your ticket.");
        setLoading(false);
        return;
      }
      // Fetch latest paid booking for this user
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select(`*, flights(*, airline:airlines(*))`)
        .eq("user_id", user.id)
        .eq("payment_status", "paid")
        .order("payment_date", { ascending: false })
        .limit(1)
        .single();
      if (bookingError || !booking) {
        setError("No paid booking found. Please complete payment first.");
        setLoading(false);
        return;
      }
      setBooking(booking);
      // Fetch airline logo if available
      if (booking.flights && booking.flights.airline && booking.flights.airline.logo_url) {
        setAirlineLogo(booking.flights.airline.logo_url);
      } else {
        setAirlineLogo("/globe.svg"); // fallback logo
      }
      setLoading(false);
    };
    fetchTicket();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading ticket...</div>;
  }
  if (error) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-600 font-semibold">{error}</div>;
  }
  if (!booking) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-2">
      <FlightTicket
        ref={ticketRef}
        passengerName={booking.passenger_name}
        flightNumber={booking.flights?.flight_number || "-"}
        airlineName={booking.flights?.airline?.name || "-"}
        airlineLogo={airlineLogo}
        departure={booking.flights?.departure_city || "-"}
        arrival={booking.flights?.arrival_city || "-"}
        date={booking.flights?.date || "-"}
        time={booking.flights?.time || "-"}
        trackingNumber={booking.tracking_number || booking.id}
        trip={booking.flights?.trip || "-"}
        tourtype={booking.flights?.tour_type || "-"}
        passengerclass={booking.passenger_class || "Economy"}
      />
      <button
        onClick={() => downloadTicket(ticketRef)}
        className="mt-4 px-6 py-2 bg-[#4f1032] text-white rounded-lg font-semibold shadow hover:bg-[#6d1847] transition"
      >
        Download Ticket
      </button>
    </div>
  );
} 