import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Check, Edit3, Filter, ImagePlus, LayoutDashboard, Plus, Save, Trash2, UploadCloud, Utensils, X } from "lucide-react";

const emptyForm = {
  category: "mains" as "breakfast" | "mezza" | "mains" | "desserts",
  imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85",
  price: 0, rating: "4.8", isVegan: 0, isPopular: 0, isAvailable: 1,
  nameAr: "", descriptionAr: "", nameEn: "", descriptionEn: "", nameFr: "", descriptionFr: "",
};

type FormState = typeof emptyForm;

const labelMap = {
  breakfast: "فطور", mezza: "مقبلات", mains: "أطباق رئيسية", desserts: "حلويات",
};

const adminCopy = {
  ar: { title: "لوحة التحكم", desc: "إدارة القائمة ومتابعة حجوزات الزوار من مكان واحد.", dishes: "إدارة الأطباق", reservations: "الحجوزات", published: "الأطباق المنشورة", pending: "الحجوزات المعلقة", account: "حالة الحساب", add: "إضافة طبق", filter: "تصفية حسب التصنيف", all: "كل الأصناف" },
  en: { title: "Admin dashboard", desc: "Manage the menu and guest reservations in one place.", dishes: "Manage dishes", reservations: "Reservations", published: "Published dishes", pending: "Pending reservations", account: "Account status", add: "Add dish", filter: "Filter by category", all: "All dishes" },
  fr: { title: "Tableau de bord", desc: "Gérez le menu et les réservations depuis un seul espace.", dishes: "Gérer les plats", reservations: "Réservations", published: "Plats publiés", pending: "Réservations en attente", account: "Statut du compte", add: "Ajouter un plat", filter: "Filtrer par catégorie", all: "Tous les plats" },
};

