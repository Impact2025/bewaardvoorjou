"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Euro,
  Clock,
  CheckCircle,
  Usb,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  MapPin,
  Gift,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listAdminOrders,
  getOrderStats,
  updateOrderStatus,
  markUsbBurned,
  exportOrdersCsvUrl,
  type AdminOrder,
  type OrderStats,
} from "@/lib/api/admin-orders";

// ---------------------------------------------------------------------------
// Constanten
// ---------------------------------------------------------------------------

const PACKAGE_LABELS: Record<string, string> = {
  BEGIN: "Het Begin",
  ERFGOED: "De Erfgoed Box",
  VOOR_ALTIJD: "Voor Altijd",
  DIGITAAL: "Digitaal",
};

const ADDON_LABELS: Record<string, string> = {
  GIFT_BOX: "Luxe doos",
  EXTRA_USB: "Extra USB",
  PHOTO_BOOK: "Fotoboek",
  EXTRA_STORAGE: "+5 jaar opslag",
  VIDEO_INTRO: "Video-intro",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: { label: "In afwachting", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  PAID: { label: "Betaald", className: "bg-blue-50 text-blue-700 border-blue-200" },
  FULFILLED: { label: "Verstuurd", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Geannuleerd", className: "bg-slate-100 text-slate-500 border-slate-200" },
  REFUNDED: { label: "Terugbetaald", className: "bg-red-50 text-red-700 border-red-200" },
};

const ALL_STATUSES = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"];
const ALL_PACKAGES = ["BEGIN", "ERFGOED", "VOOR_ALTIJD", "DIGITAAL"];
const PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

// ---------------------------------------------------------------------------
// Detail drawer
// ---------------------------------------------------------------------------

function OrderDrawer({
  order,
  onClose,
  onStatusChange,
  onUsbBurned,
}: {
  order: AdminOrder;
  onClose: () => void;
  onStatusChange: (o: AdminOrder) => void;
  onUsbBurned: (o: AdminOrder) => void;
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [burningUsb, setBurningUsb] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  async function handleStatus(s: AdminOrder["status"]) {
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      const updated = await updateOrderStatus(order.id, s);
      onStatusChange(updated);
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Fout");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleUsb() {
    if (!confirm("USB-stick als gebrand markeren?")) return;
    setBurningUsb(true);
    try {
      const updated = await markUsbBurned(order.id);
      onUsbBurned(updated);
    } finally {
      setBurningUsb(false);
    }
  }

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const hasUsb =
    order.addons.includes("EXTRA_USB") ||
    ["BEGIN", "ERFGOED", "VOOR_ALTIJD"].includes(order.package_type);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Bestelling</p>
            <h2 className="font-bold text-slate-900 font-mono text-lg">#{shortId(order.id)}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Klantinfo */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Klant</h3>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-slate-900">{order.buyer_name ?? "—"}</p>
              <p className="text-slate-600">{order.buyer_email ?? order.guest_email ?? "—"}</p>
              {order.user_id ? (
                <span className="inline-block text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5">Ingelogd</span>
              ) : (
                <span className="inline-block text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded px-2 py-0.5">Gast</span>
              )}
            </div>
          </section>

          {/* Pakket & add-ons */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Bestelling</h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{PACKAGE_LABELS[order.package_type] ?? order.package_type}</span>
                </span>
                <span className="font-semibold">{fmt(order.price_paid - order.addons_price + order.discount_cents)}</span>
              </div>

              {order.addons.length > 0 && order.addons.map((a) => (
                <div key={a} className="flex items-center justify-between text-slate-600">
                  <span className="pl-6">+ {ADDON_LABELS[a] ?? a}</span>
                </div>
              ))}

              {order.discount_cents > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-medium border-t border-slate-200 pt-2">
                  <span>Korting {order.promo_code_used ? `(${order.promo_code_used})` : ""}</span>
                  <span>- {fmt(order.discount_cents)}</span>
                </div>
              )}

              <div className="flex items-center justify-between font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Totaal betaald</span>
                <span>{fmt(order.price_paid)}</span>
              </div>
            </div>
          </section>

          {/* Betaalinfo */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Betaling</h3>
            <div className="space-y-1.5 text-sm">
              {order.stripe_payment_intent_id ? (
                <p className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <span className="font-mono text-xs text-slate-600">{order.stripe_payment_intent_id}</span>
                </p>
              ) : (
                <p className="text-slate-400 text-sm italic">Gratis order (geen Stripe)</p>
              )}
              {order.stripe_payment_method && (
                <p className="text-slate-600 capitalize">{order.stripe_payment_method}</p>
              )}
              <p className="text-slate-500 text-xs">Aangemaakt: {fmtDate(order.created_at)}</p>
              {order.paid_at && (
                <p className="text-slate-500 text-xs">Betaald: {fmtDate(order.paid_at)}</p>
              )}
            </div>
          </section>

          {/* Cadeau info */}
          {(order.recipient_name || order.recipient_email || order.gift_card_code) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Gift className="h-4 w-4" /> Cadeau
              </h3>
              <div className="space-y-1.5 text-sm bg-amber-50 rounded-lg p-4">
                {order.recipient_name && (
                  <p><span className="text-slate-500">Voor:</span> <span className="font-medium">{order.recipient_name}</span></p>
                )}
                {order.recipient_email && (
                  <p><span className="text-slate-500">Email:</span> <span className="text-slate-700">{order.recipient_email}</span></p>
                )}
                {order.gift_card_code && (
                  <p><span className="text-slate-500">Code:</span> <span className="font-mono font-bold text-amber-800">{order.gift_card_code}</span></p>
                )}
                {order.personal_message && (
                  <p className="text-slate-600 italic border-t border-amber-200 pt-2 mt-2">"{order.personal_message}"</p>
                )}
              </div>
            </section>
          )}

          {/* Verzendadres */}
          {order.shipping_address && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Verzendadres
              </h3>
              <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-4 space-y-0.5">
                <p className="font-medium">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.street} {order.shipping_address.house_number}</p>
                <p>{order.shipping_address.postal_code} {order.shipping_address.city}</p>
                <p className="text-slate-400">{order.shipping_address.country}</p>
              </div>
            </section>
          )}

          {/* USB tracking */}
          {hasUsb && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Usb className="h-4 w-4" /> USB-stick
              </h3>
              {order.usb_burned_at ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
                  <p className="text-emerald-700 font-medium">Gebrand op {fmtDate(order.usb_burned_at)}</p>
                  {order.usb_burned_by && (
                    <p className="text-emerald-600 text-xs mt-0.5">door {order.usb_burned_by}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
                    USB nog niet gebrand
                  </p>
                  <Button
                    variant="secondary"
                    onClick={handleUsb}
                    disabled={burningUsb}
                    className="gap-2"
                  >
                    <Usb className="h-4 w-4" />
                    {burningUsb ? "Markeren..." : "Markeer als gebrand"}
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Verstuurd op */}
          {order.fulfilled_at && (
            <section>
              <p className="text-sm text-slate-500">
                <CheckCircle className="h-4 w-4 inline mr-1 text-emerald-500" />
                Verstuurd op {fmtDate(order.fulfilled_at)}
              </p>
            </section>
          )}
        </div>

        {/* Status acties */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Status wijzigen</p>
          {statusError && (
            <p className="text-red-600 text-xs mb-2">{statusError}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.filter((s) => s !== order.status).map((s) => {
              const c = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => handleStatus(s as AdminOrder["status"])}
                  disabled={updatingStatus}
                  className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors hover:opacity-80 ${c.className}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Hoofdpagina
// ---------------------------------------------------------------------------

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPackage, setFilterPackage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, s] = await Promise.all([
        listAdminOrders({
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
          search: search || undefined,
          status: filterStatus || undefined,
          package_type: filterPackage || undefined,
        }),
        getOrderStats(),
      ]);
      setOrders(result.orders);
      setTotal(result.total);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Laden mislukt");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterPackage]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce zoeken → reset naar pagina 0
  useEffect(() => {
    setPage(0);
  }, [search, filterStatus, filterPackage]);

  function handleOrderUpdate(updated: AdminOrder) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOrder(updated);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bestellingen</h1>
          <p className="text-slate-600 mt-1">Overzicht van alle orders, betalingen en verzendingen</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={load}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Vernieuwen
          </Button>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => {
              const url = exportOrdersCsvUrl(filterStatus || undefined);
              const token = (() => {
                try { return JSON.parse(localStorage.getItem("life-journey.auth") || "{}").token ?? null; } catch { return null; }
              })();
              fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                .then((r) => r.blob())
                .then((blob) => {
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `bestellingen_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                });
            }}
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total_orders}</p>
                  <p className="text-xs text-slate-500">Totaal orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Euro className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{fmt(stats.total_revenue_cents)}</p>
                  <p className="text-xs text-slate-500">Totale omzet</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.paid_orders}</p>
                  <p className="text-xs text-slate-500">Betaald</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.pending_fulfillment > 0 ? "border-amber-200 bg-amber-50/30" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.pending_fulfillment}</p>
                  <p className="text-xs text-slate-500">Te verwerken</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.usb_needed > 0 ? "border-orange-200 bg-orange-50/30" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Usb className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.usb_needed}</p>
                  <p className="text-xs text-slate-500">USB te branden</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Zoek op email, naam, order-ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#d4af37] bg-white"
            >
              <option value="">Alle statussen</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <select
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#d4af37] bg-white"
            >
              <option value="">Alle pakketten</option>
              {ALL_PACKAGES.map((p) => (
                <option key={p} value={p}>{PACKAGE_LABELS[p]}</option>
              ))}
            </select>
            {(search || filterStatus || filterPackage) && (
              <Button
                variant="ghost"
                onClick={() => { setSearch(""); setFilterStatus(""); setFilterPackage(""); }}
                className="gap-1 text-slate-500 text-sm px-3 py-1.5"
              >
                <X className="h-3 w-3" /> Wis filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {total} bestelling{total !== 1 ? "en" : ""}
            </span>
            {totalPages > 1 && (
              <span className="text-sm font-normal text-slate-500">
                Pagina {page + 1} van {totalPages}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Laden...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-600 text-sm">{error}</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">Geen bestellingen gevonden</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Order</th>
                    <th className="pb-3 pr-4 font-medium">Datum</th>
                    <th className="pb-3 pr-4 font-medium">Klant</th>
                    <th className="pb-3 pr-4 font-medium">Pakket</th>
                    <th className="pb-3 pr-4 font-medium">Bedrag</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Extras</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                    const hasUsb =
                      order.addons.includes("EXTRA_USB") ||
                      ["BEGIN", "ERFGOED", "VOOR_ALTIJD"].includes(order.package_type);
                    const usbDone = !!order.usb_burned_at;

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="py-3 pr-4">
                          <span className="font-mono text-xs font-bold text-slate-700">
                            #{shortId(order.id)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString("nl-NL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="max-w-[180px]">
                            {order.buyer_name && (
                              <p className="font-medium text-slate-800 truncate">{order.buyer_name}</p>
                            )}
                            <p className="text-slate-500 text-xs truncate">
                              {order.buyer_email ?? order.guest_email ?? "—"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium text-slate-800">
                              {PACKAGE_LABELS[order.package_type] ?? order.package_type}
                            </p>
                            {order.addons.length > 0 && (
                              <p className="text-xs text-slate-400">
                                +{order.addons.length} add-on{order.addons.length > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-semibold text-slate-900">
                          {fmt(order.price_paid)}
                          {order.discount_cents > 0 && (
                            <p className="text-xs text-emerald-600 font-normal">
                              -{fmt(order.discount_cents)} korting
                            </p>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {order.recipient_name && (
                              <span title={`Cadeau voor ${order.recipient_name}`}>
                                <Gift className="h-4 w-4 text-amber-500" />
                              </span>
                            )}
                            {order.shipping_address && (
                              <span title="Heeft verzendadres">
                                <MapPin className="h-4 w-4 text-slate-400" />
                              </span>
                            )}
                            {hasUsb && (
                              <span title={usbDone ? "USB gebrand" : "USB nog te branden"}>
                                <Usb className={`h-4 w-4 ${usbDone ? "text-emerald-500" : "text-orange-400"}`} />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginering */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="gap-1 text-sm px-3 py-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Vorige
              </Button>
              <span className="text-sm text-slate-500">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} van {total}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="gap-1 text-sm px-3 py-1.5"
              >
                Volgende
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail drawer */}
      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleOrderUpdate}
          onUsbBurned={handleOrderUpdate}
        />
      )}
    </div>
  );
}

