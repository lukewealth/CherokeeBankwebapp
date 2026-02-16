'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth';
import { useWallets } from '@/src/hooks/use-dashboard-data';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Search, Info, ChevronRight,
  CheckCircle2, Loader2, AlertCircle, Globe,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA — currencies, countries, exchange rates, contacts
   ═══════════════════════════════════════════════════════════════ */

interface CurrencyOption {
  code: string;
  name: string;
  flag: string;
  symbol: string;
}

const currencies: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar',       flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro',            flag: '🇪🇺', symbol: '€' },
  { code: 'GBP', name: 'British Pound',   flag: '🇬🇧', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar',  flag: '🇨🇦', symbol: 'C$' },
  { code: 'PKR', name: 'Pakistani Rupee',  flag: '🇵🇰', symbol: '₨' },
  { code: 'CHERO', name: 'Cherokee Coin',  flag: '🪙', symbol: '₵' },
];

const exchangeRates: Record<string, Record<string, number>> = {
  USD:   { EUR: 0.85, GBP: 0.73, CAD: 1.36, PKR: 278.50, CHERO: 12.5, USD: 1 },
  EUR:   { USD: 1.18, GBP: 0.86, CAD: 1.60, PKR: 327.50, CHERO: 14.7, EUR: 1 },
  GBP:   { USD: 1.37, EUR: 1.16, CAD: 1.86, PKR: 380.80, CHERO: 17.1, GBP: 1 },
  CAD:   { USD: 0.74, EUR: 0.63, GBP: 0.54, PKR: 204.90, CHERO: 9.2,  CAD: 1 },
  PKR:   { USD: 0.0036, EUR: 0.0031, GBP: 0.0026, CAD: 0.0049, CHERO: 0.045, PKR: 1 },
  CHERO: { USD: 0.08, EUR: 0.068, GBP: 0.058, CAD: 0.109, PKR: 22.3, CHERO: 1 },
};

interface CountryOption { code: string; name: string; flag: string; }

const countries: CountryOption[] = [
  { code: 'DE', name: 'Germany',        flag: '🇩🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France',         flag: '🇫🇷' },
  { code: 'CN', name: 'China',          flag: '🇨🇳' },
  { code: 'AU', name: 'Australia',      flag: '🇦🇺' },
  { code: 'US', name: 'United States',  flag: '🇺🇸' },
  { code: 'CA', name: 'Canada',         flag: '🇨🇦' },
  { code: 'JP', name: 'Japan',          flag: '🇯🇵' },
  { code: 'IN', name: 'India',          flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil',         flag: '🇧🇷' },
  { code: 'NG', name: 'Nigeria',        flag: '🇳🇬' },
  { code: 'PK', name: 'Pakistan',       flag: '🇵🇰' },
];

interface SavedContact { name: string; location: string; iban: string; swift: string; }

const savedContacts: SavedContact[] = [
  { name: 'John Smith',   location: 'Frankfurt - DE', iban: 'DE12 3456 7890 1234 5678 90',      swift: 'SWIFTXYZ123' },
  { name: 'Jane Doe',     location: 'London - GB',    iban: 'GB29 NWBK 6016 1331 9268 19',      swift: 'NWBKGB2L' },
  { name: 'Alice Martin', location: 'Paris - FR',     iban: 'FR76 3000 6000 0112 3456 7890 189', swift: 'BNPAFRPP' },
];

/* ═══════════════════════════════════════════════
   FEE CALCULATION
   ═══════════════════════════════════════════════ */
const SERVICE_FEE_FLAT = 25;       // $25 premium member rate
const SERVICE_FEE_GOLD = 0.015;    // or 0.015 Gold Ounces

function calcFee(_amount: number, currency: string) {
  const toUsd = exchangeRates[currency]?.USD ?? 1;
  const feeInCurrency = SERVICE_FEE_FLAT / toUsd;
  const sym = currencies.find(c => c.code === currency)?.symbol ?? '';
  return {
    fee: feeInCurrency,
    feeGold: SERVICE_FEE_GOLD,
    feeFormatted: `${sym}${feeInCurrency.toFixed(2)}`,
  };
}

function getEstimatedArrival() {
  return 'Tomorrow, by 12:00 PM CET';
}

/* ═══════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════ */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 26 } },
};

/* ═══════════════════════════════════════════════════════════════
   MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ── Currency Selector Dropdown ── */
