"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export default function PaymentIntegrations() {
  // Test Keys
  const [flutterwaveTestPublicKey, setFlutterwaveTestPublicKey] = useState('');
  const [flutterwaveTestSecretKey, setFlutterwaveTestSecretKey] = useState('');
  const [flutterwaveTestEncryptionKey, setFlutterwaveTestEncryptionKey] = useState('');
  
  // Live Keys
  const [flutterwaveLivePublicKey, setFlutterwaveLivePublicKey] = useState('');
  const [flutterwaveLiveSecretKey, setFlutterwaveLiveSecretKey] = useState('');
  const [flutterwaveLiveEncryptionKey, setFlutterwaveLiveEncryptionKey] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [savingTest, setSavingTest] = useState(false);
  const [savingLive, setSavingLive] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        console.log('Fetching API keys...');
        
        // First, let's check if the table exists and its structure
        const { data: tableInfo, error: tableError } = await supabase
          .from('payment_gateways')
          .select('*')
          .limit(1);
        
        console.log('Table check result:', { tableInfo, tableError });
        
        const { data, error } = await supabase
          .from('payment_gateways')
          .select('*')
          .eq('name', 'flutterwave');
        
        console.log('Fetch result:', { data, error });
        
        if (error && error.code !== 'PGRST116') { // Ignore no rows found error
          throw error;
        }

        if (data && data.length > 0) {
          // Test Keys
          const testPublic = data.find(item => item.type === 'test_public')?.api_key || '';
          const testSecret = data.find(item => item.type === 'test_secret')?.api_key || '';
          const testEncryption = data.find(item => item.type === 'test_encryption')?.api_key || '';
          
          // Live Keys
          const livePublic = data.find(item => item.type === 'live_public')?.api_key || '';
          const liveSecret = data.find(item => item.type === 'live_secret')?.api_key || '';
          const liveEncryption = data.find(item => item.type === 'live_encryption')?.api_key || '';
          
          setFlutterwaveTestPublicKey(testPublic);
          setFlutterwaveTestSecretKey(testSecret);
          setFlutterwaveTestEncryptionKey(testEncryption);
          setFlutterwaveLivePublicKey(livePublic);
          setFlutterwaveLiveSecretKey(liveSecret);
          setFlutterwaveLiveEncryptionKey(liveEncryption);
        }
      } catch (err) {
        console.error('Error fetching API keys:', err);
        setError('Failed to fetch API keys');
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  const saveKeysViaAPI = async (keysToSave: any[]) => {
    try {
      console.log('Saving keys via API:', keysToSave);
      
      const response = await fetch('/api/save-api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keys: keysToSave }),
      });
      
      const result = await response.json();
      console.log('API save result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save keys');
      }
      
      return result;
    } catch (error: any) {
      console.error('API save error:', error);
      throw error;
    }
  };

  const handleSaveTestKeys = async () => {
    setSavingTest(true);
    setError('');
    setSuccess('');

    try {
      console.log('Saving test keys...', { flutterwaveTestPublicKey, flutterwaveTestSecretKey, flutterwaveTestEncryptionKey });
      
      const testKeysToSave = [
        { name: 'flutterwave', type: 'test_public', api_key: flutterwaveTestPublicKey },
        { name: 'flutterwave', type: 'test_secret', api_key: flutterwaveTestSecretKey },
        { name: 'flutterwave', type: 'test_encryption', api_key: flutterwaveTestEncryptionKey },
      ].filter(key => key.api_key); // Only save keys that have values

      if (testKeysToSave.length === 0) {
        setError('No test keys to save');
        return;
      }

      await saveKeysViaAPI(testKeysToSave);
      setSuccess('Test API keys saved successfully');
    } catch (err: any) {
      console.error('Error saving test keys:', err);
      setError(`Failed to save test API keys: ${err.message || err}`);
    } finally {
      setSavingTest(false);
    }
  };

  const handleSaveLiveKeys = async () => {
    setSavingLive(true);
    setError('');
    setSuccess('');

    try {
      const liveKeysToSave = [
        { name: 'flutterwave', type: 'live_public', api_key: flutterwaveLivePublicKey },
        { name: 'flutterwave', type: 'live_secret', api_key: flutterwaveLiveSecretKey },
        { name: 'flutterwave', type: 'live_encryption', api_key: flutterwaveLiveEncryptionKey },
      ].filter(key => key.api_key); // Only save keys that have values

      if (liveKeysToSave.length === 0) {
        setError('No live keys to save');
        return;
      }

      await saveKeysViaAPI(liveKeysToSave);
      setSuccess('Live API keys saved successfully');
    } catch (err: any) {
      setError(`Failed to save live API keys: ${err.message || err}`);
    } finally {
      setSavingLive(false);
    }
  };

  const handleSave = async () => {
    setSavingAll(true);
    setError('');
    setSuccess('');

    try {
      const keysToSave = [
        { name: 'flutterwave', type: 'test_public', api_key: flutterwaveTestPublicKey },
        { name: 'flutterwave', type: 'test_secret', api_key: flutterwaveTestSecretKey },
        { name: 'flutterwave', type: 'test_encryption', api_key: flutterwaveTestEncryptionKey },
        { name: 'flutterwave', type: 'live_public', api_key: flutterwaveLivePublicKey },
        { name: 'flutterwave', type: 'live_secret', api_key: flutterwaveLiveSecretKey },
        { name: 'flutterwave', type: 'live_encryption', api_key: flutterwaveLiveEncryptionKey },
      ].filter(key => key.api_key); // Only save keys that have values

      if (keysToSave.length === 0) {
        setError('No API keys to save');
        return;
      }

      await saveKeysViaAPI(keysToSave);
      setSuccess('All API keys saved successfully');
    } catch (err: any) {
      setError(`Failed to save API keys: ${err.message || err}`);
    } finally {
      setSavingAll(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    // Temporarily show full key for debugging
    return key;
    // if (key.length <= 8) return key;
    // return key.substring(0, 8) + '*'.repeat(key.length - 8);
  };

  const KeyInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    savedValue, 
    cardColor, 
    cardTextColor 
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    savedValue: string;
    cardColor: string;
    cardTextColor: string;
  }) => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f1032] focus:border-transparent"
        />
      </div>
      
      {savedValue && (
        <div className={`${cardColor} border rounded-lg p-3`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${cardTextColor}`}>Saved:</span>
            <span className={`text-sm font-mono ${cardTextColor}`}>{maskApiKey(savedValue)}</span>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f1032] mx-auto mb-4"></div>
          <p className="text-[#4f1032] font-semibold">Loading Integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4f1032] to-[#4f1032]/90 text-white py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">Payment Integrations</h1>
              <p className="text-gray-200 mt-2 text-sm sm:text-base">Manage your Flutterwave payment gateway settings</p>
            </div>
            <a
              href="/admin/dashboard"
              className="bg-[#cd7e0f] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#cd7e0f]/90 transition text-sm sm:text-base"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#4f1032] mb-6">Flutterwave Configuration</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Keys Section */}
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <h3 className="text-lg font-semibold text-blue-800">Test Environment Keys</h3>
                <p className="text-blue-600 text-sm mt-1">Use these keys for testing and development</p>
              </div>
              
              <div className="space-y-4">
                <KeyInput
                  label="Test Public Key"
                  value={flutterwaveTestPublicKey}
                  onChange={setFlutterwaveTestPublicKey}
                  placeholder="Enter Flutterwave Test Public Key"
                  savedValue={flutterwaveTestPublicKey}
                  cardColor="bg-blue-50 border-blue-200"
                  cardTextColor="text-blue-800"
                />
                
                <KeyInput
                  label="Test Secret Key"
                  value={flutterwaveTestSecretKey}
                  onChange={setFlutterwaveTestSecretKey}
                  placeholder="Enter Flutterwave Test Secret Key"
                  savedValue={flutterwaveTestSecretKey}
                  cardColor="bg-blue-50 border-blue-200"
                  cardTextColor="text-blue-800"
                />
                
                <KeyInput
                  label="Test Encryption Key"
                  value={flutterwaveTestEncryptionKey}
                  onChange={setFlutterwaveTestEncryptionKey}
                  placeholder="Enter Flutterwave Test Encryption Key"
                  savedValue={flutterwaveTestEncryptionKey}
                  cardColor="bg-blue-50 border-blue-200"
                  cardTextColor="text-blue-800"
                />
              </div>
              
              {/* Test Keys Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveTestKeys}
                  disabled={savingTest}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {savingTest ? 'Saving Test Keys...' : 'Save Test Keys'}
                </button>
              </div>
            </div>

            {/* Live Keys Section */}
        <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <h3 className="text-lg font-semibold text-green-800">Live Environment Keys</h3>
                <p className="text-green-600 text-sm mt-1">Use these keys for production payments</p>
              </div>
              
              <div className="space-y-4">
                <KeyInput
                  label="Live Public Key"
                  value={flutterwaveLivePublicKey}
                  onChange={setFlutterwaveLivePublicKey}
                  placeholder="Enter Flutterwave Live Public Key"
                  savedValue={flutterwaveLivePublicKey}
                  cardColor="bg-green-50 border-green-200"
                  cardTextColor="text-green-800"
                />
            
                <KeyInput
                  label="Live Secret Key"
                  value={flutterwaveLiveSecretKey}
                  onChange={setFlutterwaveLiveSecretKey}
                  placeholder="Enter Flutterwave Live Secret Key"
                  savedValue={flutterwaveLiveSecretKey}
                  cardColor="bg-green-50 border-green-200"
                  cardTextColor="text-green-800"
                />
                
                <KeyInput
                  label="Live Encryption Key"
                  value={flutterwaveLiveEncryptionKey}
                  onChange={setFlutterwaveLiveEncryptionKey}
                  placeholder="Enter Flutterwave Live Encryption Key"
                  savedValue={flutterwaveLiveEncryptionKey}
                  cardColor="bg-green-50 border-green-200"
                  cardTextColor="text-green-800"
                />
              </div>
              
              {/* Live Keys Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveLiveKeys}
                  disabled={savingLive}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {savingLive ? 'Saving Live Keys...' : 'Save Live Keys'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Test Database Connection Button */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={async () => {
                try {
                  console.log('Testing database connection...');
                  const response = await fetch('/api/test-db');
                  const result = await response.json();
                  console.log('Database test result:', result);
                  
                  if (result.success) {
                    setSuccess(`Database connection test successful! Duration: ${result.duration}ms`);
                  } else {
                    setError(`Database test failed: ${result.error}`);
                  }
                } catch (err: any) {
                  setError(`Database test error: ${err.message}`);
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
            >
              Test Database Connection
            </button>
            
            <button
              onClick={handleSave}
              disabled={savingAll}
              className="px-6 py-3 bg-[#4f1032] text-white rounded-lg hover:bg-[#4f1032]/90 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {savingAll ? 'Saving All Keys...' : 'Save All API Keys'}
            </button>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