export default function Admin() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"menu" | "reservations">("menu");
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | FormState["category"]>("all");
  const [adminLocale, setAdminLocale] = useState<"ar" | "en" | "fr">("ar");
  const copy = adminCopy[adminLocale];

  const menuQuery = trpc.admin.menu.list.useQuery(undefined, { enabled: !!user && user.role === "admin" });
  const reservationQuery = trpc.admin.reservations.list.useQuery(undefined, { enabled: !!user && user.role === "admin" });
  const utils = trpc.useUtils();
  const createMutation = trpc.admin.menu.create.useMutation({ onSuccess: () => { utils.admin.menu.list.invalidate(); closeForm(); setMessage("تمت إضافة الطبق بنجاح"); } });
  const updateMutation = trpc.admin.menu.update.useMutation({ onSuccess: () => { utils.admin.menu.list.invalidate(); closeForm(); setMessage("تم حفظ تعديلات الطبق"); } });
  const deleteMutation = trpc.admin.menu.remove.useMutation({ onSuccess: () => { utils.admin.menu.list.invalidate(); setMessage("تم حذف الطبق"); } });
  const uploadMutation = trpc.admin.menu.uploadImage.useMutation({
    onSuccess: ({ url }) => { setField("imageUrl", url); setMessage("تم رفع الصورة بنجاح"); },
    onError: () => setMessage("تعذّر رفع الصورة. استخدم JPG أو PNG أو WEBP بحجم أقل من 5MB"),
  });
  const statusMutation = trpc.admin.reservations.updateStatus.useMutation({ onSuccess: () => { utils.admin.reservations.list.invalidate(); setMessage("تم تحديث حالة الحجز"); } });

  useEffect(() => { if (message) { const timer = window.setTimeout(() => setMessage(""), 3200); return () => window.clearTimeout(timer); } }, [message]);

  const reservations = reservationQuery.data ?? [];
  const pendingCount = useMemo(() => reservations.filter((item) => item.status === "pending").length, [reservations]);
  const filteredMenuItems = useMemo(() => (menuQuery.data ?? []).filter((item) => categoryFilter === "all" || item.category === categoryFilter), [menuQuery.data, categoryFilter]);

  const closeForm = () => { setFormOpen(false); setEditing(null); setForm(emptyForm); };
  const openCreate = () => { setForm(emptyForm); setEditing(null); setFormOpen(true); };
  const openEdit = (item: NonNullable<typeof menuQuery.data>[number]) => {
    setForm({ category: item.category, imageUrl: item.imageUrl, price: item.price, rating: item.rating, isVegan: item.isVegan, isPopular: item.isPopular, isAvailable: item.isAvailable, nameAr: item.nameAr, descriptionAr: item.descriptionAr, nameEn: item.nameEn, descriptionEn: item.descriptionEn, nameFr: item.nameFr, descriptionFr: item.descriptionFr });
    setEditing(item.id); setFormOpen(true);
  };
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submitForm = (event: React.FormEvent) => { event.preventDefault(); if (editing) updateMutation.mutate({ id: editing, data: form }); else createMutation.mutate(form); };
  const uploadImage = async (file?: File) => {
    if (!file) return;
    if (!(["image/jpeg", "image/png", "image/webp"] as string[]).includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage("اختر صورة JPG أو PNG أو WEBP بحجم أقل من 5MB");
      return;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let index = 0; index < bytes.length; index += 8192) {
      const chunk = bytes.subarray(index, index + 8192);
      for (let offset = 0; offset < chunk.length; offset += 1) binary += String.fromCharCode(chunk[offset]);
    }
    uploadMutation.mutate({ fileName: file.name, contentType: file.type as "image/jpeg" | "image/png" | "image/webp", base64: btoa(binary) });
  };

  if (loading) return <div className="admin-loading">جاري التحقق من صلاحيات الأدمن...</div>;
  if (!user) return <div className="admin-auth-wall"><div className="admin-auth-card"><div className="admin-brand-mark"><Utensils size={21} /></div><span className="admin-kicker">Olive & Clay</span><h1>لوحة الإدارة</h1><p>سجّل الدخول للوصول إلى إدارة القائمة والحجوزات.</p><button className="admin-primary" onClick={() => startLogin()}>تسجيل الدخول</button></div></div>;
  if (user.role !== "admin") return <div className="admin-auth-wall"><div className="admin-auth-card"><div className="admin-brand-mark"><X size={21} /></div><span className="admin-kicker">Access denied</span><h1>لا تملك صلاحية الأدمن</h1><p>هذا الحساب مسجل كحساب مستخدم عادي. اطلب من مالك الموقع ترقيته إلى admin.</p><a className="admin-secondary" href="/">العودة إلى الموقع</a></div></div>;

  return <DashboardLayout>
    <div className="admin-page" dir={adminLocale === "ar" ? "rtl" : "ltr"} lang={adminLocale}>
      <header className="admin-header"><div><span className="admin-kicker">OLIVE & CLAY / ADMIN</span><h1>{copy.title}</h1><p>{copy.desc}</p></div><div className="admin-header-actions"><label className="admin-language-picker">{adminLocale === "ar" ? "اللغة" : "Language"}<select value={adminLocale} onChange={(event) => setAdminLocale(event.target.value as "ar" | "en" | "fr")}><option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option></select></label><a className="admin-view-site" href="/">عرض الموقع <LayoutDashboard size={16} /></a></div></header>
      <section className="admin-stats"><div className="admin-stat"><span>{copy.published}</span><strong>{menuQuery.data?.filter((item) => item.isAvailable).length ?? 0}</strong><small>{adminLocale === "ar" ? "من القائمة الحالية" : "From current menu"}</small></div><div className="admin-stat"><span>{copy.pending}</span><strong>{pendingCount}</strong><small>{adminLocale === "ar" ? "بانتظار المراجعة" : "Awaiting review"}</small></div><div className="admin-stat"><span>{copy.account}</span><strong className="status-word">Admin</strong><small>{user.email || user.name || "Owner account"}</small></div></section>
      <div className="admin-tabs"><button className={activeTab === "menu" ? "active" : ""} onClick={() => setActiveTab("menu")}><Utensils size={16} /> {copy.dishes}</button><button className={activeTab === "reservations" ? "active" : ""} onClick={() => setActiveTab("reservations")}><LayoutDashboard size={16} /> {copy.reservations} {pendingCount > 0 && <b>{pendingCount}</b>}</button></div>

      {activeTab === "menu" ? <section className="admin-panel"><div className="panel-heading"><div><span className="admin-kicker">MENU CONTENT</span><h2>الأطباق</h2></div><button className="admin-primary compact" onClick={openCreate}><Plus size={16} /> {copy.add}</button></div><div className="admin-filter-bar"><span><Filter size={15} /> {copy.filter}</span><div>{(["all", "breakfast", "mezza", "mains", "desserts"] as const).map((category) => <button key={category} className={categoryFilter === category ? "active" : ""} onClick={() => setCategoryFilter(category)}>{category === "all" ? copy.all : labelMap[category]}</button>)}</div><small>{filteredMenuItems.length} {adminLocale === "ar" ? "طبق" : "items"}</small></div>{menuQuery.isLoading ? <div className="admin-empty">جاري تحميل الأطباق...</div> : menuQuery.data?.length ? filteredMenuItems.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>الطبق</th><th>القسم</th><th>السعر</th><th>الحالة</th><th></th></tr></thead><tbody>{filteredMenuItems.map((item) => <tr key={item.id}><td><div className="table-item"><img src={item.imageUrl} alt="" /><span><strong>{item.nameAr}</strong><small>{item.nameEn}</small></span></div></td><td><span className="category-chip">{labelMap[item.category]}</span></td><td>{item.price} SAR</td><td><span className={`availability ${item.isAvailable ? "on" : "off"}`}>{item.isAvailable ? "ظاهر" : "مخفي"}</span></td><td><div className="row-actions"><button onClick={() => openEdit(item)} aria-label="تعديل"><Edit3 size={16} /></button><button onClick={() => { if (window.confirm("هل تريد حذف هذا الطبق؟")) deleteMutation.mutate({ id: item.id }); }} aria-label="حذف"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <div className="admin-empty"><Filter size={28} /><p>لا توجد أطباق في هذا التصنيف.</p><button className="admin-secondary" onClick={() => setCategoryFilter("all")}>عرض كل الأصناف</button></div> : <div className="admin-empty"><Utensils size={28} /><p>لا توجد أطباق في قاعدة البيانات بعد.</p><button className="admin-primary compact" onClick={openCreate}>أضف أول طبق</button></div>}</section> : <section className="admin-panel"><div className="panel-heading"><div><span className="admin-kicker">RESERVATIONS</span><h2>{copy.reservations}</h2></div><span className="panel-meta">{reservations.length} إجمالي الحجوزات</span></div>{reservationQuery.isLoading ? <div className="admin-empty">جاري تحميل الحجوزات...</div> : reservations.length ? <div className="admin-table-wrap"><table className="admin-table reservations-table"><thead><tr><th>الضيف</th><th>التاريخ والوقت</th><th>الضيوف</th><th>الحالة</th><th></th></tr></thead><tbody>{reservations.map((item) => <tr key={item.id}><td><strong>{item.guestName}</strong><small className="table-sub">طلب رقم #{item.id}</small></td><td>{new Date(item.reservationAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}</td><td>{item.guestCount}</td><td><select className={`status-select ${item.status}`} value={item.status} onChange={(event) => statusMutation.mutate({ id: item.id, status: event.target.value as "pending" | "confirmed" | "cancelled" })}><option value="pending">معلق</option><option value="confirmed">مؤكد</option><option value="cancelled">ملغي</option></select></td><td><Check className={item.status === "confirmed" ? "status-check visible" : "status-check"} size={17} /></td></tr>)}</tbody></table></div> : <div className="admin-empty"><LayoutDashboard size={28} /><p>لا توجد حجوزات حتى الآن.</p></div>}</section>}

      {formOpen && <div className="admin-modal-backdrop" onClick={closeForm}><form className="admin-form-modal" onSubmit={submitForm} onClick={(event) => event.stopPropagation()}><button type="button" className="admin-modal-close" onClick={closeForm}><X size={18} /></button><span className="admin-kicker">{editing ? "EDIT DISH" : "NEW DISH"}</span><h2>{editing ? "تعديل الطبق" : "إضافة طبق جديد"}</h2><div className="admin-form-grid"><label>اسم الطبق بالعربية<input required value={form.nameAr} onChange={(event) => setField("nameAr", event.target.value)} /></label><label>القسم<select value={form.category} onChange={(event) => setField("category", event.target.value as FormState["category"])}><option value="breakfast">فطور</option><option value="mezza">مقبلات</option><option value="mains">أطباق رئيسية</option><option value="desserts">حلويات</option></select></label><label>English name<input required value={form.nameEn} onChange={(event) => setField("nameEn", event.target.value)} /></label><label>Nom français<input required value={form.nameFr} onChange={(event) => setField("nameFr", event.target.value)} /></label><label className="wide">وصف عربي<textarea required value={form.descriptionAr} onChange={(event) => setField("descriptionAr", event.target.value)} /></label><label className="wide">English description<textarea required value={form.descriptionEn} onChange={(event) => setField("descriptionEn", event.target.value)} /></label><label className="wide">Description française<textarea required value={form.descriptionFr} onChange={(event) => setField("descriptionFr", event.target.value)} /></label><label>السعر (SAR)<input required type="number" min="0" value={form.price} onChange={(event) => setField("price", Number(event.target.value))} /></label><div className="image-upload-field"><span>صورة الطبق</span><label className={`image-dropzone ${uploadMutation.isPending ? "uploading" : ""}`}>{form.imageUrl ? <img src={form.imageUrl} alt="معاينة الطبق" /> : <ImagePlus size={25} />}<span><UploadCloud size={15} /> {uploadMutation.isPending ? "جاري الرفع..." : "اختر صورة من جهازك"}</span><small>JPG, PNG أو WEBP — بحد أقصى 5MB</small><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadMutation.isPending} onChange={(event) => uploadImage(event.target.files?.[0])} /></label><input required type="hidden" value={form.imageUrl} /></div><label className="check-label"><input type="checkbox" checked={Boolean(form.isPopular)} onChange={(event) => setField("isPopular", event.target.checked ? 1 : 0)} /> مفضل الضيوف</label><label className="check-label"><input type="checkbox" checked={Boolean(form.isVegan)} onChange={(event) => setField("isVegan", event.target.checked ? 1 : 0)} /> نباتي</label><label className="check-label"><input type="checkbox" checked={Boolean(form.isAvailable)} onChange={(event) => setField("isAvailable", event.target.checked ? 1 : 0)} /> ظاهر في القائمة</label></div><div className="admin-form-actions"><button type="button" className="admin-secondary" onClick={closeForm}>إلغاء</button><button type="submit" className="admin-primary" disabled={createMutation.isPending || updateMutation.isPending || uploadMutation.isPending}><Save size={16} /> حفظ الطبق</button></div></form></div>}
      {message && <div className="admin-toast"><Check size={16} /> {message}</div>}
    </div>
  </DashboardLayout>;
}
