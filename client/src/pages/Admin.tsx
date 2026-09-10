import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Check, Edit3, Filter, ImagePlus, LayoutDashboard, PackageCheck, Plus, Save, ShoppingBag, Trash2, UploadCloud, Utensils, X } from "lucide-react";

const emptyForm = {
  category: "mains" as "breakfast" | "mezza" | "mains" | "desserts",
  imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85",
  price: 0, rating: "4.8", isVegan: 0, isPopular: 0, isAvailable: 1,
  nameAr: "", descriptionAr: "", nameEn: "", descriptionEn: "", nameFr: "", descriptionFr: "",
};
type FormState = typeof emptyForm;
type AdminTab = "menu" | "orders" | "reservations";

const labelMap = { breakfast: "فطور", mezza: "مقبلات", mains: "أطباق رئيسية", desserts: "حلويات" };
const orderTypeLabels = { reservation: "مع الحجز", takeaway: "سفري", delivery: "توصيل", room_service: "خدمة الغرف" };
const zoneLabels: Record<string, string> = { central: "وسط المدينة", north: "الشمالية", east: "الشرقية", west: "الغربية", south: "الجنوبية", outside: "خارج المدينة" };
const adminCopy = {
  ar: { title: "لوحة التحكم", desc: "إدارة القائمة والطلبات والحجوزات من مكان واحد.", dishes: "إدارة الأطباق", reservations: "الحجوزات", orders: "الطلبات", published: "الأطباق المنشورة", pending: "الحجوزات المعلقة", account: "حالة الحساب", add: "إضافة طبق", filter: "تصفية حسب التصنيف", all: "كل الأصناف" },
  en: { title: "Admin dashboard", desc: "Manage menu, orders, and reservations in one place.", dishes: "Manage dishes", reservations: "Reservations", orders: "Orders", published: "Published dishes", pending: "Pending reservations", account: "Account status", add: "Add dish", filter: "Filter by category", all: "All dishes" },
  fr: { title: "Tableau de bord", desc: "Gérez le menu, les commandes et les réservations.", dishes: "Gérer les plats", reservations: "Réservations", orders: "Commandes", published: "Plats publiés", pending: "Réservations en attente", account: "Statut du compte", add: "Ajouter un plat", filter: "Filtrer par catégorie", all: "Tous les plats" },
};

