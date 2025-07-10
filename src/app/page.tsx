"use client";
import { useState } from "react";
import { supabase } from "@/supabaseClient";
import jsPDF from "jspdf";
import Image from "next/image";

import { useCurrencyStore } from "@/lib/currencyManager";



export default function HomePage() {
  const [trackingNumber] = useState("");
  const [flight, setFlight] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { formatPrice } = useCurrencyStore();

  // Note: handleTrack function is defined but not used in the current UI
  // It's kept for future implementation

  const handleMarkAsPaidAndGenerateTicket = async () => {
    if (!booking || !flight) return;
    // 1. Mark booking as paid
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ paid: true })
      .eq("id", booking.id);
    if (updateError) {
      setError("Failed to mark as paid");
      return;
    }
    // 2. Generate PDF ticket
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Flight Ticket", 20, 20);
    doc.setFontSize(12);
    doc.text(`Passenger: ${booking.passenger_name || "N/A"}`, 20, 35);
    doc.text(`Flight No: ${flight.flight_number}`, 20, 45);
    doc.text(`Airline: ${flight.airline?.name || ""}`, 20, 55);
    doc.text(`From: ${flight.departure?.city}, ${flight.departure?.country}`, 20, 65);
    doc.text(`To: ${flight.arrival?.city}, ${flight.arrival?.country}`, 20, 75);
    doc.text(`Date: ${flight.date}  Time: ${flight.time}`, 20, 85);
    doc.text(`Tracking #: ${flight.tracking_number}`, 20, 95);
    // 3. Upload PDF to Supabase Storage
    const pdfBlob = doc.output("blob");
    const fileName = `ticket_${booking.id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("tickets")
      .upload(fileName, pdfBlob, { upsert: true, contentType: "application/pdf" });
    if (uploadError) {
      setError("Failed to upload ticket");
      return;
    }
    const ticketUrl = supabase.storage.from("tickets").getPublicUrl(fileName).data.publicUrl;
    // 4. Save ticket URL in booking
    const { error: urlError } = await supabase
      .from("bookings")
      .update({ ticket_url: ticketUrl })
      .eq("id", booking.id);
    if (urlError) {
      setError("Failed to save ticket URL");
      return;
    }
    // 5. Refresh booking
    const { data: updatedBooking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking.id)
      .single();
    setBooking(updatedBooking);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col lg:flex-row items-center justify-center px-2 sm:px-4 md:px-8">
        {/* Moving Clouds Background with 8 PNGs */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          <Image src="/images/cloud1.png" alt="Cloud 1" layout="fill" objectFit="contain" className="absolute w-64 h-auto opacity-70 animate-cloud-move" style={{ top: '15%', animationDuration: '22s', animationDelay: '0s' }} />
          <Image src="/images/cloud2.png" alt="Cloud 2" layout="fill" objectFit="contain" className="absolute w-80 h-auto opacity-50 animate-cloud-move" style={{ top: '60%', animationDuration: '25s', animationDelay: '2s' }} />
          <Image src="/images/cloud3.png" alt="Cloud 3" layout="fill" objectFit="contain" className="absolute w-52 h-auto opacity-60 animate-cloud-move" style={{ top: '35%', animationDuration: '20s', animationDelay: '4s' }} />
          <Image src="/images/cloud4.png" alt="Cloud 4" layout="fill" objectFit="contain" className="absolute w-56 h-auto opacity-55 animate-cloud-move" style={{ top: '50%', animationDuration: '23s', animationDelay: '1s' }} />
          <Image src="/images/cloud5.png" alt="Cloud 5" layout="fill" objectFit="contain" className="absolute w-72 h-auto opacity-65 animate-cloud-move" style={{ top: '25%', animationDuration: '28s', animationDelay: '3s' }} />
          <Image src="/images/cloud6.png" alt="Cloud 6" layout="fill" objectFit="contain" className="absolute w-60 h-auto opacity-45 animate-cloud-move" style={{ top: '70%', animationDuration: '30s', animationDelay: '5s' }} />
          <Image src="/images/cloud7.png" alt="Cloud 7" layout="fill" objectFit="contain" className="absolute w-64 h-auto opacity-60 animate-cloud-move" style={{ top: '40%', animationDuration: '26s', animationDelay: '2.5s' }} />
          <Image src="/images/cloud8.png" alt="Cloud 8" layout="fill" objectFit="contain" className="absolute w-80 h-auto opacity-50 animate-cloud-move" style={{ top: '10%', animationDuration: '29s', animationDelay: '6s' }} />
          <Image src="/images/cloud9.png" alt="Cloud 9" layout="fill" objectFit="contain" className="absolute w-72 h-auto opacity-55 animate-cloud-move" style={{ top: '80%', animationDuration: '24s', animationDelay: '7s' }} />
          <Image src="/images/cloud10.png" alt="Cloud 10" layout="fill" objectFit="contain" className="absolute w-64 h-auto opacity-60 animate-cloud-move" style={{ top: '5%', animationDuration: '27s', animationDelay: '8s' }} />
          <Image src="/images/cloud11.png" alt="Cloud 11" layout="fill" objectFit="contain" className="absolute w-80 h-auto opacity-50 animate-cloud-move" style={{ top: '90%', animationDuration: '32s', animationDelay: '9s' }} />
          <Image src="/images/cloud12.png" alt="Cloud 12" layout="fill" objectFit="contain" className="absolute w-56 h-auto opacity-65 animate-cloud-move" style={{ top: '20%', animationDuration: '21s', animationDelay: '10s' }} />
          <Image src="/images/cloud13.png" alt="Cloud 13" layout="fill" objectFit="contain" className="absolute w-60 h-auto opacity-45 animate-cloud-move" style={{ top: '75%', animationDuration: '31s', animationDelay: '11s' }} />
          <Image src="/images/cloud14.png" alt="Cloud 14" layout="fill" objectFit="contain" className="absolute w-72 h-auto opacity-55 animate-cloud-move" style={{ top: '45%', animationDuration: '28s', animationDelay: '12s' }} />
          <Image src="/images/cloud15.png" alt="Cloud 15" layout="fill" objectFit="contain" className="absolute w-64 h-auto opacity-60 animate-cloud-move" style={{ top: '30%', animationDuration: '26s', animationDelay: '13s' }} />
          <Image src="/images/cloud16.png" alt="Cloud 16" layout="fill" objectFit="contain" className="absolute w-80 h-auto opacity-50 animate-cloud-move" style={{ top: '65%', animationDuration: '30s', animationDelay: '14s' }} />
          <Image src="/images/cloud17.png" alt="Cloud 17" layout="fill" objectFit="contain" className="absolute w-52 h-auto opacity-60 animate-cloud-move" style={{ top: '12%', animationDuration: '22s', animationDelay: '15s' }} />
          <Image src="/images/cloud18.png" alt="Cloud 18" layout="fill" objectFit="contain" className="absolute w-56 h-auto opacity-55 animate-cloud-move" style={{ top: '85%', animationDuration: '25s', animationDelay: '16s' }} />
          <Image src="/images/cloud19.png" alt="Cloud 19" layout="fill" objectFit="contain" className="absolute w-72 h-auto opacity-65 animate-cloud-move" style={{ top: '55%', animationDuration: '29s', animationDelay: '17s' }} />
          <Image src="/images/cloud20.png" alt="Cloud 20" layout="fill" objectFit="contain" className="absolute w-60 h-auto opacity-45 animate-cloud-move" style={{ top: '22%', animationDuration: '27s', animationDelay: '18s' }} />
        </div>
        {/* Cloud Animation Keyframes */}
        <style jsx global>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
            100% { transform: translateY(0px); }
          }
          @keyframes cloud-move {
            0% { left: -300px; }
            100% { left: 110vw; }
          }
          .animate-cloud-move {
            animation: cloud-move 22s linear infinite;
          }
        `}</style>
        <div className="absolute inset-0 bg-blue-900/60 z-0"></div>
        <div className="relative z-20 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between h-full px-2 sm:px-4 md:px-8">
          {/* Left: Text */}
          <div className="w-full lg:w-1/2 text-[#4f1032] text-center lg:text-left flex flex-col justify-center items-center lg:items-start py-8 sm:py-12 lg:py-20">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">A Lifetime Of Discounts? It's Genius.</h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-xl">Get rewarded for your travels unlock savings of 10% or more with free flight booker account.</p>
          </div>
          {/* Right: Floating Image */}
          <div className="w-full lg:w-1/2 flex justify-center items-center relative mt-6 sm:mt-8 lg:mt-0 bg-transparent">
            <img
              src="/images/hero-bg.png"
              alt="Flying Hero"
              className="w-[90%] sm:w-[85%] md:w-[70%] lg:w-[600px] max-w-xs sm:max-w-md md:max-w-lg lg:max-w-none rounded-xl animate-float"
              style={{ animation: 'float 3s ease-in-out infinite', objectFit: 'contain' }}
            />
          </div>
        </div>
      </section>

      {/* Floating Flight Booking Form */}
      <section className="relative -mt-12 sm:-mt-16 lg:-mt-20 z-30 mb-12 sm:mb-16 lg:mb-20 px-2 sm:px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#4f1032] mb-2">AIR BOOKING</h2>
            </div>
            
            {/* Flight Booking Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FROM</label>
                <input type="text" placeholder="Departure City" className="w-full p-3 border rounded text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TO</label>
                <input type="text" placeholder="Arrival City" className="w-full p-3 border rounded text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depart</label>
                <input type="date" className="w-full p-3 border rounded text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return</label>
                <input type="date" className="w-full p-3 border rounded text-gray-900" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip</label>
                <select className="w-full p-3 border rounded text-gray-900">
                  <option>One-way</option>
                  <option>Round-Trip</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tour type</label>
                <select className="w-full p-3 border rounded text-gray-900">
                  <option>Economy</option>
                  <option>Business</option>
                  <option>First Class</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passenger/ Class</label>
                <select className="w-full p-3 border rounded text-gray-900">
                  <option>1 Passenger, Economy</option>
                  <option>2 Passengers, Economy</option>
                  <option>1 Passenger, Business</option>
                </select>
              </div>
            </div>
            <button className="w-full bg-[#cd7e0f] text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-[#cd7e0f]/90 transition text-sm sm:text-lg">
              Search Flights
            </button>
          </div>
        </div>
      </section>

      {/* Quick Services */}
      <section className="py-8 sm:py-12 bg-white px-2 sm:px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-6 border rounded-lg">
              <h3 className="text-lg font-semibold text-[#4f1032] mb-2">International Flight</h3>
              <p className="text-gray-600">Call FlyGlobe Inc via +447587623610 for booking assistance</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <h3 className="text-lg font-semibold text-[#4f1032] mb-2">Check Refund</h3>
              <p className="text-gray-600">Contact contact@flyglobe.online for check refund status</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <h3 className="text-lg font-semibold text-[#4f1032] mb-2">Offer Deals</h3>
              <p className="text-gray-600">FlyGlobe Inc Offer Deals Best Price Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offer Deals */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#4f1032] mb-6 sm:mb-8">Offer Deals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: New York */}
            <div className="bg-white rounded-lg shadow flex flex-col overflow-hidden">
              <div className="h-36 w-full bg-gray-200">
                <img src="/images/new-york.jpeg" alt="New York" className="w-full h-full object-cover object-center rounded-t-lg" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-end">
                <h3 className="font-semibold text-[#4f1032] mb-2">New York to California</h3>
                <p className="text-gray-600 mb-2">09 Jun 2022 - 16 Jun 2022</p>
                <p className="text-gray-600 mb-2">Economy from</p>
                <p className="text-2xl font-bold text-[#cd7e0f]">{formatPrice(290)}</p>
              </div>
            </div>
            {/* Card 2: Paris */}
            <div className="bg-white rounded-lg shadow flex flex-col overflow-hidden">
              <div className="h-36 w-full bg-gray-200">
                <img src="/images/paris.jpeg" alt="Paris" className="w-full h-full object-cover object-center rounded-t-lg" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-end">
                <h3 className="font-semibold text-[#4f1032] mb-2">Paris to London</h3>
                <p className="text-gray-600 mb-2">09 Jun 2022 - 16 Jun 2022</p>
                <p className="text-gray-600 mb-2">Economy from</p>
                <p className="text-2xl font-bold text-[#cd7e0f]">{formatPrice(420)}</p>
              </div>
            </div>
            {/* Card 3: Tokyo */}
            <div className="bg-white rounded-lg shadow flex flex-col overflow-hidden">
              <div className="h-36 w-full bg-gray-200">
                <img src="/images/tokyo.jpeg" alt="Tokyo" className="w-full h-full object-cover object-center rounded-t-lg" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-end">
                <h3 className="font-semibold text-[#4f1032] mb-2">Tokyo to Seoul</h3>
                <p className="text-gray-600 mb-2">09 Jun 2022 - 16 Jun 2022</p>
                <p className="text-gray-600 mb-2">Economy from</p>
                <p className="text-2xl font-bold text-[#cd7e0f]">{formatPrice(350)}</p>
              </div>
            </div>
            {/* Card 4: Dubai to Maldives */}
            <div className="bg-white rounded-lg shadow flex flex-col overflow-hidden">
              <div className="h-36 w-full bg-gray-200">
                <img src="/images/dubai-city.jpeg" alt="Maldives" className="w-full h-full object-cover object-center rounded-t-lg" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-end">
                <h3 className="font-semibold text-[#4f1032] mb-2">Dubai to Maldives</h3>
                <p className="text-gray-600 mb-2">09 Jun 2022 - 16 Jun 2022</p>
                <p className="text-gray-600 mb-2">Economy from</p>
                <p className="text-2xl font-bold text-[#cd7e0f]">{formatPrice(980)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Great Destination Section */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('/images/great.jpeg')" }}
      >
        <div
          className="absolute inset-0 bg-[#4f1032]"
          style={{
            maskImage: 'linear-gradient(to right, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)',
          }}
        ></div>
        <div className="relative grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-12 text-white flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-6">Your Great Destination</h2>
            <p className="text-lg mb-8">Get rewarded for your travels with Mazol Inc  unlock instant savings of 10% or more with a free +447587623610 account</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-4">
                <svg className="w-10 h-10 text-[#d18a27]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.121-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.121-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M12 14a4 4 0 100-8 4 4 0 000 8z"></path></svg>
                <div>
                  <div className="text-3xl font-bold">5830+</div>
                  <div className="text-md">Happy Customers</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <svg className="w-10 h-10 text-[#d18a27]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.938 6.124a9 9 0 1111.125 0M12 21a9 9 0 110-18 9 9 0 010 18z"></path></svg>
                <div>
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-md">Client Satisfied</div>
                </div>
              </div>
            </div>
            <p className="mb-6">Discover the latest offers & news and start planning.</p>
            <a href="/contact" className="bg-[#d18a27] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#d18a27]/90 transition text-lg text-center w-full sm:w-auto">
              Contact Us
            </a>
          </div>
          <div></div>
        </div>
      </section>

      {/* Flynext Package Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-[#cd7e0f]">Flynext Package</h3>
            <h2 className="text-3xl font-bold text-[#4f1032]">Your Great Destination</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="/images/dubai-dxb.PNG" alt="Dubai" className="w-full h-48 object-cover"/>
              <div className="p-4">
                <p className="text-sm text-gray-500">09 Jun 2023 - 16 Jun 2023</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Dubai (DXB)</h4>
                <p className="text-gray-600">To</p>
                <h4 className="font-bold text-lg text-[#4f1032]">New York (USA)</h4>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-600">Economy from</p>
                  <p className="text-xl font-bold text-[#cd7e0f]">{formatPrice(195)}</p>
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="/images/switzerland-swl.PNG" alt="Switzerland" className="w-full h-48 object-cover"/>
              <div className="p-4">
                <p className="text-sm text-gray-500">09 Jun 2022 - 16 Jun 2022</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Switzerland (SWL)</h4>
                <p className="text-gray-600">To</p>
                <h4 className="font-bold text-lg text-[#4f1032]">New York (USA)</h4>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-600">Business Class</p>
                  <p className="text-xl font-bold text-[#cd7e0f]">{formatPrice(800)}</p>
                </div>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="/images/denmark-dek.PNG" alt="Denmark" className="w-full h-48 object-cover"/>
              <div className="p-4">
                <p className="text-sm text-gray-500">09 Jun 2024 - 16 Jun 2024</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Denmark (DEK)</h4>
                <p className="text-gray-600">To</p>
                <h4 className="font-bold text-lg text-[#4f1032]">New York (USA)</h4>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-600">Economy from</p>
                  <p className="text-xl font-bold text-[#cd7e0f]">{formatPrice(350)}</p>
                </div>
              </div>
            </div>
            {/* Card 4 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="/images/jakarta-dxb.PNG" alt="Jakarta" className="w-full h-48 object-cover"/>
              <div className="p-4">
                <p className="text-sm text-gray-500">09 Jun 2025 - 16 Jun 2025</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Jakarta (DXB)</h4>
                <p className="text-gray-600">To</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Miami (USA)</h4>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-600">Business Class</p>
                  <p className="text-xl font-bold text-[#cd7e0f]">{formatPrice(220)}</p>
                </div>
              </div>
            </div>
            {/* Card 5 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="/images/turkish-swk.PNG" alt="Turkey" className="w-full h-48 object-cover"/>
              <div className="p-4">
                <p className="text-sm text-gray-500">09 Jun 2024 - 16 Jun 2024</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Turkey (TUR)</h4>
                <p className="text-gray-600">To</p>
                <h4 className="font-bold text-lg text-[#4f1032]">California (USA)</h4>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-600">Business Class</p>
                  <p className="text-xl font-bold text-[#cd7e0f]">{formatPrice(2430)}</p>
                </div>
              </div>
            </div>
            {/* Card 6 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="/images/australia-stl.PNG" alt="Australia" className="w-full h-48 object-cover"/>
              <div className="p-4">
                <p className="text-sm text-gray-500">09 Jun 2024 - 16 Jun 2024</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Australia (AUS)</h4>
                <p className="text-gray-600">To</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Florida (USA)</h4>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-600">Business Class</p>
                  <p className="text-xl font-bold text-[#cd7e0f]">{formatPrice(2220)}</p>
                </div>
              </div>
            </div>
            {/* Card 7 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="/images/canada-cda.PNG" alt="Canada" className="w-full h-48 object-cover"/>
              <div className="p-4">
                <p className="text-sm text-gray-500">09 Jun 2024 - 16 Jun 2024</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Canada (CA)</h4>
                <p className="text-gray-600">To</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Florida (USA)</h4>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-600">Business Class</p>
                  <p className="text-xl font-bold text-[#cd7e0f]">{formatPrice(820)}</p>
                </div>
              </div>
            </div>
            {/* Card 8 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="/images/greece-gcc.PNG" alt="Greece" className="w-full h-48 object-cover"/>
              <div className="p-4">
                <p className="text-sm text-gray-500">09 Jun 2024 - 16 Jun 2024</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Greece (GR)</h4>
                <p className="text-gray-600">To</p>
                <h4 className="font-bold text-lg text-[#4f1032]">Florida (USA)</h4>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-600">Business Class</p>
                  <p className="text-xl font-bold text-[#cd7e0f]">{formatPrice(820)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Update Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#4f1032] mb-8">Latest News Update</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Main Story */}
            <div className="lg:col-span-2 rounded-lg overflow-hidden shadow-lg">
              <img src="/images/usa.jpeg" alt="Airplane wing in the sky" className="w-full h-64 object-cover"/>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-2">Emely Watson • February 19, 2022</p>
                <h3 className="text-2xl font-bold text-[#4f1032] mb-4">The US is a Large Country and Climate Varies by Region</h3>
                <p className="text-gray-700">Discover the diverse climates of the United States, from the sunny beaches of California to the snowy mountains of Colorado. Plan your trip accordingly to make the most of your travels.</p>
              </div>
            </div>
            {/* Side Stories */}
            <div className="space-y-8">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img src="/images/happy.png" alt="Airplane flying over clouds" className="w-full h-40 object-cover"/>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Emely Watson • February 19, 2022</p>
                  <h3 className="font-semibold text-[#4f1032]">Happy International Country Flight Attendant Day</h3>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img src="/images/bestlow.jpg" alt="View from airplane window" className="w-full h-40 object-cover"/>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Emely Watson • February 19, 2022</p>
                  <h3 className="font-semibold text-[#4f1032]">But There are Dozen of Low-cost Airlines Including</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4f1032] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="hover:text-[#cd7e0f]">About us</a></li>
                <li><a href="/contact" className="hover:text-[#cd7e0f]">Contact Us</a></li>
                <li><a href="/login" className="hover:text-[#cd7e0f]">Login</a></li>
                <li><a href="/signup" className="hover:text-[#cd7e0f]">Signup</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-[#cd7e0f]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#cd7e0f]">Terms and Conditions</a></li>
                <li><a href="#" className="hover:text-[#cd7e0f]">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacts</h3>
              <p className="mb-2">102 Woodland Ave, 92922 TX CA United States</p>
              <p className="mb-2">+447587623610</p>
              <p>contact@flyglobe.online</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <div className="flex">
                <input type="email" placeholder="Enter your email" className="flex-1 p-2 rounded-l text-gray-900" />
                <button className="bg-[#cd7e0f] px-4 py-2 rounded-r hover:bg-[#cd7e0f]/90">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center">
            <p>Copyright © 2022. All Rights Reserved By FlyGlobe Inc</p>
          </div>
        </div>
      </footer>

      {/* Flight Tracking Result */}
      {flight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-[#4f1032]">Flight Details</h2>
            <div className="flex items-center gap-4 mb-4">
              {flight.airline?.logo_url ? (
                <img src={flight.airline.logo_url} alt={flight.airline.name} className="w-16 h-16 object-contain rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">Logo</div>
              )}
              <div>
                <div className="font-semibold text-lg">{flight.airline?.name || "Airline"}</div>
                <div>Flight No: <span className="font-mono">{flight.flight_number}</span></div>
              </div>
            </div>
            <div className="mb-2">Route: {flight.departure?.city}, {flight.departure?.country} → {flight.arrival?.city}, {flight.arrival?.country}</div>
            <div className="mb-2">Date: {flight.date} | Time: {flight.time}</div>
            <div className="mb-4 font-semibold text-[#cd7e0f]">₦{formatPrice(flight.price)}</div>
            {booking ? (
              booking.paid ? (
                <a
                  href={booking.ticket_url || "#"}
                  className="bg-[#cd7e0f] text-white px-4 py-2 rounded hover:bg-[#cd7e0f]/90 inline-block"
                  download
                >
                  Download Ticket
                </a>
              ) : (
                <button
                  className="bg-[#cd7e0f] text-white px-4 py-2 rounded hover:bg-[#cd7e0f]/90"
                  onClick={handleMarkAsPaidAndGenerateTicket}
                >
                  Mark as Paid & Generate Ticket
                </button>
              )
            ) : (
              <div className="text-gray-500">Login and book this flight to pay and download your ticket.</div>
            )}
            <button 
              onClick={() => setFlight(null)} 
              className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


