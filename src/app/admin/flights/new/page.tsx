"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function CreateFlightPage() {
  const [flightNumber, setFlightNumber] = useState("");
  const [airlineId, setAirlineId] = useState("");
  const [departureId, setDepartureId] = useState("");
  const [arrivalId, setArrivalId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [trip, setTrip] = useState("One-way");
  const [tourType, setTourType] = useState("Economy");
  const [passengerClass, setPassengerClass] = useState("1 Passenger, Economy");
  const [airlines, setAirlines] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Protect route: only admin
    const checkRoleAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      if (error || !data || data.role !== "admin") {
        router.replace("/search");
        return;
      }
      // Fetch airlines and locations
      const [{ data: airlinesData }, { data: locationsData }] = await Promise.all([
        supabase.from("airlines").select("id, name"),
        supabase.from("locations").select("id, city, country")
      ]);
      setAirlines(airlinesData || []);
      setLocations(locationsData || []);
      setLoading(false);
    };
    checkRoleAndFetch();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    
    // Generate unique tracking number
    const trackingNumber = uuidv4().slice(0, 8).toUpperCase();
    
    try {
      const { error: insertError } = await supabase.from("flights").insert([
        {
          flight_number: flightNumber,
          airline_id: airlineId,
          departure_location_id: departureId,
          arrival_location_id: arrivalId,
          date,
          time,
          price: Number(price),
          tracking_number: trackingNumber,
          ticket_url: null,
          trip,
          tour_type: tourType,
          passenger_class: passengerClass
        }
      ]);
      
      if (insertError) {
        setError("Error creating flight: " + insertError.message);
        setSubmitting(false);
        return;
      }
      
      setSuccess("Flight created successfully! Tracking number: " + trackingNumber);
      
      // Reset form
      setFlightNumber("");
      setAirlineId("");
      setDepartureId("");
      setArrivalId("");
      setDate("");
      setTime("");
      setPrice("");
      
      // Redirect after a delay
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
      
    } catch (err) {
      setError("An unexpected error occurred");
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f1032] mx-auto mb-4"></div>
          <p className="text-[#4f1032] font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4f1032] to-[#4f1032]/90 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Create New Flight</h1>
              <p className="text-gray-200 mt-2">Add a new flight route to the system</p>
            </div>
            <a
              href="/admin/dashboard"
              className="bg-[#cd7e0f] text-white px-6 py-2 rounded-lg hover:bg-[#cd7e0f]/90 transition"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flight Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g., FL123"
                  value={flightNumber}
                  onChange={e => setFlightNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Airline *
                </label>
                <select
                  value={airlineId}
                  onChange={e => setAirlineId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                  required
                >
                  <option value="">Select Airline</option>
                  {airlines.map(airline => (
                    <option key={airline.id} value={airline.id}>{airline.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Location *
                </label>
                <select
                  value={departureId}
                  onChange={e => setDepartureId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                  required
                >
                  <option value="">Select Departure Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.city}, {location.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Location *
                </label>
                <select
                  value={arrivalId}
                  onChange={e => setArrivalId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                  required
                >
                  <option value="">Select Arrival Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.city}, {location.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  placeholder="Enter price in US Dollars"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip</label>
                <select value={trip} onChange={e => setTrip(e.target.value)} className="w-full p-3 border rounded text-gray-900">
                  <option>One-way</option>
                  <option>Round-Trip</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tour type</label>
                <select value={tourType} onChange={e => setTourType(e.target.value)} className="w-full p-3 border rounded text-gray-900">
                  <option>Economy</option>
                  <option>Business</option>
                  <option>First Class</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passenger/ Class</label>
                <select value={passengerClass} onChange={e => setPassengerClass(e.target.value)} className="w-full p-3 border rounded text-gray-900">
                  <option>1 Passenger, Economy</option>
                  <option>2 Passengers, Economy</option>
                  <option>1 Passenger, Business</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-[#cd7e0f] text-white py-3 rounded-lg font-semibold hover:bg-[#cd7e0f]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "Creating Flight..." : "Create Flight"}
              </button>
              
              <button
                type="button"
                onClick={() => router.push("/admin/dashboard")}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 