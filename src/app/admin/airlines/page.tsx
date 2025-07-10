"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabaseClient";

function AirlinesPage() {
  const [airlines, setAirlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: ""
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
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
      
      setIsAdmin(true);
      await fetchAirlines();
      setLoading(false);
    };
    
    checkRoleAndFetch();
  }, [router]);

  const fetchAirlines = async () => {
    const { data, error } = await supabase.from("airlines").select("*").order("name");
    if (!error && data) {
      setAirlines(data);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const uploadLogo = async (file: File, airlineName: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${airlineName.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.${fileExt}`;
    
    try {
      // Try to upload to a more generic bucket name
      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file, { upsert: true });
      
      if (error) {
        console.error("Storage upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload logo. Please check your Supabase storage configuration.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);
    
    if (!formData.name.trim()) {
      setError("Airline name is required");
      setUploading(false);
      return;
    }

    try {
      let logoUrl = formData.logo_url;
      
      // Upload new logo if file is selected
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, formData.name);
      }

      const airlineData = {
        name: formData.name,
        logo_url: logoUrl
      };

      if (editingId) {
        // Update existing airline
        const { error } = await supabase
          .from("airlines")
          .update(airlineData)
          .eq("id", editingId);
        
        if (error) throw error;
        setSuccess("Airline updated successfully!");
      } else {
        // Create new airline
        const { error } = await supabase
          .from("airlines")
          .insert([airlineData]);
        
        if (error) throw error;
        setSuccess("Airline created successfully!");
      }
      
      setFormData({ name: "", logo_url: "" });
      setLogoFile(null);
      setEditingId(null);
      setShowForm(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchAirlines();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
    
    setUploading(false);
  };

  const handleEdit = (airline: any) => {
    setFormData({ name: airline.name, logo_url: airline.logo_url || "" });
    setLogoFile(null);
    setEditingId(airline.id);
    setShowForm(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this airline?")) return;
    
    try {
      const { error } = await supabase.from("airlines").delete().eq("id", id);
      if (error) throw error;
      
      setSuccess("Airline deleted successfully!");
      await fetchAirlines();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
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

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4f1032] to-[#4f1032]/90 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manage Airlines</h1>
              <p className="text-gray-200 mt-2">Add, edit, or remove airlines from the system</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setFormData({ name: "", logo_url: "" });
                  setLogoFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="bg-[#cd7e0f] text-white px-6 py-2 rounded-lg hover:bg-[#cd7e0f]/90 transition"
              >
                {showForm ? "Cancel" : "Add Airline"}
              </button>
              <a
                href="/admin/dashboard"
                className="border border-white text-white px-6 py-2 rounded-lg hover:bg-white hover:text-[#4f1032] transition"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#4f1032] mb-6">
              {editingId ? "Edit Airline" : "Add New Airline"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Airline Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter airline name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Airline Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={handleLogoChange}
                    ref={fileInputRef}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {editingId && formData.logo_url ? "Current logo will be replaced if a new file is selected" : "Upload airline logo (PNG, JPG, SVG, etc.)"}
                  </p>
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

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-[#cd7e0f] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#cd7e0f]/90 transition disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? "Processing..." : (editingId ? "Update Airline" : "Add Airline")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: "", logo_url: "" });
                    setLogoFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Airlines List */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[#4f1032] mb-6">All Airlines</h2>
          
          {airlines.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600">No airlines found. Add your first airline to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {airlines.map((airline) => (
                <div key={airline.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {airline.logo_url ? (
                        <img src={airline.logo_url} alt={airline.name} className="w-12 h-12 object-contain rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      )}
                      <h3 className="font-semibold text-lg">{airline.name}</h3>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(airline)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(airline.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AirlinesPage; 