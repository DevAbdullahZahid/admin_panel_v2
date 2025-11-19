'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Search, Mail, Clock, Copy, Check, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/apiService'; // ✅ Use the same API utility as other components

interface Inquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'new' | 'read' | 'replied';
}

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInquiries = async () => {
    setLoading(true);
    setError('');

    try {
      // ✅ Using apiFetch - same as your other components
      const response = await apiFetch('/support-inquiries');
      
      // Handle different possible response structures
      const inquiriesData = response?.data?.inquiries || response?.results || response?.data || response || [];
      
      const items: Inquiry[] = Array.isArray(inquiriesData) 
        ? inquiriesData.map((i: any) => ({
            id: i.id || i.inquiry_id,
            name: i.name || '',
            email: i.email || '',
            subject: i.subject || '',
            message: i.message || '',
            created_at: i.created_at || i.createdAt || new Date().toISOString(),
            status: i.status || 'new',
          }))
        : [];

      setInquiries(items);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load inquiries from the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const copy = (text: string, id: number) => {
    // Modern clipboard API with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(id);
          setTimeout(() => setCopied(null), 1500);
        })
        .catch(err => console.error('Copy failed:', err));
    } else {
      // Fallback for older browsers
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        document.execCommand('copy');
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
      } catch (err) {
        console.error('Could not copy text:', err);
      }
      document.body.removeChild(tempInput);
    }
  };

  const filtered = inquiries.filter(i =>
    [i.name, i.email, i.subject, i.message].some(field =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );
  
  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-700 text-lg">Loading customer inquiries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-red-100 border border-red-300 rounded-xl p-6 text-center shadow-lg">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-red-800">Error Loading Inquiries</h3>
          <p className="text-red-700 mt-2 whitespace-pre-wrap">{error}</p>
          <button
            onClick={fetchInquiries}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-4">
                <MessageSquare className="w-12 h-12" />
                Customer Inquiries
              </h1>
              <p className="mt-2 opacity-90 text-lg">
                Viewing {filtered.length} of {inquiries.length} total messages
              </p>
            </div>
            <button
              onClick={fetchInquiries}
              className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition font-medium text-sm"
            >
              Refresh
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search inquiries by name, email, or subject..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition"
              />
            </div>

            {/* Inquiries List */}
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-500 py-12 text-lg">
                  {search ? `No inquiries matched "${search}".` : 'No inquiries found in the system.'}
                </p>
              ) : (
                filtered.map((inq) => (
                  <div 
                    key={inq.id} 
                    className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {inq.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-xl text-gray-800">{inq.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-purple-500" />
                            {inq.email}
                            <button 
                              onClick={() => copy(inq.email, inq.id)}
                              className="p-1 rounded-full text-gray-500 hover:text-purple-600 transition"
                              title="Copy Email"
                            >
                              {copied === inq.id ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm ${
                        inq.status === 'new' ? 'bg-red-50 text-red-600 border border-red-300' :
                        inq.status === 'replied' ? 'bg-green-50 text-green-600 border border-green-300' :
                        'bg-gray-50 text-gray-600 border border-gray-300'
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                    
                    {/* Subject */}
                    <h4 className="font-semibold text-xl text-purple-700 mb-2">{inq.subject}</h4>
                    
                    {/* Message */}
                    <p className="text-gray-700 mb-3 leading-relaxed border-l-4 border-gray-200 pl-3 py-1 bg-gray-50 rounded-md">
                      {inq.message}
                    </p>
                    
                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {format(new Date(inq.created_at), 'MMMM d, yyyy ⋅ h:mm a')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}