export default function Admin() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("menu");
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | FormState["category"]>("all");
  const [adminLocale, setAdminLocale] = useState<"ar" | "en" | "fr">("ar");
  const copy = adminCopy[adminLocale];
  const enabled = !!user && user.role === "admin";
  const menuQuery = trpc.admin.menu.list.useQuery(undefined, { enabled });
  const reservationQuery = trpc.admin.reservations.list.useQuery(undefined, { enabled });
  const orderQuery = trpc.admin.orders.list.useQuery(undefined, { enabled });
  const utils = trpc.useUtils();
  const closeForm = () => { setFormOpen(false); setEditing(null); setForm(emptyForm); };
  const createMutation = trpc.admin.menu.create.useMutation({ onSuccess: () => { utils.admin.menu.list.invalidate(); closeForm(); setMessage("تمت إضافة الطبق بنجاح"); } });
  const updateMutation = trpc.admin.menu.update.useMutation({ onSuccess: () => { utils.admin.menu.list.invalidate(); closeForm(); setMessage("تم حفظ تعديلات الطبق"); } });
  const deleteMutation = trpc.admin.menu.remove.useMutation({ onSuccess: () => { utils.admin.menu.list.invalidate(); setMessage("تم حذف الطبق"); } });
  const uploadMutation = trpc.admin.menu.uploadImage.useMutation({ onSuccess: ({ url }) => { setField("imageUrl", url); setMessage("تم رفع الصورة بنجاح"); }, onError: () => setMessage("تعذّر رفع الصورة. استخدم JPG أو PNG أو WEBP بحجم أقل من 5MB") });
  const reservationStatusMutation = trpc.admin.reservations.updateStatus.useMutation({ onSuccess: () => { utils.admin.reservations.list.invalidate(); setMessage("تم تحديث حالة الحجز"); } });
  const orderStatusMutation = trpc.admin.orders.updateStatus.useMutation({ onSuccess: () => { utils.admin.orders.list.invalidate(); setMessage("تم تحديث حالة الطلب"); } });

  useEffect(() => { if (!message) return; const timer = window.setTimeout(() => setMessage(""), 3200); return () => window.clearTimeout(timer); }, [message]);
  const reservations = reservationQuery.data ?? [];
  const orders = orderQuery.data ?? [];
  const pendingCount = reservations.filter((item) => item.status === "pending").length;
  const newOrdersCount = orders.filter((item) => item.status === "new").length;
  const filteredMenuItems = useMemo(() => (menuQuery.data ?? []).filter((item) => categoryFilter === "all" || item.category === categoryFilter), [menuQuery.data, categoryFilter]);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setFormOpen(true); };
  const openEdit = (item: NonNullable<typeof menuQuery.data>[number]) => {
    setForm({ category: item.category, imageUrl: item.imageUrl, price: item.price, rating: item.rating, isVegan: item.isVegan, isPopular: item.isPopular, isAvailable: item.isAvailable, nameAr: item.nameAr, descriptionAr: item.descriptionAr, nameEn: item.nameEn, descriptionEn: item.descriptionEn, nameFr: item.nameFr, descriptionFr: item.descriptionFr });
    setEditing(item.id); setFormOpen(true);
  };
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submitForm = (event: React.FormEvent) => { event.preventDefault(); if (editing) updateMutation.mutate({ id: editing, data: form }); else createMutation.mutate(form); };
  const uploadImage = async (file?: File) => {
    if (!file) return;
    if (!( ["image/jpeg", "image/png", "image/webp"] as string[]).includes(file.type) || file.size > 5 * 1024 * 1024) return setMessage("اختر صورة JPG أو PNG أو WEBP بحجم أقل من 5MB");
    const bytes = new Uint8Array(await file.arrayBuffer()); let binary = "";
    for (let index = 0; index < bytes.length; index += 8192) {
      const chunk = bytes.subarray(index, index + 8192);
      for (let offset = 0; offset < chunk.length; offset += 1) binary += String.fromCharCode(chunk[offset]);
    }
    uploadMutation.mutate({ fileName: file.name, contentType: file.type as "image/jpeg" | "image/png" | "image/webp", base64: btoa(binary) });
  };

  if (loading) return <div className="admin-loading">جاري التحقق من صلاحيات الأدمن...</div>;
  if (!user) return <div className="admin-auth-wall"><div className="admin-auth-card"><div className="admin-brand-mark"><Utensils size={21} /></div><span className="admin-kicker">Olive & Clay</span><h1>لوحة الإدارة</h1><p>سجّل الدخول للوصول إلى إدارة القائمة والطلبات والحجوزات.</p><button className="admin-primary" onClick={() => startLogin()}>تسجيل الدخول</button></div></div>;
  if (user.role !== "admin") return <div className="admin-auth-wall"><div className="admin-auth-card"><div className="admin-brand-mark"><X size={21} /></div><span className="admin-kicker">Access denied</span><h1>لا تملك صلاحية الأدمن</h1><p>هذا الحساب مسجل كحساب مستخدم عادي.</p><a className="admin-secondary" href="/">العودة إلى الموقع</a></div></div>;

  return <DashboardLayout><div className="admin-page" dir={adminLocale === "ar" ? "rtl" : "ltr"} lang={adminLocale}>
    <header className="admin-header"><div><span className="admin-kicker">OLIVE & CLAY / ADMIN</span><h1>{copy.title}</h1><p>{copy.desc}</p></div><div className="admin-header-actions"><label className="admin-language-picker">{adminLocale === "ar" ? "اللغة" : "Language"}<select value={adminLocale} onChange={(event) => setAdminLocale(event.target.value as "ar" | "en" | "fr")}><option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option></select></label><a className="admin-view-site" href="/">عرض الموقع <LayoutDashboard size={16} /></a></div></header>
    <section className="admin-stats"><div className="admin-stat"><span>{copy.published}</span><strong>{menuQuery.data?.filter((item) => item.isAvailable).length ?? 0}</strong><small>من القائمة الحالية</small></div><div className="admin-stat"><span>الطلبات الجديدة</span><strong>{newOrdersCount}</strong><small>بانتظار بدء التجهيز</small></div><div className="admin-stat"><span>{copy.pending}</span><strong>{pendingCount}</strong><small>بانتظار المراجعة</small></div></section>
    <div className="admin-tabs"><button className={activeTab === "menu" ? "active" : ""} onClick={() => setActiveTab("menu")}><Utensils size={16} /> {copy.dishes}</button><button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}><ShoppingBag size={16} /> {copy.orders}{newOrdersCount > 0 && <b>{newOrdersCount}</b>}</button><button className={activeTab === "reservations" ? "active" : ""} onClick={() => setActiveTab("reservations")}><LayoutDashboard size={16} /> {copy.reservations}{pendingCount > 0 && <b>{pendingCount}</b>}</button></div>

    {activeTab === "menu" && <section className="admin-panel"><div className="panel-heading"><div><span className="admin-kicker">MENU CONTENT</span><h2>الأطباق</h2></div><button className="admin-primary compact" onClick={openCreate}><Plus size={16} /> {copy.add}</button></div><div className="admin-filter-bar"><span><Filter size={15} /> {copy.filter}</span><div>{(["all", "breakfast", "mezza", "mains", "desserts"] as const).map((category) => <button key={category} className={categoryFilter === category ? "active" : ""} onClick={() => setCategoryFilter(category)}>{category === "all" ? copy.all : labelMap[category]}</button>)}</div><small>{filteredMenuItems.length} طبق</small></div>{menuQuery.isLoading ? <div className="admin-empty">جاري التحميل...</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>الطبق</th><th>القسم</th><th>السعر</th><th>الحالة</th><th /></tr></thead><tbody>{filteredMenuItems.map((item) => <tr key={item.id}><td><div className="table-item"><img src={item.imageUrl} alt="" /><span><strong>{item.nameAr}</strong><small>{item.nameEn}</small></span></div></td><td><span className="category-chip">{labelMap[item.category]}</span></td><td>{item.price} SAR</td><td><span className={`availability ${item.isAvailable ? "on" : "off"}`}>{item.isAvailable ? "ظاهر" : "مخفي"}</span></td><td><div className="row-actions"><button onClick={() => openEdit(item)}><Edit3 size={16} /></button><button onClick={() => window.confirm("هل تريد حذف هذا الطبق؟") && deleteMutation.mutate({ id: item.id })}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}</section>}

    {activeTab === "orders" && <section className="admin-panel"><div className="panel-heading"><div><span className="admin-kicker">INCOMING ORDERS</span><h2>الطلبات الواردة</h2></div><span className="panel-meta">{orders.length} طلب</span></div>{orderQuery.isLoading ? <div className="admin-empty">جاري تحميل الطلبات...</div> : orders.length ? <div className="admin-table-wrap"><table className="admin-table orders-table"><thead><tr><th>الطلب</th><th>العميل</th><th>النوع</th><th>التفاصيل</th><th>الإجمالي</th><th>الحالة</th></tr></thead><tbody>{orders.map((order) => { let lines: Array<{ title: string; quantity: number }> = []; try { lines = JSON.parse(order.itemsJson); } catch { lines = []; } return <tr key={order.id}><td><strong>#{order.id}</strong><small className="table-sub">{new Date(order.createdAt).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" })}</small></td><td><strong>{order.customerName}</strong><small className="table-sub">{order.customerPhone || "—"}</small></td><td><span className="category-chip">{orderTypeLabels[order.orderType]}</span>{order.deliveryZone && <small className="table-sub">{zoneLabels[order.deliveryZone] || order.deliveryZone} · {order.deliveryFee} SAR</small>}</td><td><div className="order-lines">{lines.slice(0, 3).map((line, index) => <small key={`${line.title}-${index}`}>{line.quantity}× {line.title}</small>)}{lines.length > 3 && <small>+{lines.length - 3} أصناف</small>}</div></td><td><strong>{order.total} SAR</strong></td><td><select className={`status-select ${order.status}`} value={order.status} onChange={(event) => orderStatusMutation.mutate({ id: order.id, status: event.target.value as "new" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled" })}><option value="new">جديد</option><option value="confirmed">مؤكد</option><option value="preparing">قيد التجهيز</option><option value="ready">جاهز</option><option value="delivered">مكتمل</option><option value="cancelled">ملغي</option></select></td></tr>; })}</tbody></table></div> : <div className="admin-empty"><PackageCheck size={30} /><p>لا توجد طلبات واردة حتى الآن.</p></div>}</section>}

    {activeTab === "reservations" && <section className="admin-panel"><div className="panel-heading"><div><span className="admin-kicker">RESERVATIONS</span><h2>{copy.reservations}</h2></div><span className="panel-meta">{reservations.length} إجمالي الحجوزات</span></div>{reservationQuery.isLoading ? <div className="admin-empty">جاري تحميل الحجوزات...</div> : reservations.length ? <div className="admin-table-wrap"><table className="admin-table reservations-table"><thead><tr><th>الضيف</th><th>التاريخ والوقت</th><th>الضيوف</th><th>الحالة</th><th /></tr></thead><tbody>{reservations.map((item) => <tr key={item.id}><td><strong>{item.guestName}</strong><small className="table-sub">طلب رقم #{item.id}</small></td><td>{new Date(item.reservationAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}</td><td>{item.guestCount}</td><td><select className={`status-select ${item.status}`} value={item.status} onChange={(event) => reservationStatusMutation.mutate({ id: item.id, status: event.target.value as "pending" | "confirmed" | "cancelled" })}><option value="pending">معلق</option><option value="confirmed">مؤكد</option><option value="cancelled">ملغي</option></select></td><td><Check className={item.status === "confirmed" ? "status-check visible" : "status-check"} size={17} /></td></tr>)}</tbody></table></div> : <div className="admin-empty"><LayoutDashboard size={28} /><p>لا توجد حجوزات حتى الآن.</p></div>}</section>}

    {formOpen && <div className="admin-modal-backdrop" onClick={closeForm}><form className="admin-form-modal" onSubmit={submitForm} onClick={(event) => event.stopPropagation()}><button type="button" className="admin-modal-close" onClick={closeForm}><X size={18} /></button><span className="admin-kicker">{editing ? "EDIT DISH" : "NEW DISH"}</span><h2>{editing ? "تعديل الطبق" : "إضافة طبق جديد"}</h2><div className="admin-form-grid"><label>اسم الطبق بالعربية<input required value={form.nameAr} onChange={(event) => setField("nameAr", event.target.value)} /></label><label>القسم<select value={form.category} onChange={(event) => setField("category", event.target.value as FormState["category"])}><option value="breakfast">فطور</option><option value="mezza">مقبلات</option><option value="mains">أطباق رئيسية</option><option value="desserts">حلويات</option></select></label><label>English name<input required value={form.nameEn} onChange={(event) => setField("nameEn", event.target.value)} /></label><label>Nom français<input required value={form.nameFr} onChange={(event) => setField("nameFr", event.target.value)} /></label><label className="wide">وصف عربي<textarea required value={form.descriptionAr} onChange={(event) => setField("descriptionAr", event.target.value)} /></label><label className="wide">English description<textarea required value={form.descriptionEn} onChange={(event) => setField("descriptionEn", event.target.value)} /></label><label className="wide">Description française<textarea required value={form.descriptionFr} onChange={(event) => setField("descriptionFr", event.target.value)} /></label><label>السعر (SAR)<input required type="number" min="0" value={form.price} onChange={(event) => setField("price", Number(event.target.value))} /></label><div className="image-upload-field"><span>صورة الطبق</span><label className={`image-dropzone ${uploadMutation.isPending ? "uploading" : ""}`}>{form.imageUrl ? <img src={form.imageUrl} alt="معاينة الطبق" /> : <ImagePlus size={25} />}<span><UploadCloud size={15} /> {uploadMutation.isPending ? "جاري الرفع..." : "اختر صورة من جهازك"}</span><small>JPG, PNG أو WEBP — بحد أقصى 5MB</small><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadMutation.isPending} onChange={(event) => uploadImage(event.target.files?.[0])} /></label><input required type="hidden" value={form.imageUrl} /></div><label className="check-label"><input type="checkbox" checked={Boolean(form.isPopular)} onChange={(event) => setField("isPopular", event.target.checked ? 1 : 0)} /> مفضل الضيوف</label><label className="check-label"><input type="checkbox" checked={Boolean(form.isVegan)} onChange={(event) => setField("isVegan", event.target.checked ? 1 : 0)} /> نباتي</label><label className="check-label"><input type="checkbox" checked={Boolean(form.isAvailable)} onChange={(event) => setField("isAvailable", event.target.checked ? 1 : 0)} /> ظاهر في القائمة</label></div><div className="admin-form-actions"><button type="button" className="admin-secondary" onClick={closeForm}>إلغاء</button><button type="submit" className="admin-primary" disabled={createMutation.isPending || updateMutation.isPending || uploadMutation.isPending}><Save size={16} /> حفظ الطبق</button></div></form></div>}
    {message && <div className="admin-toast"><Check size={16} /> {message}</div>}
  </div></DashboardLayout>;
}
