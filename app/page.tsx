'use client';

import { useState, useEffect } from 'react';

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || '';

const LOGO_IMG = 'iVBORw0KGgoAAAANSUhEUgAAAj8AAAK5CAYAAABQRU/yAAEAAElEQVR4nOx9d5wcxfH9696ZDZd';
const KIMCHI_IMG = '/9j/4AAQSkZJRgABAQAAkACQAAD/4QECRXhpZgAATU0AKgAAAAgABwEOAAIAAAALAAAAYgESA';

const PRICES = {
  cabbage_large: 245,
  cabbage_small: 150,
  radish_large: 245,
  radish_small: 150,
};

const PRODUCT_LABELS = {
  cabbage_large: '辣⽩菜 ⼤罐',
  cabbage_small: '辣⽩菜 ⼩罐',
  radish_large: '辣蘿蔔 ⼤罐',
  radish_small: '辣蘿蔔 ⼩罐',
};

interface Qty {
  cabbage_large: number;
  cabbage_small: number;
  radish_large: number;
  radish_small: number;
}

interface Form {
  name: string;
  phone: string;
  address: string;
  note: string;
}

function useLiff() {
  const [liffReady, setLiffReady] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.liff) {
      initLiff();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
    script.onload = initLiff as any;
    document.head.appendChild(script);

    async function initLiff() {
      try {
        if (!LIFF_ID) {
          console.warn('LIFF_ID not configured');
          return;
        }
        await (window as any).liff.init({ liffId: LIFF_ID });
        setLiffReady(true);
        setIsInClient((window as any).liff.isInClient());
        if ((window as any).liff.isLoggedIn()) {
          const p = await (window as any).liff.getProfile();
          setProfile(p);
        }
      } catch (e) {
        console.warn('LIFF init failed:', e);
        setLiffReady(false);
      }
    }
  }, []);

  return { liffReady, isInClient, profile };
}

function getShipping(largeCans: number, subtotal: number) {
  if (subtotal >= 2000) return { fee: 0, note: '單筆滿 $2000 免運' };
  if (largeCans > 12) return { fee: null, note: '12 罐以上請私訊討論' };
  if (largeCans >= 9) return { fee: 0, note: '9–12 ⼤罐免運' };
  if (largeCans === 4) return { fee: 90, note: '4 ⼤罐運費 $90' };
  if (largeCans >= 5) return { fee: 225, note: '5–8 ⼤罐運費 $225' };
  if (largeCans >= 1) return { fee: 160, note: '1–3 ⼤罐運費 $160' };
  return { fee: 0, note: '無需運費' };
}

const GROUP_GIFTS = [
  { id: 'gift', label: '贈送⼀⼩罐泡菜', value: 'gift' },
  { id: 'discount', label: '折扣 $100', value: 'discount' },
  { id: 'shipping', label: '下次免運⼀次', value: 'shipping' },
];

function SectionLabel({ children, color, ink }: { children: React.ReactNode; color: string; ink: string }) {
  return (
    <div
      style={{
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: 2.5,
        color: ink,
        marginBottom: 8,
        paddingLeft: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
      }}
    >
      <span style={{ width: 3, height: 13, background: color, borderRadius: 2, display: 'inline-block' }} />
      {children}
    </div>
  );
}

