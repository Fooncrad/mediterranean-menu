import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronLeft, Loader2, ShoppingCart, Truck, Utensils, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type OrderType = "reservation" | "takeaway" | "delivery" | "room_service";
type CartMap = Record<string, number>;
type DeliveryZone = "central" | "north" | "east" | "west" | "south" | "outside";

const orderTypes: { value: OrderType; label: string; hint: string; icon: typeof Utensils }[] = [
  { value: "reservation", label: "طلب مع الحجز", hint: "احجز طاولتك واستلم طلبك عند الموعد", icon: Utensils },
  { value: "takeaway", label: "طلب سفري", hint: "استلم طلبك من المطعم", icon: ShoppingCart },
  { value: "delivery", label: "طلب توصيل", hint: "نوصله إلى عنوانك", icon: Truck },
  { value: "room_service", label: "خدمة الغرف", hint: "لضيوف الفندق", icon: Utensils },
];
const deliveryZones: { value: DeliveryZone; label: string; fee: number }[] = [
  { value: "central", label: "وسط المدينة", fee: 10 },
  { value: "north", label: "المنطقة الشمالية", fee: 15 },
  { value: "east", label: "المنطقة الشرقية", fee: 18 },
  { value: "west", label: "المنطقة الغربية", fee: 18 },
  { value: "south", label: "المنطقة الجنوبية", fee: 20 },
  { value: "outside", label: "خارج نطاق المدينة", fee: 30 },
];

export default function Checkout() {
  const [orderType, setOrderType] = useState<OrderType>("takeaway");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("central");
  const [roomNumber, setRoomNumber] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("20:00");
  const [guestCount, setGuestCount] = useState("2");
  const [submitted, setSubmitted] = useState(false);
  const [cart] = useState<CartMap>(() => { try { return JSON.parse(localStorage.getItem("olive-clay-cart") || "{}"); } catch { return {}; } });
  const menuQuery = trpc.menu.list.useQuery();
  const orderMutation = trpc.orders.create.useMutation({ onSuccess: () => { localStorage.removeItem("olive-clay-cart"); setSubmitted(true); } });
  const items = useMemo(() => (menuQuery.data ?? []).filter((item) => cart[String(item.id)]).map((item) => ({ id: String(item.id), title: item.nameAr, price: item.price, quantity: cart[String(item.id)] })), [menuQuery.data, cart]);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderType === "delivery" ? deliveryZones.find((zone) => zone.value === deliveryZone)?.fee ?? 0 : 0;
  const total = subtotal + deliveryFee;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    orderMutation.mutate({ orderType, customerName, customerPhone: customerPhone || undefined, address: orderType === "delivery" ? address : undefined, deliveryZone: orderType === "delivery" ? deliveryZone : undefined, roomNumber: orderType === "room_service" ? roomNumber : undefined, reservationAt: orderType === "reservation" && reservationDate ? new Date(`${reservationDate}T${reservationTime}:00`) : undefined, guestCount: orderType === "reservation" ? Number(guestCount) : undefined, items, total: subtotal });
  };

  if (submitted) return <div className="checkout-shell" dir="rtl"><div className="checkout-success"><div className="success-icon"><Check size={28} /></div><span className="checkout-kicker">OLIVE & CLAY</span><h1>تم استلام طلبك</h1><p>شكرًا لك. سيقوم فريقنا بمراجعة الطلب والتواصل معك لتأكيد التفاصيل.</p><a className="checkout-primary" href="/">العودة إلى القائمة <ArrowRight size={16} /></a></div></div>;

  return <div className="checkout-shell" dir="rtl"><header className="checkout-header"><a className="checkout-brand" href="/"><span>Olive</span><em>& Clay</em></a><a className="checkout-back" href="/"><ChevronLeft size={16} /> العودة للقائمة</a></header><main className="checkout-main"><div className="checkout-title"><span className="checkout-kicker">ORDER / 01</span><h1>تأكيد الطلب</h1><p>اختر طريقة الاستلام وأكمل بياناتك، وسنجهز طلبك بعناية.</p></div><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><section className="checkout-section"><div className="checkout-section-title"><b>01</b><div><h2>نوع الطلب</h2><small>كيف تفضل استلام طلبك؟</small></div></div><div className="order-type-grid">{orderTypes.map(({ value, label, hint, icon: Icon }) => <button type="button" key={value} className={orderType === value ? "selected" : ""} onClick={() => setOrderType(value)}><Icon size={18} /><strong>{label}</strong><small>{hint}</small></button>)}</div></section><section className="checkout-section"><div className="checkout-section-title"><b>02</b><div><h2>بيانات التواصل</h2><small>نحتاج هذه البيانات لتأكيد الطلب</small></div></div><div className="checkout-fields"><label>الاسم الكامل<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="اكتب اسمك" /></label><label>رقم الجوال<input required value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="05xxxxxxxx" /></label>{orderType === "delivery" && <><label>منطقة التوصيل<select value={deliveryZone} onChange={(event) => setDeliveryZone(event.target.value as DeliveryZone)}>{deliveryZones.map((zone) => <option key={zone.value} value={zone.value}>{zone.label} — {zone.fee} SAR</option>)}</select></label><label className="wide-field">العنوان<input required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="الحي، الشارع، رقم المبنى" /></label></>}{orderType === "room_service" && <label>رقم الغرفة<input required value={roomNumber} onChange={(event) => setRoomNumber(event.target.value)} placeholder="مثال: 204" /></label>}{orderType === "reservation" && <><label>تاريخ الحجز<input required type="date" value={reservationDate} onChange={(event) => setReservationDate(event.target.value)} /></label><label>وقت الحجز<select value={reservationTime} onChange={(event) => setReservationTime(event.target.value)}><option>19:00</option><option>20:00</option><option>21:00</option><option>22:00</option></select></label><label>عدد الضيوف<select value={guestCount} onChange={(event) => setGuestCount(event.target.value)}><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></label></>}</div></section><button className="checkout-primary checkout-submit" type="submit" disabled={orderMutation.isPending || !items.length}>{orderMutation.isPending ? <Loader2 className="spin" size={17} /> : <Check size={17} />} {orderMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}</button>{orderMutation.error && <p className="checkout-error">تعذر إرسال الطلب. حاول مرة أخرى.</p>}</form><aside className="checkout-summary"><div className="summary-top"><span className="checkout-kicker">YOUR ORDER</span><h2>ملخص الطلب</h2></div>{items.length ? <div className="summary-items">{items.map((item) => <div className="summary-item" key={item.id}><div><strong>{item.title}</strong><small>{item.quantity} × {item.price} SAR</small></div><b>{item.quantity * item.price} SAR</b></div>)}</div> : <div className="summary-empty"><X size={20} /><p>السلة فارغة</p><a href="/">اختر أصنافك أولاً</a></div>}<div className="summary-breakdown"><span><small>المجموع الفرعي</small><b>{subtotal} SAR</b></span>{orderType === "delivery" && <span><small>رسوم التوصيل</small><b>{deliveryFee} SAR</b></span>}</div><div className="summary-total"><span>الإجمالي</span><strong>{total} <small>SAR</small></strong></div></aside></div></main></div>;
}
