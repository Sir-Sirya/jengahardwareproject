import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Truck, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Plus,
  Minus
} from 'lucide-react';
import type { Product } from '../types';

interface CheckoutCartItem {
  product: Product;
  quantity: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. Persistent Form & Cart State
  const [cart, setCart] = useState<CheckoutCartItem[]>(() => {
    const saved = localStorage.getItem('jenga_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '2547',
    deliveryAddress: '',
    paymentMethod: 'MPESA', // 'MPESA' | 'CARD' | 'CASH_ON_DELIVERY'
  });

  const [loading, setLoading] = useState(false);
  const [paymentHandshake, setPaymentHandshake] = useState(false);
  const [confirmedReceipt, setConfirmedReceipt] = useState<string | null>(null);
  const [activeTrackingNumber, setActiveTrackingNumber] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Save cart changes
  useEffect(() => {
    localStorage.setItem('jenga_cart', JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CheckoutCartItem[]
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 250 : 0;
  const grandTotal = subtotal + deliveryFee;

  // Poll for M-Pesa confirmation callback and receipt
  const startPaymentPolling = (trackingNum: string) => {
    setStatusMessage('Prompt sent to phone. Enter your M-Pesa PIN...');
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await orderApi.trackOrder(trackingNum);
        if (res.data.paymentStatus === 'PAID') {
          clearInterval(interval);
          setConfirmedReceipt(res.data.mpesaReceiptNumber);
          setPaymentHandshake(true);
          setLoading(false);
          localStorage.removeItem('jenga_cart');
        } else if (res.data.paymentStatus === 'FAILED' || attempts > 30) {
          clearInterval(interval);
          setLoading(false);
          alert('Payment verification timed out or was cancelled. You can retry.');
        }
      } catch (e) {
        console.error('Polling check failed', e);
      }
    }, 3000);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setLoading(true);
    // Generate UUID idempotency key to prevent double charging on retry
    const idempotencyKey = 'idemp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      deliveryAddress: form.deliveryAddress,
      paymentMethod: form.paymentMethod,
      items: cart.map((c) => ({ productId: c.product.id, quantity: c.quantity })),
    };

    try {
      const res = await orderApi.checkout(payload, idempotencyKey);
      setActiveTrackingNumber(res.data.trackingNumber);

      if (form.paymentMethod === 'MPESA') {
        startPaymentPolling(res.data.trackingNumber);
      } else {
        // Cash on delivery or card mock
        setPaymentHandshake(true);
        setLoading(false);
        localStorage.removeItem('jenga_cart');
      }
    } catch (err: any) {
      setLoading(false);
      alert(err?.response?.data?.message || 'Failed to initialize checkout.');
    }
  };

  if (paymentHandshake) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Successful!</h2>
        <p className="text-sm text-slate-500 mt-1">
          Your order has been officially committed and dispatched to Gikomba fulfillment.
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 my-6 text-left space-y-2 text-xs border border-slate-200">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Tracking Number:</span>
            <span className="font-bold text-slate-900 font-mono">{activeTrackingNumber}</span>
          </div>
          {confirmedReceipt && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">M-Pesa Receipt:</span>
              <span className="font-bold text-emerald-700 font-mono">{confirmedReceipt}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Amount Confirmed:</span>
            <span className="font-bold text-slate-900">KES {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/marketplace')}
          className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/marketplace')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="Mohammad"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Abdullah"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="buyer@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">M-Pesa Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="2547XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Delivery Address</label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Workshop Block 4, Industrial Area, Nairobi"
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {/* M-PESA STK Push */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  form.paymentMethod === 'MPESA'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MPESA"
                    checked={form.paymentMethod === 'MPESA'}
                    onChange={() => setForm({ ...form, paymentMethod: 'MPESA' })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Lipa na M-Pesa (Instant STK Push)</span>
                    <span className="text-[11px] text-slate-500">Prompts PIN directly on your Safaricom phone</span>
                  </div>
                </div>
                <Smartphone className="w-5 h-5 text-emerald-600" />
              </label>

              {/* Visa / Master Card */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  form.paymentMethod === 'CARD'
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={form.paymentMethod === 'CARD'}
                    onChange={() => setForm({ ...form, paymentMethod: 'CARD' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Credit / Debit Card</span>
                    <span className="text-[11px] text-slate-500">Visa, Mastercard, & tokenized cards</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-blue-600" />
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  form.paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-slate-800 bg-slate-50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={form.paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setForm({ ...form, paymentMethod: 'CASH_ON_DELIVERY' })}
                    className="text-slate-800 focus:ring-slate-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Pay on Delivery</span>
                    <span className="text-[11px] text-slate-500">Pay to driver after inspection</span>
                  </div>
                </div>
                <Truck className="w-5 h-5 text-slate-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-slate-900 mb-4">Current Order</h2>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Your cart is empty.</div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">
                        {product.title.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{product.title}</h4>
                        <span className="text-[11px] text-blue-600 font-bold">KES {product.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, -1)}
                        className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3 text-slate-600" />
                      </button>
                      <span className="text-xs font-bold px-1">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, 1)}
                        className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3 text-slate-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Service</span>
                <span className="font-bold text-slate-900">KES {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-100">
                <span>Total Due</span>
                <span className="text-blue-600">KES {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {loading && (
              <div className="my-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-1" />
                <span className="text-[11px] text-blue-800 font-medium">{statusMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full mt-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Pay KES {grandTotal.toLocaleString()}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}