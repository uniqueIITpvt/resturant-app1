'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Send, Mail, Users, AlertCircle, CheckCircle, X, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import Link from 'next/link';

// Define TypeScript interfaces
interface User {
  _id: string;
  id?: string; // Add optional id field for flexibility
  name: string;
  email: string;
  role: string;
}

// For compatibility with AuthContext
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EventOffer {
  _id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  offerType?: string;
}

interface NotificationState {
  type: string | null;
  message: string;
}

interface SuccessStats {
  total: number;
  successful: number;
  failed: number;
}

export default function EmailPage() {
  const { isAuthenticated, token, user: currentUser } = useAuth();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const [loading, setLoading] = useState<boolean>(false);
  const [eventOffers, setEventOffers] = useState<EventOffer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [messageTab, setMessageTab] = useState<'event' | 'custom'>('event');
  const [selectedEventOffer, setSelectedEventOffer] = useState<string>('');
  const [customEmail, setCustomEmail] = useState({
    subject: '',
    message: '',
  });
  const [testEmail, setTestEmail] = useState<string>('');
  const [bulkSending, setBulkSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<SuccessStats>({
    total: 0,
    successful: 0,
    failed: 0,
  });
  const [notificationState, setNotificationState] = useState<NotificationState>({
    type: null,
    message: '',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/email');
      return;
    }

    if (!token) {
      return; // Wait for token to be available
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch event offers
        const eventOffersRes = await axios.get(`${baseUrl}/api/event-offers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Safely handle event offers data
        const eventOffersData = eventOffersRes?.data?.data || [];
        setEventOffers(eventOffersData as EventOffer[]);

        // Fetch users
        const usersRes = await axios.get(`${baseUrl}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Handle different API response formats
        let userData = [];
        
        // If response contains a users array
        if (usersRes?.data?.users && Array.isArray(usersRes.data.users)) {
          userData = usersRes.data.users;
        } 
        // If response contains a data.users array
        else if (usersRes?.data?.data?.users && Array.isArray(usersRes.data.data.users)) {
          userData = usersRes.data.data.users;
        }
        // If response contains a data array  
        else if (usersRes?.data?.data && Array.isArray(usersRes.data.data)) {
          userData = usersRes.data.data;
        }
        // If response is directly an array
        else if (Array.isArray(usersRes?.data)) {
          userData = usersRes.data;
        }

        if (Array.isArray(userData) && userData.length > 0) {
          // Map user data to ensure consistent format
          const normalizedUsers = userData.map(user => ({
            _id: user._id || user.id || '',  // Support both _id and id formats
            name: user.name || 'Unknown',
            email: user.email || '',
            role: user.role || 'user'
          }));

          // Filter out non-user roles and empty email addresses
          const filteredUsers = normalizedUsers
            .filter(user => user._id && user.email && (user.role === 'user' || user.role === 'customer'))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          
          setUsers(filteredUsers as User[]);
        } else {
          setUsers([]);
          showNotification('error', 'No user data found in API response');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          showNotification('error', `Failed to load users: ${error.message}`);
        } else {
          showNotification('error', 'Failed to load data. Please try again.');
        }
        setUsers([]);
        setEventOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl, isAuthenticated, router, token, currentUser]);

  // Filter and sort users
  useEffect(() => {
    if (users.length === 0) {
      setFilteredUsers([]);
      return;
    }
    
    let result = [...users];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      if (sortDirection === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    
    setFilteredUsers(result);
  }, [users, searchTerm, sortDirection]);
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const showNotification = (type: string, message: string) => {
    setNotificationState({
      type,
      message,
    });

    setTimeout(() => {
      setNotificationState({
        type: null,
        message: '',
      });
    }, 5000);
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      showNotification('error', 'Please enter a test email address');
      return;
    }

    if (!token) {
      showNotification('error', 'You need to be logged in to send emails');
      return;
    }

    setLoading(true);
    showNotification('loading', 'Sending test email...');
    
    try {
      if (messageTab === 'event') {
        if (!selectedEventOffer) {
          showNotification('error', 'Please select an event or offer');
          setLoading(false);
          return;
        }

        await axios.post(
          `${baseUrl}/api/email/broadcast-event-offer/${selectedEventOffer}`,
          { testEmail },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        if (!customEmail.subject || !customEmail.message) {
          showNotification('error', 'Please enter a subject and message');
          setLoading(false);
          return;
        }

        await axios.post(
          `${baseUrl}/api/email/bulk-custom`,
          {
            testEmail,
            subject: customEmail.subject,
            message: customEmail.message,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      
      showNotification('success', 'Test email sent successfully! Check your inbox.');
    } catch (error) {
      // Explicitly mark error as used with void operator
      void error;
      showNotification('error', 'Failed to send test email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmails = async () => {
    if (!token) {
      showNotification('error', 'You need to be logged in to send emails');
      return;
    }

    if (selectedUsers.length === 0) {
      showNotification('error', 'Please select at least one user to receive the email');
      return;
    }

    if (messageTab === 'event' && !selectedEventOffer) {
      showNotification('error', 'Please select an event or offer');
      return;
    }

    if (messageTab === 'custom' && (!customEmail.subject || !customEmail.message)) {
      showNotification('error', 'Please enter a subject and message');
      return;
    }

    if (window.confirm(`Are you sure you want to send this email to ${selectedUsers.length} selected users? This action cannot be undone.`)) {
      setBulkSending(true);
      showNotification('loading', `Sending emails to ${selectedUsers.length} users...`);
      
      try {
        let response;
        
        if (messageTab === 'event') {
          response = await axios.post(
            `${baseUrl}/api/email/broadcast-event-offer/${selectedEventOffer}`,
            { 
              userIds: selectedUsers,
              recipientType: 'selected' // Add explicit flag to indicate selected users
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            }
          );
        } else {
          response = await axios.post(
            `${baseUrl}/api/email/bulk-custom`,
            {
              userIds: selectedUsers,
              recipientType: 'selected', // Add explicit flag to indicate selected users
              subject: customEmail.subject,
              message: customEmail.message,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            }
          );
        }

        const stats = response?.data?.stats || { total: 0, successful: 0, failed: 0 };
        setSuccess({
          total: stats.total || 0,
          successful: stats.successful || 0,
          failed: stats.failed || 0
        });

        showNotification('success', `Successfully sent ${stats.successful || 0} out of ${stats.total || 0} emails.`);
      } catch (error) {
        // Explicitly mark error as used with void operator
        void error;
        showNotification('error', 'Failed to send emails. Please try again.');
      } finally {
        setBulkSending(false);
      }
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      const allUserIds = users.map(user => user._id);
      setSelectedUsers(allUserIds);
    }
  };

  // Basic loading view
  if (loading && users.length === 0 && eventOffers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <span className="ml-2 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">Email Notifications</h1>
        <Link href="/dashboard" className="text-amber-600 hover:text-amber-800 text-sm sm:text-base">
          Back to Dashboard
        </Link>
      </div>

      {/* Notification bar */}
      {notificationState.type && (
        <div 
          className={`fixed top-4 right-4 z-50 p-3 sm:p-4 rounded-md shadow-md flex items-center max-w-[90vw] sm:max-w-md ${
            notificationState.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : notificationState.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}
        >
          {notificationState.type === 'success' && <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />}
          {notificationState.type === 'error' && <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />}
          {notificationState.type === 'loading' && <Loader2 className="w-5 h-5 mr-2 animate-spin flex-shrink-0" />}
          <span className="text-sm sm:text-base overflow-hidden text-ellipsis">{notificationState.message}</span>
          <button 
            onClick={() => setNotificationState({ type: null, message: '' })}
            className="ml-2 sm:ml-4 text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message Type Tabs */}
      <div className="flex border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <button
          onClick={() => setMessageTab('event')}
          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
            messageTab === 'event'
              ? 'border-b-2 border-amber-600 text-amber-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Event/Offer Emails
        </button>
        <button
          onClick={() => setMessageTab('custom')}
          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
            messageTab === 'custom'
              ? 'border-b-2 border-amber-600 text-amber-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Custom Message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column - Message Configuration */}
        <div className="lg:col-span-7 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {messageTab === 'event' ? 'Send Event/Offer Email' : 'Send Custom Message'}
          </h2>

          {messageTab === 'event' ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Event/Offer
                </label>
                <select
                  value={selectedEventOffer}
                  onChange={(e) => setSelectedEventOffer(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base"
                >
                  <option value="">-- Select an event or offer --</option>
                  {eventOffers.map((offer) => (
                    <option key={offer._id} value={offer._id}>
                      {offer.name || 'Unnamed Offer'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEventOffer && (
                <div className="bg-amber-50 p-3 sm:p-4 rounded-md border border-amber-100 mb-4 text-sm">
                  {(() => {
                    const offer = eventOffers.find(o => o._id === selectedEventOffer);
                    if (!offer) return <p>Selected offer details not available</p>;
                    
                    return (
                      <>
                        <h3 className="font-semibold text-amber-800 mb-2">
                          {offer.name || 'Unnamed Offer'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          {offer.description || 'No description'}
                        </p>
                        <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2">
                          <span>
                            {offer.startDate && (
                              <>Valid: {new Date(offer.startDate).toLocaleDateString()}</>
                            )}
                            {offer.endDate && (
                              <> - {new Date(offer.endDate).toLocaleDateString()}</>
                            )}
                          </span>
                          <span className="bg-amber-600 text-white px-2 py-1 rounded-full text-xs">
                            {offer.offerType || 'Offer'}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={customEmail.subject}
                  onChange={(e) => setCustomEmail({ ...customEmail, subject: e.target.value })}
                  placeholder="Enter email subject"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Message
                </label>
                <textarea
                  value={customEmail.message}
                  onChange={(e) => setCustomEmail({ ...customEmail, message: e.target.value })}
                  placeholder="Enter your message..."
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base"
                ></textarea>
              </div>
            </>
          )}

          <div className="mt-4 sm:mt-6 border-t pt-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Test Before Sending</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email address"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm"
              />
              <button
                onClick={handleTestEmail}
                disabled={loading}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center justify-center text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Test
              </button>
            </div>
          </div>

          <button
            onClick={handleSendEmails}
            disabled={bulkSending || selectedUsers.length === 0}
            className={`mt-4 sm:mt-6 w-full px-4 py-3 ${
              selectedUsers.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-amber-600 hover:bg-amber-700'
            } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center justify-center text-sm sm:text-base`}
          >
            {bulkSending ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                Sending Emails...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Send to {selectedUsers.length} Selected User{selectedUsers.length !== 1 ? 's' : ''}
              </>
            )}
          </button>

          {!bulkSending && selectedUsers.length > 0 && (
            <div className="mt-2 text-center text-xs text-gray-500">
              Email will only be sent to the {selectedUsers.length} recipient{selectedUsers.length !== 1 ? 's' : ''} you selected
            </div>
          )}

          {bulkSending && (
            <div className="mt-4 bg-amber-50 p-3 sm:p-4 rounded-md">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Sending emails...</span>
                <span className="text-xs sm:text-sm font-medium">{success.successful} / {success.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mt-2">
                <div
                  className="bg-amber-600 h-2 sm:h-2.5 rounded-full"
                  style={{ width: `${success.total ? (success.successful / success.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Recipients */}
        <div className="lg:col-span-5 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">Select Recipients</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllUsers}
                className="text-xs sm:text-sm text-amber-600 hover:text-amber-800 whitespace-nowrap"
              >
                {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-800"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {showFilters ? 'Hide Filters' : 'Filters'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-4 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="mb-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Search Users
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email"
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-500">
                  Sort by name:
                </span>
                <button 
                  onClick={toggleSortDirection}
                  className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-800"
                >
                  {sortDirection === 'asc' ? (
                    <>
                      <SortAsc className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      A-Z
                    </>
                  ) : (
                    <>
                      <SortDesc className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Z-A
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="bg-amber-50 p-3 sm:p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-2" />
                  <span className="text-xs sm:text-sm font-medium">
                    {selectedUsers.length} of {users.length} users selected
                  </span>
                </div>
                {searchTerm && (
                  <span className="text-xs text-gray-500">
                    Showing {filteredUsers.length} matches
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="mb-4 p-2 bg-green-50 border border-green-100 rounded-md text-xs sm:text-sm text-green-700">
              <p>✓ Selected {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} will receive the email</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-6 sm:py-8">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 animate-spin" />
              <span className="ml-2 text-sm">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <p className="text-sm">No users found. Check console for debugging information.</p>
              <button 
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    location.reload();
                  }, 500);
                }}
                className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-600 text-white text-xs sm:text-sm rounded-md hover:bg-amber-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="border rounded-md divide-y max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {(searchTerm ? filteredUsers : users).map((user) => {
                // Safely access currentUser as AuthUser type
                const authUser = currentUser as AuthUser | null;
                const currentUserId = authUser?.id;
                const userId = user._id || user.id;
                const isCurrentUser = userId === currentUserId;
                const isSelected = selectedUsers.includes(user._id);
                
                return (
                  <div
                    key={user._id}
                    className={`flex items-center p-2 sm:p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                      isCurrentUser ? 'bg-amber-50' : ''
                    } ${isSelected ? 'bg-amber-100' : ''}`}
                    onClick={() => toggleUserSelection(user._id)}
                  >
                    <div className="flex items-center mr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleUserSelection(user._id);
                        }}
                        className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 focus:ring-amber-500 mr-2 sm:mr-3"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate flex items-center">
                        {user.name || 'Unknown'} 
                        {isCurrentUser && <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-amber-600">(You)</span>}
                        {isSelected && <span className="ml-auto text-[10px] text-amber-600">Selected</span>}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{user.email || 'No email'}</p>
                    </div>
                  </div>
                );
              })}
              
              {searchTerm && filteredUsers.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No users match your search criteria
                </div>
              )}
            </div>
          )}
          
          {!loading && users.length > 0 && (
            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
              <span>Total: {users.length} users</span>
              {selectedUsers.length > 0 && (
                <button 
                  onClick={() => setSelectedUsers([])}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}