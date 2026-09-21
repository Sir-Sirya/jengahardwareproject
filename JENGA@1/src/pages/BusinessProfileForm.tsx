import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessProfileApi } from '../services/api';
import { Building2, CreditCard, Share2, FileText, ArrowLeft, Save, Loader2 } from 'lucide-react';
import type { BusinessProfile } from '../types';

export default function BusinessProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState<BusinessProfile>({
    businessName: '',
    headOfficeAddress: '',
    phoneNumber: '',
    emailAddress: '',
    instagramUrl: '',
    tiktokUrl: '',
    whatsappNumber: '',
    contactNumber: '',
    mpesaPaymentType: 'BUY_GOODS_TILL',
    mpesaTillNumber: '',
    mpesaPaybillNumber: '',
    mpesaAccountNumber: '',
    mpesaNumber: '',
    registrationDate: '',
    companyStatus: 'Active / Private Limited Company',
    companyOverview: '',
    mission: '',
    vision: '',
    productsAndServices: '',
    keyPersonnel: '',
    majorClientsAchievements: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await businessProfileApi.getMine();
        if (res.data) {
          setForm((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setFetching(false);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await businessProfileApi.saveOrUpdate(form);
      alert('Business Profile updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to save business profile.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: General Business Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-600" /> 1. General Business Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="e.g. Apex Logistics & Supplies Ltd"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Head Office Address *</label>
              <input
                type="text"
                required
                value={form.headOfficeAddress || ''}
                onChange={(e) => setForm({ ...form, headOfficeAddress: e.target.value })}
                placeholder="e.g. Rahimtulla Tower, Upper Hill, Nairobi"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Office Phone Number *</label>
              <input
                type="text"
                required
                value={form.phoneNumber || ''}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                placeholder="+254 20 555 0199"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                value={form.emailAddress || ''}
                onChange={(e) => setForm({ ...form, emailAddress: e.target.value })}
                placeholder="info@apexlogistics.co.ke"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Safaricom M-Pesa Setup */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-emerald-600" /> 2. Safaricom M-Pesa Payment Setup
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs font-semibold">
            {['BUY_GOODS_TILL', 'PAYBILL', 'SEND_MONEY_PHONE'].map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setForm({ ...form, mpesaPaymentType: mode })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  form.mpesaPaymentType === mode
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                {mode.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {form.mpesaPaymentType === 'BUY_GOODS_TILL' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Buy Goods Till Number</label>
                <input
                  type="text"
                  value={form.mpesaTillNumber || ''}
                  onChange={(e) => setForm({ ...form, mpesaTillNumber: e.target.value })}
                  placeholder="e.g. 5234567"
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
            )}
            {form.mpesaPaymentType === 'PAYBILL' && (
              <>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Paybill Number</label>
                  <input
                    type="text"
                    value={form.mpesaPaybillNumber || ''}
                    onChange={(e) => setForm({ ...form, mpesaPaybillNumber: e.target.value })}
                    placeholder="e.g. 247247"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Number</label>
                  <input
                    type="text"
                    value={form.mpesaAccountNumber || ''}
                    onChange={(e) => setForm({ ...form, mpesaAccountNumber: e.target.value })}
                    placeholder="e.g. SHOP01"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Disbursement / Mobile Line</label>
              <input
                type="text"
                value={form.mpesaNumber || ''}
                onChange={(e) => setForm({ ...form, mpesaNumber: e.target.value })}
                placeholder="e.g. 0712345678"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Social Channels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-indigo-600" /> 3. Social Media & Direct Line
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">WhatsApp Direct Number</label>
              <input
                type="text"
                value={form.whatsappNumber || ''}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="+254 712 345 678"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Alternative Contact Line</label>
              <input
                type="text"
                value={form.contactNumber || ''}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                placeholder="+254 722 000 111"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Instagram Profile Link</label>
              <input
                type="text"
                value={form.instagramUrl || ''}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/yourshop"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">TikTok Profile Link</label>
              <input
                type="text"
                value={form.tiktokUrl || ''}
                onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
                placeholder="https://tiktok.com/@yourshop"
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Narrative & Personnel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-amber-600" /> 4. Story, Personnel & Achievements
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company Overview & Story</label>
              <textarea
                rows={3}
                value={form.companyOverview || ''}
                onChange={(e) => setForm({ ...form, companyOverview: e.target.value })}
                placeholder="Founded in 2020, we supply certified hardware..."
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mission</label>
                <textarea
                  rows={2}
                  value={form.mission || ''}
                  onChange={(e) => setForm({ ...form, mission: e.target.value })}
                  placeholder="Empowering regional construction trade..."
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vision</label>
                <textarea
                  rows={2}
                  value={form.vision || ''}
                  onChange={(e) => setForm({ ...form, vision: e.target.value })}
                  placeholder="To become the most trusted hardware partner..."
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Business Profile
        </button>
      </form>
    </div>
  );
}