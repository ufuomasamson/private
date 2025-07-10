"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrencyStore } from "@/lib/currencyManager";

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { currency, setCurrency } = useCurrencyStore();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let refreshTimeout: NodeJS.Timeout | null = null;

    // Helper to fetch and set session/user
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Fetch user role and full name
        const { data: userData } = await supabase
          .from("users")
          .select("role, full_name")
          .eq("id", session.user.id)
          .single();
        setUserRole(userData?.role || null);
        setUser((prevUser: any) => ({ ...prevUser, full_name: userData?.full_name || '' }));
        // Try to fetch user currency preference, but don't fail if table doesn't exist
        try {
          const { data: prefData, error } = await supabase
            .from('user_preferences')
            .select('currency_code')
            .eq('user_id', session.user.id)
            .maybeSingle();
          if (error) {
            console.log("Error fetching user preferences:", error);
          } else if (prefData) {
            setCurrency(prefData.currency_code);
          }
        } catch (error) {
          console.log("user_preferences table not found or error occurred, using default currency");
        }
        // Set up session refresh 30 minutes before expiry
        if (session.expires_at) {
          const now = Math.floor(Date.now() / 1000);
          const timeToExpiry = session.expires_at - now;
          const refreshIn = Math.max((timeToExpiry - 1800) * 1000, 0); // 30 min before expiry
          if (refreshTimeout) clearTimeout(refreshTimeout);
          refreshTimeout = setTimeout(() => {
            supabase.auth.refreshSession().then(fetchSession);
          }, refreshIn);
        }
      }
      if (isMounted) setLoading(false);
    };

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          // Fetch user role and full name
          const { data: userData } = await supabase
            .from("users")
            .select("role, full_name")
            .eq("id", session.user.id)
            .single();
          setUserRole(userData?.role || null);
          setUser((prevUser: any) => ({ ...prevUser, full_name: userData?.full_name || '' }));
        } else {
          setUser(null);
          setUserRole(null);
        }
        if (isMounted) setLoading(false);
      }
    );
    return () => {
      isMounted = false;
      if (refreshTimeout) clearTimeout(refreshTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Improved mobile menu: always reset on route change and reliably open/close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change (for mobile nav bug)
  useEffect(() => {
    const handleRouteChange = () => setIsMobileMenuOpen(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    if (user) {
      try {
        // Try to update first, if no record exists, create one
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update({ currency_code: newCurrency })
          .eq('user_id', user.id);
        
        if (updateError && updateError.code === 'PGRST116') {
          // No rows found, create a new preference record
          const { error: insertError } = await supabase
            .from('user_preferences')
            .insert({ user_id: user.id, currency_code: newCurrency });
          
          if (insertError) {
            console.log("Error creating user preference:", insertError);
          }
        } else if (updateError) {
          console.log("Error updating user preference:", updateError);
        }
      } catch (error) {
        // Table doesn't exist or other error, that's okay
        console.log("user_preferences table not found or error occurred, currency change not persisted");
      }
    }
  };

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-[#4f1032] flex items-center justify-between px-8 py-4">
        <Link href="/" className="text-2xl font-bold text-white tracking-tight">Mazol</Link>
        <div className="hidden md:flex gap-8 items-center text-base font-medium">
          <div className="text-white">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#4f1032] flex flex-wrap items-center justify-between px-4 sm:px-8 py-4">
      <Link href="/" className="text-2xl font-bold text-white tracking-tight">Mano Air</Link>
      {/* Currency Switcher - always visible */}
      <div className="flex items-center gap-2 w-full justify-center mt-2 md:mt-0 md:w-auto md:justify-end order-3 md:order-none">
        <select
          onChange={(e) => handleCurrencyChange(e.target.value)}
          value={currency}
          className="bg-[#4f1032] text-white px-3 py-1 rounded border border-white/20 hover:border-white/40 transition text-sm md:text-base w-32 md:w-auto"
        >
          <option value="USD">$ USD</option>
          <option value="EUR">€ EUR</option>
          <option value="GBP">£ GBP</option>
        </select>
      </div>
      {/* Desktop Nav */}
      <div className="hidden md:flex gap-8 items-center text-base font-medium">
        <Link href="/" className="text-white hover:text-[#cd7e0f] transition">Home</Link>
        <Link href="/about" className="text-white hover:text-[#cd7e0f] transition">About Us</Link>
        <Link href="/search" className="text-white hover:text-[#cd7e0f] transition">Flights</Link>
        <Link href="/track" className="text-white hover:text-[#cd7e0f] transition">Track Flight</Link>
        <Link href="/contact" className="text-white hover:text-[#cd7e0f] transition">Contact</Link>
        {user ? (
          <div className="flex items-center gap-4">
            {userRole === "admin" && (
              <Link href="/admin/dashboard" className="text-white hover:text-[#cd7e0f] transition">
                Admin Dashboard
              </Link>
            )}
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 text-white font-medium">
                {user.full_name || user.email}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-black">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
            <button
                    onClick={() => {
                      handleSignOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="ml-4 px-4 py-2 bg-[#cd7e0f] text-white rounded hover:bg-[#cd7e0f]/90 transition">Login</Link>
            <Link href="/signup" className="ml-2 px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-[#4f1032] transition">Sign Up</Link>
          </div>
        )}
      </div>
      {/* Hamburger for mobile */}
      <div className="md:hidden order-2 flex-1 flex justify-end">
        <button
          className="text-white focus:outline-none"
          aria-label="Open menu"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="absolute top-full left-0 w-full bg-[#4f1032] shadow-lg z-50 flex flex-col items-center py-4 animate-fade-in">
          <Link href="/" className="text-white py-2 w-full text-center hover:bg-[#cd7e0f]" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/about" className="text-white py-2 w-full text-center hover:bg-[#cd7e0f]" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          <Link href="/search" className="text-white py-2 w-full text-center hover:bg-[#cd7e0f]" onClick={() => setIsMobileMenuOpen(false)}>Flights</Link>
          <Link href="/track" className="text-white py-2 w-full text-center hover:bg-[#cd7e0f]" onClick={() => setIsMobileMenuOpen(false)}>Track Flight</Link>
          <Link href="/contact" className="text-white py-2 w-full text-center hover:bg-[#cd7e0f]" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          {user ? (
            <>
              {userRole === "admin" && (
                <Link href="/admin/dashboard" className="text-white py-2 w-full text-center hover:bg-[#cd7e0f]" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
              )}
              <Link href="/profile" className="text-white py-2 w-full text-center hover:bg-[#cd7e0f]" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="text-white py-2 w-full text-center hover:bg-[#cd7e0f]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white py-2 w-full text-center hover:bg-[#cd7e0f]" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link href="/signup" className="text-white py-2 w-full text-center hover:bg-[#cd7e0f]" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}