function CurrencySelector({
  value,
  onChange,
  className = '',
}: {
  value: string;
  onChange: (code: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = currencies.find(c => c.code === value) ?? currencies[0];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors min-w-30"
      >
        <span className="text-lg">{selected.flag}</span>
        <span className="text-white font-semibold text-sm">{selected.code}</span>
        <ChevronDown className={`w-4 h-4 text-white/40 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 mt-1 w-44 rounded-xl bg-[#0d1a30] border border-white/10 shadow-xl z-50 overflow-hidden"
          >
            {currencies.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/5 transition-colors ${
                  c.code === value ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-white'
                }`}
              >
                <span className="text-lg">{c.flag}</span>
                <span className="text-sm font-medium">{c.code}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Country Selector with Search ── */
function CountrySelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = countries.find(c => c.code === value);

  const filtered = useMemo(
    () => countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/60 mb-2">Country</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 text-left transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {selected ? (
            <>
              <span className="text-lg">{selected.flag}</span>
              <span className="text-white text-sm">{selected.name}</span>
            </>
          ) : (
            <span className="text-white/40 text-sm">Select country</span>
          )}
        </div>
        <Search className="w-4 h-4 text-white/30" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="absolute top-full left-0 mt-1 w-full rounded-xl bg-[#0d1a30] border border-white/10 shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white/5 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/5 transition-colors ${
                    c.code === value ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-white'
                  }`}
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-sm">{c.name}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-white/30 text-xs py-4">No countries found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Recipient Autocomplete Search ── */
function RecipientSearch({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (val: string) => void;
  onSelect: (contact: SavedContact) => void;
}) {
  const [focused, setFocused] = useState(false);
  const matches = useMemo(
    () => savedContacts.filter(c => c.name.toLowerCase().includes(value.toLowerCase())),
    [value],
  );
  const showDropdown = focused && value.length > 0 && matches.length > 0;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/60 mb-2">Recipient Name / Search</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search"
          className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30 transition-colors"
        />
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-full left-0 mt-1 w-full rounded-xl bg-[#0d1a30] border border-white/10 shadow-xl z-50 overflow-hidden"
          >
            {matches.map(c => (
              <button
                key={c.iban}
                type="button"
                onMouseDown={() => onSelect(c)}
                className="w-full flex flex-col px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <span className="text-white text-sm font-medium">{c.name}</span>
                <span className="text-white/40 text-xs">{c.location}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Fee Info Tooltip ── */
function FeeTooltip({ fee, currency }: { fee: string; currency: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="ml-1.5"
      >
        <Info className="w-4 h-4 text-white/40 hover:text-[#D4AF37] transition-colors cursor-help" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-64 px-4 py-3 rounded-xl bg-[#0d1a30] border border-white/10 shadow-xl z-50"
          >
            <p className="text-white text-xs font-medium">
              Fee: {fee} (Premium Member Rate)
            </p>
            <p className="text-white/50 text-xs mt-1">
              or {SERVICE_FEE_GOLD} Gold Ounces
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function SendMoneyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: wallets } = useWallets();

  /* ── Form state ── */
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [amount, setAmount] = useState('10,000.00');
  const [country, setCountry] = useState('DE');
  const [iban, setIban] = useState('');
  const [swift, setSwift] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; reference?: string; error?: string } | null>(null);

  /* ── Derived ── */
  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount.replace(/,/g, ''));
    return isNaN(n) || n <= 0 ? 0 : n;
  }, [amount]);

  const destCurrency = useMemo(() => {
    const map: Record<string, string> = {
      DE: 'EUR', GB: 'GBP', FR: 'EUR', CN: 'USD', AU: 'USD',
      US: 'USD', CA: 'CAD', JP: 'USD', IN: 'USD', BR: 'USD',
      NG: 'USD', PK: 'PKR',
    };
    return map[country] ?? 'USD';
  }, [country]);

  const rate = useMemo(() => exchangeRates[sendCurrency]?.[destCurrency] ?? 1, [sendCurrency, destCurrency]);
  const { fee, feeFormatted } = useMemo(() => calcFee(parsedAmount, sendCurrency), [parsedAmount, sendCurrency]);
  const totalToPay = parsedAmount + fee;
  const convertedTotal = totalToPay * rate;
  const currencySymbol = currencies.find(c => c.code === sendCurrency)?.symbol ?? '$';

  const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ── Submit ── */
  const handleConfirmTransfer = useCallback(async () => {
    if (parsedAmount <= 0 || !iban || !recipientName) return;
    setIsSubmitting(true);
    setResult(null);

    try {
      const sourceWallet = wallets?.find((w: any) => w.currency === sendCurrency);
      if (!sourceWallet) {
        setResult({ success: false, error: `No ${sendCurrency} wallet found. Please create one first.` });
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fromWalletId: (sourceWallet as any).id,
          recipientEmail: iban,
          amount: parsedAmount,
          currency: sendCurrency,
          type: 'TRANSFER',
          description: `Transfer to ${recipientName} (${country}) — IBAN: ${iban} SWIFT: ${swift}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({ success: false, error: data.error?.message || 'Transfer failed' });
      } else {
        setResult({ success: true, reference: data.data?.transaction?.reference });
      }
    } catch (err) {
      setResult({ success: false, error: err instanceof Error ? err.message : 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  }, [parsedAmount, iban, recipientName, wallets, sendCurrency, country, swift]);

  const handleContactSelect = (contact: SavedContact) => {
    setRecipientName(contact.name);
    setIban(contact.iban);
    setSwift(contact.swift);
  };

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <motion.div
      className="max-w-340 mx-auto pb-12"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-7 h-7 text-[#D4AF37]" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Global Transfers &amp; Live Fee Calculator
          </h1>
        </div>
      </motion.div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ═══ LEFT — Send Money Form (3-col) ═══ */}
        <motion.div variants={item} className="lg:col-span-3 space-y-6">
          <h2 className="text-2xl font-bold text-white">Send Money</h2>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Amount</label>
            <div className="flex gap-3">
              <CurrencySelector value={sendCurrency} onChange={setSendCurrency} />
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder="0.00"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-semibold placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30 transition-colors"
              />
            </div>
          </div>

          {/* Country */}
          <CountrySelector value={country} onChange={setCountry} />

          {/* IBAN */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Recipient IBAN / Account Number</label>
            <input
              type="text"
              value={iban}
              onChange={e => setIban(e.target.value)}
              placeholder="DE12 3456 7890 1234 5678 90"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30 transition-colors"
            />
          </div>

          {/* SWIFT */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">SWIFT / BIC Code</label>
            <input
              type="text"
              value={swift}
              onChange={e => setSwift(e.target.value.toUpperCase())}
              placeholder="SWIFTXYZ123"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30 transition-colors"
            />
          </div>

          {/* Recipient search */}
          <RecipientSearch
            value={recipientName}
            onChange={setRecipientName}
            onSelect={handleContactSelect}
          />
        </motion.div>

        {/* ═══ RIGHT — Transfer Summary (2-col) ═══ */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="sticky top-6 rounded-2xl border border-[#D4AF37]/15 bg-linear-to-br from-[#0d1a30] via-[#0a1628] to-[#071020] p-6 sm:p-8 space-y-6 overflow-hidden">
            {/* Background globe */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none">
              <div className="absolute inset-0 bg-[url('/ui/backgrounds/globe-night.jpg')] opacity-[0.06] bg-cover bg-center mix-blend-screen" />
            </div>

            <div className="relative z-10 space-y-5">
              <h3 className="text-2xl font-bold text-white">Transfer Summary</h3>

              {/* Exchange Rate */}
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Exchange Rate</span>
                <span className="text-white text-sm font-medium">
                  1 {sendCurrency} = {rate.toFixed(sendCurrency === destCurrency ? 0 : 2)} {destCurrency}
                </span>
              </div>

              {/* Service Fee */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-white/50 text-sm">Service Fee</span>
                  <FeeTooltip fee={feeFormatted} currency={sendCurrency} />
                </div>
                <span className="text-white text-sm font-medium">{feeFormatted}</span>
              </div>

              {/* Estimated Arrival */}
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Estimated Arrival</span>
                <span className="text-white text-sm font-medium">{getEstimatedArrival()}</span>
              </div>

              <div className="border-t border-white/8" />

              {/* Total to Pay */}
              <div className="flex items-end justify-between">
                <span className="text-white/50 text-sm">Total to Pay</span>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-[#D4AF37]">
                    {fmt(totalToPay)} {sendCurrency}
                  </p>
                  {sendCurrency !== destCurrency && (
                    <p className="text-white/40 text-xs mt-0.5">
                      ≈ {fmt(convertedTotal)} {destCurrency}
                    </p>
                  )}
                </div>
              </div>

              {/* Gold Confirm button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={isSubmitting || parsedAmount <= 0 || !recipientName}
                onClick={handleConfirmTransfer}
                className="w-full py-4 rounded-full font-bold text-lg text-[#061B3A] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #f8e192 50%, #D4AF37 100%)',
                  boxShadow: '0 4px 24px rgba(212,175,55,0.3)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Transfer
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Result feedback */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`flex items-start gap-3 p-4 rounded-xl border ${
                      result.success
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.success ? 'Transfer Submitted!' : 'Transfer Failed'}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {result.success ? `Reference: ${result.reference}` : result.error}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}