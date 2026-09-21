import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buyerApi } from '../services/api';
import {
  User as UserIcon,
  MapPin,
  History,
  Award,
  Bell,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { SavedAddress, LoyaltyProfile, CommunicationPreferences, AdminOrder } from '../types';

type ProfileTab = 'account' | 'addresses' | 'orders' | 'rewards' | 'notifications';

export default function BuyerProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form & Domain States
  const [accountForm, setAccountForm] = useState({ fullName: '', email: '', phone: '' });
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyProfile>({
    pointsBalance: 0,
    tier: 'BRONZE',
    storeCreditKes: 0,
    activeCouponsCount: 0
  });
  const [prefs, setPrefs] = useState<CommunicationPreferences>({
    emailReceipts: true,
    smsDeliveryAlerts: true,
    priceDropAlerts: false,
    marketingNewsletter: false
  });

  const [newAddress, setNewAddress] = useState({
    label: '',
    recipientName: '',
    phone: '',
    streetAddress: '',
    city: 'Nairobi'
  });

  const triggerNotice = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Fetch real data on mount
  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        setLoading(true);
        const [profileRes, addrRes, ordersRes] = await Promise.allSettled([
          buyerApi.getProfile(),
          buyerApi.getAddresses(),
          buyerApi.getMyOrders()
        ]);

        if (profileRes.status === 'fulfilled') {
          const p = profileRes.value.data;
          setAccountForm({
            fullName: p.fullName || user?.fullName || '',
            email: p.email || user?.email || '',
            phone: p.phoneNumber || user?.phoneNumber || ''
          });
          if (p.preferences) setPrefs(p.preferences);
          if (p.loyalty) setLoyalty(p.loyalty);
        }

        if (addrRes.status === 'fulfilled') {
          setAddresses(Array.isArray(addrRes.value.data) ? addrRes.value.data : []);
        } else {
          setAddresses([]);
        }

        if (ordersRes.status === 'fulfilled') {
          setOrders(Array.isArray(ordersRes.value.data) ? ordersRes.value.data : []);
        } else {
          setOrders([]);
        }
      } catch (err: unknown) {
        setErrorMsg('Failed to load user profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerData();
  }, [user]);

  const handleUpdateAccount = async () => {
    try {
      await buyerApi.updateProfile({
        fullName: accountForm.fullName,
        phoneNumber: accountForm.phone
      });
      triggerNotice('Personal details updated in database.');
    } catch {
      setErrorMsg('Failed to save profile changes.');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.streetAddress || !newAddress.label) return;
    try {
      const res = await buyerApi.saveAddress({
        label: newAddress.label,
        recipientName: newAddress.recipientName || accountForm.fullName,
        phone: newAddress.phone || accountForm.phone,
        streetAddress: newAddress.streetAddress,
        city: newAddress.city,
        isDefault: addresses.length === 0
      });
      setAddresses([...addresses, res.data]);
      setNewAddress({ label: '', recipientName: '', phone: '', streetAddress: '', city: 'Nairobi' });
      triggerNotice('Delivery destination saved.');
    } catch {
      setErrorMsg('Could not save address.');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await buyerApi.deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      triggerNotice('Address removed.');
    } catch {
      setErrorMsg('Could not delete address.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {accountForm.fullName ? accountForm.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{accountForm.fullName || 'User Profile'}</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{accountForm.email} • {accountForm.phone || 'No phone set'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full border border-blue-100 uppercase">
                {loyalty.tier} TIER
              </span>
              <span className="text-[11px] font-bold text-slate-600">
                {loyalty.pointsBalance} Points
              </span>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 space-y-1 shadow-sm">
            {[
              { id: 'account', label: 'Account Details', icon: UserIcon },
              { id: 'addresses', label: 'Address Book', icon: MapPin },
              { id: 'orders', label: 'Purchase History', icon: History },
              { id: 'rewards', label: 'Loyalty & Credits', icon: Award },
              { id: 'notifications', label: 'Preferences', icon: Bell }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Panes */}
        <div className="lg:col-span-9">
          {/* TAB 1: Account Details */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">Personal Details</h2>
              <p className="text-xs text-slate-400 mb-6">Database-backed contact details used during M-Pesa checkouts.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={accountForm.fullName}
                    onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={accountForm.email}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">Primary M-Pesa Phone</label>
                  <input
                    type="text"
                    value={accountForm.phone}
                    onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleUpdateAccount}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Address Book */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-1">Saved Dispatch Destinations</h2>
                <p className="text-xs text-slate-400 mb-4">Saved destinations retrieved from your user account.</p>

                {addresses.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No addresses saved yet. Add one below.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((a) => (
                      <div key={a.id} className="p-4 rounded-2xl border border-slate-200 text-xs">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-900">{a.label}</span>
                          {a.isDefault && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 font-medium">{a.streetAddress}, {a.city}</p>
                        <p className="text-slate-400 mt-1">{a.recipientName} • {a.phone}</p>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => handleDeleteAddress(a.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-[11px] flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form to Add Address */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Add New Address</h3>
                <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">Address Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Workshop Nairobi"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="Receiver name"
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-600 uppercase text-[10px] mb-1">Detailed Street Address / Landmark</label>
                    <input
                      type="text"
                      placeholder="Road, building, plot number"
                      value={newAddress.streetAddress}
                      onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800 transition"
                  >
                    <Plus className="w-4 h-4" /> Save New Address
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: Purchase Orders */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">Purchase Orders</h2>
              <p className="text-xs text-slate-400 mb-6">Actual completed checkout transactions tied to your email.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Tracking No</th>
                      <th className="px-4 py-3">Total Amount</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">M-Pesa Receipt</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.isArray(orders) && orders.length > 0 ? (
                      orders.map((o) => (
                        <tr key={o.id}>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">{o.trackingNumber}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">KES {Number(o.totalAmount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              o.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">{o.mpesaReceiptNumber || '—'}</td>
                          <td className="px-4 py-3 text-right font-bold text-blue-600">{o.orderStatus}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400">
                          No purchases recorded under this account.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Loyalty Data */}
          {activeTab === 'rewards' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-3xl shadow-sm">
                <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">Tier Status</span>
                <h3 className="text-2xl font-black mt-1">{loyalty.tier}</h3>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Credits</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">KES {loyalty.storeCreditKes}</h3>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Points</span>
                <h3 className="text-2xl font-black text-blue-600 mt-1">{loyalty.pointsBalance}</h3>
              </div>
            </div>
          )}

          {/* TAB 5: Saved Preferences */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">Communication Settings</h2>
              <div className="space-y-4 text-xs mt-4">
                {[
                  { key: 'emailReceipts' as const, title: 'Transactional Receipts', desc: 'Email M-Pesa receipts upon payment.' },
                  { key: 'smsDeliveryAlerts' as const, title: 'SMS Dispatch Notifications', desc: 'SMS updates when hardware is on route.' }
                ].map((opt) => (
                  <label key={opt.key} className="flex items-start justify-between p-3.5 bg-slate-50 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">{opt.title}</span>
                      <span className="text-[11px] text-slate-500">{opt.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(prefs[opt.key])}
                      onChange={(e) => {
                        const updated = { ...prefs, [opt.key]: e.target.checked };
                        setPrefs(updated);
                        buyerApi.updatePreferences(updated);
                        triggerNotice('Preference updated.');
                      }}
                      className="mt-1 text-blue-600 rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}