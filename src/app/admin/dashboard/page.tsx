'use client';
import { useEffect, useState } from 'react';
import { useCurrencyStore } from '@/lib/currencyManager';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabaseClient';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalFlights: 0,
    totalAirlines: 0,
    totalLocations: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalFlightValue: 0,
    totalUsers: 0,
    users: [] as any[],
  });
  const router = useRouter();
  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    const checkRoleAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      
      setUser(user);
      
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (error || !data || data.role !== 'admin') {
        router.replace('/search');
        return;
      }
      
      setIsAdmin(true);
      
      // Fetch dashboard statistics
      await fetchDashboardStats();
      
      setLoading(false);
    };
    
    checkRoleAndFetchData();
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      const [
        { data: flights, error: flightsError },
        { count: airlinesCount },
        { count: locationsCount },
        { data: bookings, error: bookingsError },
        { data: users, error: usersError },
      ] = await Promise.all([
        supabase.from('flights').select('price'),
        supabase.from('airlines').select('*', { count: 'exact', head: true }),
        supabase.from('locations').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('flight_amount, paid, payment_status'),
        supabase.from('users').select('full_name'),
      ]);

      if (flightsError) {
        console.error('Error fetching flights:', flightsError);
      }

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
      }

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      const safeFlights = flights || [];
      const totalFlightValue = safeFlights.reduce((acc, flight) => acc + (flight.price || 0), 0);

      const safeBookings = bookings || [];
      const totalRevenue = safeBookings
        .filter(booking => booking.paid === true || booking.payment_status === 'paid')
        .reduce((acc, booking) => acc + (booking.flight_amount || 0), 0);

      const safeUsers = users || [];

      setStats({
        totalFlights: safeFlights.length || 0,
        totalAirlines: airlinesCount || 0,
        totalLocations: locationsCount || 0,
        totalBookings: safeBookings.length,
        totalRevenue: totalRevenue,
        totalFlightValue: totalFlightValue,
        totalUsers: safeUsers.length,
        users: safeUsers,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f1032] mx-auto mb-4"></div>
          <p className="text-[#4f1032] font-semibold">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4f1032] to-[#4f1032]/90 text-white py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-200 mt-2 text-sm sm:text-base">Welcome back, {user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Flights</p>
                <p className="text-xl sm:text-2xl font-bold text-[#4f1032]">{stats.totalFlights}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Airlines</p>
                <p className="text-xl sm:text-2xl font-bold text-[#4f1032]">{stats.totalAirlines}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Locations</p>
                <p className="text-xl sm:text-2xl font-bold text-[#4f1032]">{stats.totalLocations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-xl sm:text-2xl font-bold text-[#4f1032]">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-[#4f1032]">{formatPrice(stats.totalRevenue || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Flight Value</p>
                <p className="text-xl sm:text-2xl font-bold text-[#4f1032]">{formatPrice(stats.totalFlightValue || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold text-[#4f1032]">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#4f1032] mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <a
              href="/admin/flights/new"
              className="bg-[#cd7e0f] text-white p-4 sm:p-6 rounded-lg hover:bg-[#cd7e0f]/90 transition text-center"
            >
              <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="font-semibold text-sm sm:text-lg">Create Flight</h3>
              <p className="text-xs sm:text-sm opacity-90">Add new flight routes</p>
            </a>

            <a
              href="/admin/airlines"
              className="bg-[#4f1032] text-white p-4 sm:p-6 rounded-lg hover:bg-[#4f1032]/90 transition text-center"
            >
              <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="font-semibold text-sm sm:text-lg">Manage Airlines</h3>
              <p className="text-xs sm:text-sm opacity-90">Add or edit airlines</p>
            </a>

            <a
              href="/admin/locations"
              className="bg-green-600 text-white p-4 sm:p-6 rounded-lg hover:bg-green-700 transition text-center"
            >
              <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="font-semibold text-sm sm:text-lg">Manage Locations</h3>
              <p className="text-xs sm:text-sm opacity-90">Add or edit locations</p>
            </a>

            <a
              href="/search"
              className="bg-blue-600 text-white p-4 sm:p-6 rounded-lg hover:bg-blue-700 transition text-center"
            >
              <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-semibold text-sm sm:text-lg">View Flights</h3>
              <p className="text-xs sm:text-sm opacity-90">Browse all flights</p>
            </a>

            <a
              href="/admin/flights"
              className="bg-teal-600 text-white p-4 sm:p-6 rounded-lg hover:bg-teal-700 transition text-center"
            >
              <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              <h3 className="font-semibold text-sm sm:text-lg">Created Flights</h3>
              <p className="text-xs sm:text-sm opacity-90">View all created flights</p>
            </a>

            <a
              href="/admin/currencies"
              className="bg-purple-600 text-white p-4 sm:p-6 rounded-lg hover:bg-purple-700 transition text-center"
            >
              <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="font-semibold text-sm sm:text-lg">Manage Currencies</h3>
              <p className="text-xs sm:text-sm opacity-90">Add or edit currencies</p>
            </a>

            <a
              href="/admin/integrations"
              className="bg-gray-600 text-white p-4 sm:p-6 rounded-lg hover:bg-gray-700 transition text-center"
            >
              <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="font-semibold text-sm sm:text-lg">Integrations</h3>
              <p className="text-xs sm:text-sm opacity-90">Connect payment gateways</p>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#4f1032] mb-4 sm:mb-6">Recent Activity</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-3 sm:mr-4"></div>
              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base">Dashboard accessed</p>
                <p className="text-xs sm:text-sm text-gray-600">Admin dashboard loaded successfully</p>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">Just now</span>
            </div>
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-3 sm:mr-4"></div>
              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base">Statistics updated</p>
                <p className="text-xs sm:text-sm text-gray-600">Dashboard statistics refreshed</p>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">Just now</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#4f1032] mb-4 sm:mb-6">Users</h2>
          <div className="space-y-3 sm:space-y-4">
            {stats.users.map((user: any) => (
              <div key={user.id} className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-sm sm:text-base">{user.full_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