function MiniRow({ label, value, color, bold }: { label: string; value: string; color: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
      <span style={{ color: '#8c6040' }}>{label}</span>
      <span style={{ color: color || '#4a2c18', fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}

function btnStyle(c: any, isPlus: boolean) {
  return {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: `1.5px solid ${isPlus ? c.brick : 'rgba(184,92,56,0.3)'}`,
    background: isPlus ? c.brick : 'transparent',
    color: isPlus ? '#fff' : c.inkLight,
    fontSize: 17,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    fontWeight: 700,
    transition: 'all 0.15s',
    boxShadow: isPlus ? '0 2px 8px rgba(184,92,56,0.25)' : 'none',
    flexShrink: 0,
  };
}

export default function KimchiCalculator() {
  const { liffReady, isInClient, profile } = useLiff();
  const [qty, setQty] = useState<Qty>({
    cabbage_large: 0,
    cabbage_small: 0,
    radish_large: 0,
    radish_small: 0,
  });
  const [groupGift, setGroupGift] = useState<string | null>(null);
  const [useNextFreeShipping, setUseNextFreeShipping] = useState(false);
  const [form, setForm] = useState<Form>({
    name: '',
    phone: '',
    address: '',
    note: '',
  });
  const [copied, setCopied] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [sent, setSent] = useState(false);

  const totalCans = Object.values(qty).reduce((a, b) => a + b, 0);
  const largeCans = qty.cabbage_large + qty.radish_large;
  const isGroupBuy = totalCans >= 6;
  const subtotal = Object.entries(qty).reduce((sum, [key, q]) => sum + q * PRICES[key as keyof typeof PRICES], 0);
  const { fee: shippingFee, note: shippingNote } = getShipping(largeCans, subtotal);

  let discount = 0;
  let giftNote = '';

  if (isGroupBuy && groupGift === 'discount') discount = 100;
  if (isGroupBuy && groupGift === 'gift') giftNote = '＋贈⼀⼩罐泡菜';
  if (isGroupBuy && groupGift === 'shipping') giftNote = '下次訂購享免運';

  const effectiveShipping =
    useNextFreeShipping && groupGift === 'shipping' && shippingFee
      ? 0
      : shippingFee;

  const total =
    shippingFee === null ? null : subtotal - discount + (effectiveShipping ?? 0);

  const change = (key: keyof Qty, delta: number) =>
    setQty((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));

  const handleInput = (key: keyof Qty, raw: string) => {
    const val = parseInt(raw, 10);
    setQty((prev) => ({
      ...prev,
      [key]: isNaN(val) || val < 0 ? 0 : val,
    }));
  };

  const generateOrder = () => {
    const lines = ['【優波韓式泡菜訂單】', ''];
    Object.entries(qty)
      .filter(([, q]) => q > 0)
      .forEach(([key, q]) => {
        lines.push(
          `${PRODUCT_LABELS[key as keyof typeof PRODUCT_LABELS]} × ${q} NT$${q * PRICES[key as keyof typeof PRICES]}`
        );
      });
    lines.push('');
    lines.push(`⼩計 NT$${subtotal}`);
    if (effectiveShipping === 0 && shippingFee !== null) {
      lines.push(`運費 免運`);
    } else if (shippingFee === null) {
      lines.push(`運費 待議`);
    } else {
      lines.push(`運費 NT$${effectiveShipping}`);
    }
    if (discount > 0) lines.push(`團購折扣 －NT$${discount}`);
    if (giftNote) lines.push(`團購贈品 ${giftNote}`);
    lines.push(`總⾦額 NT$${total === null ? '待議' : total.toLocaleString()}`);
    lines.push('');
    lines.push(`收件⼈：${form.name}`);
    lines.push(`電話：${form.phone}`);
    lines.push(`地址：${form.address}`);
    if (form.note) lines.push(`備註：${form.note}`);
    lines.push('');
    lines.push('以上⾦額僅供試算，實際以訂單確認為準');
    return lines.join('\n');
  };

  const handleSend = async () => {
    const text = generateOrder();
    setShowOrder(true);

    if (liffReady && isInClient) {
      try {
        await (window as any).liff.sendMessages([{ type: 'text', text }]);
        setSent(true);
        setTimeout(() => setSent(false), 3000);
        return;
      } catch (e) {
        console.warn('sendMessages failed, falling back to clipboard:', e);
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard failed:', e);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateOrder());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  useEffect(() => {
    if (profile?.displayName && !form.name) {
      setForm((prev) => ({ ...prev, name: profile.displayName }));
    }
  }, [profile]);

  const c = {
    bg: '#f5ede3',
    bgDeep: '#ecddd0',
    paper: '#fdf7f1',
    brick: '#b85c38',
    brickLight: '#d4784f',
    earth: '#7a3e1e',
    ink: '#1e120a',
    inkMid: '#4a2c18',
    inkLight: '#8c6040',
    gold: '#c4862a',
    green: '#4a7c59',
    greenLight: '#d4ead9',
  };

  const cardStyle = {
    background: c.paper,
    borderRadius: 14,
    padding: '18px 18px',
    marginBottom: 12,
    border: `1px solid rgba(184,92,56,0.15)`,
    boxShadow: '0 2px 12px rgba(120,60,30,0.07)',
  };

  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('noto-serif-kr')) {
      const link = document.createElement('link');
      link.id = 'noto-serif-kr';
      link.rel = 'stylesheet';
      link.href =
        "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Noto+Serif+TC:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at 20% 10%, rgba(196,134,42,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(184,92,56,0.07) 0%, transparent 50%),
          ${c.bg}
        `,
        fontFamily: "'Noto Serif TC', 'Noto Serif KR', serif",
        color: c.ink,
        padding: '0 0 64px',
      }}
    >
      {/* Top stripe */}
      <div
        style={{
          height: 5,
          background: `linear-gradient(90deg, ${c.brick}, ${c.brickLight})`,
        }}
      />

      {/* Hero Header */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        <img
          src={`data:image/jpeg;base64,${KIMCHI_IMG}`}
          alt="韓式泡菜"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(122,62,30,0.6) 0%, rgba(184,92,56,0.5) 100%)',
          }}
        />
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
          <img
            src={`data:image/png;base64,${LOGO_IMG}`}
            alt="優波韓式泡菜 Logo"
            style={{
              width: 90,
              height: 90,
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              color: '#fdf0e0',
              textShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span style={{ letterSpacing: 3 }}>優波</span>
            <span
              style={{
                color: 'rgba(253,200,150,0.7)',
                margin: '0 6px',
                fontWeight: 300,
              }}
            >
              ·
            </span>
            <span
              style={{
                fontFamily: "'Noto Serif KR', serif",
                letterSpacing: 1,
                fontSize: 20,
              }}
            >
              <span style={{ letterSpacing: 3, marginLeft: 4 }}>泡菜</span>
            </span>
          </div>
          <div
            style={{
              marginTop: 7,
              fontSize: 11,
              letterSpacing: 4,
              color: 'rgba(253,220,180,0.85)',
            }}
          >
            ⿊貓冷藏宅配・團購優惠試算
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${c.brick}, transparent)`,
        }}
      />

      <div style={{ maxWidth: 460, margin: '0 auto', padding: '0 16px' }}>
        {/* Products */}
        <section style={{ marginTop: 24 }}>
          <SectionLabel color={c.brick} ink={c.inkLight}>
            選購品項
          </SectionLabel>
          {Object.entries(PRODUCT_LABELS).map(([key, label]) => (
            <div
              key={key}
              style={{
                ...cardStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border:
                  qty[key as keyof Qty] > 0
                    ? `1.5px solid ${c.brick}`
                    : `1px solid rgba(184,92,56,0.1)`,
                transition: 'border-color 0.2s',
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.ink }}>
                  {label}
                </div>
                <div style={{ fontSize: 12, color: c.inkLight, marginTop: 3 }}>
                  NT$ {PRICES[key as keyof typeof PRICES]}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => change(key as keyof Qty, -1)}
                  style={btnStyle(c, false)}
                >
                  －
                </button>
                <input
                  type="number"
                  min="0"
                  value={qty[key as keyof Qty]}
                  onChange={(e) =>
                    handleInput(key as keyof Qty, e.target.value)
                  }
                  style={{
                    width: 48,
                    height: 34,
                    textAlign: 'center',
                    fontSize: 18,
                    fontWeight: 800,
                    color:
                      qty[key as keyof Qty] > 0 ? c.brick : c.inkLight,
                    background:
                      qty[key as keyof Qty] > 0
                        ? 'rgba(184,92,56,0.07)'
                        : 'transparent',
                    border: `1.5px solid ${
                      qty[key as keyof Qty] > 0
                        ? c.brick
                        : 'rgba(184,92,56,0.25)'
                    }`,
                    borderRadius: 8,
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    MozAppearance: 'textfield',
                  } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={() => change(key as keyof Qty, 1)}
                  style={btnStyle(c, true)}
                >
                  ＋
                </button>
              </div>
            </div>
          ))}
          <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
        </section>

        {/* Shipping reference */}
        <section style={{ marginTop: 20 }}>
          <SectionLabel color={c.brick} ink={c.inkLight}>
            運費說明 ⿊貓冷藏宅配
          </SectionLabel>
          <div style={{ ...cardStyle, padding: '14px 16px' }}>
            {[
              ['1–3 ⼤罐', '$160', false],
              ['4 ⼤罐', '$90', false],
              ['5–8 ⼤罐', '$225', false],
              ['9–12 ⼤罐', '免運', true],
              ['12 罐以上', '私訊討論', false],
              ['單筆 $2000+', '免運', true],
            ].map(([range, fee, isFree]) => (
              <div
                key={range}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(184,92,56,0.08)',
                  fontSize: 13.5,
                }}
              >
                <span style={{ color: c.inkMid }}>{range}</span>
                <span
                  style={{
                    fontWeight: isFree ? 700 : 400,
                    color: isFree ? c.green : c.inkMid,
                    background: isFree ? c.greenLight : 'transparent',
                    padding: isFree ? '1px 8px' : '0',
                    borderRadius: 20,
                  }}
                >
                  {fee}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Group Buy */}
        <section style={{ marginTop: 20 }}>
          <SectionLabel color={c.brick} ink={c.inkLight}>
            團購優惠（滿 6 罐）
          </SectionLabel>
          <div style={{ ...cardStyle, padding: '14px 16px' }}>
            {GROUP_GIFTS.map((g) => {
              const selected = groupGift === g.value;
              return (
                <label
                  key={g.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 10,
                    marginBottom: 6,
                    cursor: isGroupBuy ? 'pointer' : 'not-allowed',
                    background: selected
                      ? `rgba(184,92,56,0.10)`
                      : 'transparent',
                    border: selected
                      ? `1.5px solid ${c.brick}`
                      : '1.5px solid transparent',
                    opacity: isGroupBuy ? 1 : 0.45,
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `2px solid ${selected ? c.brick : c.inkLight}`,
                      background: selected ? c.brick : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                    }}
                  >
                    {selected && (
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: '#fff',
                        }}
                      />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="group_gift"
                    value={g.value}
                    disabled={!isGroupBuy}
                    checked={selected}
                    onChange={() => setGroupGift(g.value)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: 14, color: c.inkMid }}>
                    {g.label}
                  </span>
                </label>
              );
            })}
            {!isGroupBuy && (
              <div
                style={{
                  fontSize: 12,
                  color: c.brickLight,
                  paddingLeft: 4,
                  marginTop: 4,
                }}
              >
                ＊⽬前 {totalCans} 罐，需滿 6 罐才享團購優惠
              </div>
            )}
          </div>
        </section>

        {/* Use accumulated free shipping */}
        {isGroupBuy && groupGift === 'shipping' && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              ...cardStyle,
              cursor: 'pointer',
              marginTop: 0,
              padding: '13px 16px',
              background: useNextFreeShipping ? c.greenLight : c.paper,
              border: useNextFreeShipping
                ? `1.5px solid ${c.green}`
                : `1px solid rgba(184,92,56,0.15)`,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                border: `2px solid ${useNextFreeShipping ? c.green : c.inkLight}`,
                background: useNextFreeShipping ? c.green : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              {useNextFreeShipping && (
                <span
                  style={{
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
              )}
            </div>
            <input
              type="checkbox"
              checked={useNextFreeShipping}
              onChange={(e) => setUseNextFreeShipping(e.target.checked)}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: 14, color: c.inkMid }}>
              此次使⽤「上次累積的免運」
            </span>
          </label>
        )}

        {/* Summary */}
        <section style={{ marginTop: 20 }}>
          <SectionLabel color={c.brick} ink={c.inkLight}>
            費⽤明細
          </SectionLabel>
          <div style={{ ...cardStyle, padding: '20px 18px 18px' }}>
            {Object.entries(qty)
              .filter(([, q]) => q > 0)
              .map(([key, q]) => (
                <MiniRow
                  key={key}
                  label={`${PRODUCT_LABELS[key as keyof typeof PRODUCT_LABELS]} × ${q}`}
                  value={`$${q * PRICES[key as keyof typeof PRICES]}`}
                  color={c.inkMid}
                />
              ))}
            {totalCans === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  color: c.inkLight,
                  fontSize: 13,
                  padding: '16px 0',
                }}
              >
                尚未選購任何品項
              </div>
            )}
            <div
              style={{
                borderTop: `1px dashed rgba(184,92,56,0.25)`,
                margin: '12px 0',
              }}
            />
            <MiniRow label="⼩計" value={`$${subtotal}`} color={c.inkMid} />
            <MiniRow
              label={`運費（${shippingNote}）`}
              value={
                shippingFee === null
                  ? '待議'
                  : effectiveShipping === 0
                    ? '免運'
                    : `$${effectiveShipping}`
              }
              color={
                effectiveShipping === 0 && shippingFee !== null
                  ? c.green
                  : c.inkMid
              }
              bold={
                effectiveShipping === 0 && shippingFee !== null
              }
            />
            {discount > 0 && (
              <MiniRow
                label="團購折扣"
                value={`－$${discount}`}
                color={c.green}
              />
            )}
            {giftNote && (
              <div
                style={{
                  fontSize: 12.5,
                  color: c.green,
                  textAlign: 'right',
                  marginTop: 4,
                }}
              >
                {giftNote}
              </div>
            )}
            <div
              style={{
                borderTop: `1.5px solid rgba(184,92,56,0.3)`,
                margin: '14px 0 12px',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: c.inkMid,
                  letterSpacing: 1,
                }}
              >
                總⾦額
              </span>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: 11,
                    color: c.inkLight,
                    marginRight: 4,
                  }}
                >
                  NT$
                </span>
                <span
                  style={{
                    fontSize: 34,
                    fontWeight: 900,
                    color:
                      total === null ? c.brickLight : c.brick,
                    letterSpacing: -1,
                  }}
                >
                  {total === null ? '待議' : total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Order Form */}
        {totalCans > 0 && (
          <section style={{ marginTop: 20 }}>
            <SectionLabel color={c.brick} ink={c.inkLight}>
              收件資訊
            </SectionLabel>
            <div style={{ ...cardStyle, padding: '18px 18px 14px' }}>
              {[
                {
                  key: 'name',
                  label: '收件⼈',
                  placeholder: '姓名',
                  type: 'text',
                },
                {
                  key: 'phone',
                  label: '電話',
                  placeholder: '0912-345-678',
                  type: 'tel',
                },
                {
                  key: 'address',
                  label: '地址',
                  placeholder: '縣市、鄉鎮市區、路段⾨號',
                  type: 'text',
                },
                {
                  key: 'note',
                  label: '備註',
                  placeholder: '辣度需求、禮盒包裝…（選填）',
                  type: 'text',
                },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: c.inkLight,
                      marginBottom: 4,
                      letterSpacing: 1,
                    }}
                  >
                    {label}
                  </div>
                  <input
                    type={type}
                    value={form[key as keyof Form]}
                    placeholder={placeholder}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 14,
                      color: c.ink,
                      background: c.bg,
                      border: `1.5px solid ${
                        form[key as keyof Form]
                          ? c.brick
                          : 'rgba(184,92,56,0.2)'
                      }`,
                      borderRadius: 9,
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Generate Order Button */}
        {totalCans > 0 && (
          <section style={{ marginTop: 8, marginBottom: 8 }}>
            <button
              onClick={handleSend}
              style={{
                width: '100%',
                padding: '16px',
                background: sent
                  ? `linear-gradient(135deg, ${c.green}, #5a9c6e)`
                  : `linear-gradient(135deg, ${c.brick}, ${c.brickLight})`,
                color: '#fdf7f1',
                border: 'none',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 2,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: sent
                  ? '0 4px 16px rgba(74,124,89,0.35)'
                  : '0 4px 16px rgba(184,92,56,0.35)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              } as React.CSSProperties}
            >
              {sent
                ? '✓ 已傳送到 LINE！'
                : isInClient
                  ? '傳送訂單到 LINE'
                  : '產⽣訂單訊息'}
            </button>
            {showOrder && (
              <div style={{ marginTop: 12, ...cardStyle, padding: '16px 18px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: c.inkMid,
                      letterSpacing: 1,
                    }}
                  >
                    訂單預覽
                  </span>
                  <button
                    onClick={handleCopy}
                    style={{
                      padding: '5px 14px',
                      background: copied ? c.green : c.brick,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      letterSpacing: 1,
                      transition: 'background 0.2s',
                    }}
                  >
                    {copied ? '✓ 已複製' : '複製'}
                  </button>
                </div>
                <pre
                  style={{
                    fontSize: 13,
                    color: c.inkMid,
                    lineHeight: 1.85,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    margin: 0,
                    fontFamily: 'inherit',
                    background: c.bg,
                    borderRadius: 8,
                    padding: '12px 14px',
                  }}
                >
                  {generateOrder()}
                </pre>
                <div
                  style={{
                    fontSize: 11.5,
                    color: c.inkLight,
                    marginTop: 10,
                    textAlign: 'center',
                  }}
                >
                  {isInClient
                    ? '按下「傳送訂單到 LINE」即可直接送出'
                    : '複製後貼到 LINE 傳給我們即可'}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <div
          style={{
            fontSize: 11,
            color: c.inkLight,
            letterSpacing: 2,
            lineHeight: 1.8,
          }}
        >
          優波韓式泡菜
          <br />
          以上⾦額僅供試算，實際以訂單確認為準
        </div>
        <div
          style={{
            width: 60,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${c.gold}, transparent)`,
            margin: '12px auto',
          }}
        />
      </div>

      {/* Bottom stripe */}
      <div
        style={{
          height: 5,
          background: `linear-gradient(90deg, ${c.brick}, ${c.brickLight})`,
        }}
      />
    </div>
  );
}
