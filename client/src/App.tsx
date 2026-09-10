import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  Leaf,
  MapPin,
  Menu as MenuIcon,
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Moon,
  Sun,
  Bell,
  Star,
  Utensils,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";

const ASSET = {
  hero: "/manus-storage/olive-and-clay-hero_646d0456.jpg",
  octopus: "/manus-storage/grilled-octopus_eb9d1e51.jpg",
  flatbread: "/manus-storage/zaatar-flatbread_3d1242e4.jpg",
  dessert: "/manus-storage/rose-pistachio_fd5f0ad8.jpg",
};
type Locale = "ar" | "en" | "fr";
type CategoryKey = "all" | "breakfast" | "mezza" | "mains" | "desserts";

const copy = {
  ar: {
    navMenu: "القائمة", navStory: "قصتنا", navVisit: "زورونا", reserve: "احجز طاولتك", chooseLanguage: "اختر اللغة", sortBy: "ترتيب", defaultSort: "الترتيب الافتراضي", priceLow: "السعر: الأقل أولاً", priceHigh: "السعر: الأعلى أولاً", mostPopular: "الأكثر طلباً", addToCart: "إضافة للسلة", cart: "السلة", cartEmpty: "السلة فارغة", total: "الإجمالي", ingredientsLabel: "المكونات", closeDetails: "إغلاق", nightMode: "الوضع الليلي", qrLabel: "امسح لفتح القائمة",
    eyebrow: "من مطبخنا إلى مائدتكم", heroTitle: "نكهات من ضفاف المتوسط", heroText: "نطبخ ببطء، نختار بعناية، ونترك للمكونات أن تحكي الحكاية.", explore: "استكشف القائمة", tonight: "قائمة هذا المساء", curated: "مختارات الشيف اليومية", search: "ابحث عن طبق...", all: "كل الأطباق", breakfast: "فطور", mezza: "مقبلات", mains: "أطباق رئيسية", desserts: "حلويات", featured: "الأكثر طلباً", ingredients: "مكونات موسمية، نكهة صادقة", ingredientText: "كل طبق يبدأ من سوق الصباح. خضار طازجة، زيت زيتون بكر، وتوابل نحمصها في مطبخنا.", viewAll: "عرض القائمة كاملة", hours: "نفتح يومياً", address: "شارع البحر، حي الميناء", call: "اتصل بنا", reserveTitle: "احجز طاولتك", name: "الاسم", guests: "عدد الضيوف", date: "التاريخ", time: "الوقت", confirm: "تأكيد الحجز", close: "إغلاق", booked: "تم استلام طلب الحجز", bookedText: "سنتواصل معك قريباً لتأكيد التفاصيل.", order: "أضف للمفضلة", vegan: "نباتي", popular: "مفضل الضيوف", scroll: "مرر للاستكشاف"
  },
  en: {
    navMenu: "Menu", navStory: "Our story", navVisit: "Visit us", reserve: "Reserve a table", chooseLanguage: "Choose language", sortBy: "Sort", defaultSort: "Default order", priceLow: "Price: low to high", priceHigh: "Price: high to low", mostPopular: "Most popular", addToCart: "Add to cart", cart: "Cart", cartEmpty: "Your cart is empty", total: "Total", ingredientsLabel: "Ingredients", closeDetails: "Close", nightMode: "Night mode", qrLabel: "Scan to open menu",
    eyebrow: "From our kitchen to your table", heroTitle: "Flavours from the Mediterranean", heroText: "We cook slowly, choose thoughtfully, and let the ingredients tell the story.", explore: "Explore menu", tonight: "Tonight's menu", curated: "A daily edit by our chef", search: "Search a dish...", all: "All dishes", breakfast: "Breakfast", mezza: "Mezza", mains: "Mains", desserts: "Desserts", featured: "Guest favourites", ingredients: "Seasonal ingredients, honest flavour", ingredientText: "Every plate starts at the morning market. Fresh produce, extra virgin olive oil, and spices toasted in our kitchen.", viewAll: "View full menu", hours: "Open daily", address: "Sea Street, Port District", call: "Call us", reserveTitle: "Reserve your table", name: "Name", guests: "Guests", date: "Date", time: "Time", confirm: "Confirm reservation", close: "Close", booked: "Reservation request received", bookedText: "We will be in touch shortly to confirm the details.", order: "Add to favourites", vegan: "Vegan", popular: "Guest favourite", scroll: "Scroll to explore"
  },
  fr: {
    navMenu: "Menu", navStory: "Notre histoire", navVisit: "Nous trouver", reserve: "Réserver une table", chooseLanguage: "Choisir la langue", sortBy: "Trier", defaultSort: "Ordre par défaut", priceLow: "Prix : croissant", priceHigh: "Prix : décroissant", mostPopular: "Les plus demandés", addToCart: "Ajouter au panier", cart: "Panier", cartEmpty: "Votre panier est vide", total: "Total", ingredientsLabel: "Ingrédients", closeDetails: "Fermer", nightMode: "Mode nuit", qrLabel: "Scanner pour ouvrir",
    eyebrow: "De notre cuisine à votre table", heroTitle: "Saveurs de la Méditerranée", heroText: "Nous cuisinons lentement, choisissons avec soin et laissons les ingrédients raconter l'histoire.", explore: "Découvrir le menu", tonight: "Menu du soir", curated: "La sélection quotidienne du chef", search: "Rechercher un plat...", all: "Tous les plats", breakfast: "Petit-déjeuner", mezza: "Mezzés", mains: "Plats", desserts: "Desserts", featured: "Les préférés", ingredients: "Ingrédients de saison, goût sincère", ingredientText: "Chaque assiette commence au marché du matin. Produits frais, huile d'olive vierge et épices grillées dans notre cuisine.", viewAll: "Voir le menu complet", hours: "Ouvert tous les jours", address: "Rue de la Mer, quartier du Port", call: "Appelez-nous", reserveTitle: "Réserver votre table", name: "Nom", guests: "Convives", date: "Date", time: "Heure", confirm: "Confirmer", close: "Fermer", booked: "Demande reçue", bookedText: "Nous vous contacterons bientôt pour confirmer les détails.", order: "Ajouter aux favoris", vegan: "Végétal", popular: "Préféré des clients", scroll: "Défiler pour explorer"
  },
};

const menuItems = [
  { id: "1", category: "breakfast", image: ASSET.flatbread, price: "42", rating: "4.9", vegan: true, popular: true, ar: ["مناقيش الزعتر", "خبز مخبوز بالحجر، لبنة، زيتون وزعتر"], en: ["Zaatar flatbread", "Stone-baked bread, labneh, olives & wild zaatar"], fr: ["Man’ouché au zaatar", "Pain cuit sur pierre, labneh, olives & zaatar"] },
  { id: "2", category: "mezza", image: ASSET.octopus, price: "78", rating: "4.8", vegan: false, popular: true, ar: ["أخطبوط مشوي", "أخطبوط على الجمر، حمص بالليمون وزيت الأعشاب"], en: ["Charred octopus", "Ember-grilled octopus, lemon hummus & herb oil"], fr: ["Poulpe grillé", "Poulpe braisé, houmous au citron & huile aux herbes"] },
  { id: "3", category: "mains", image: ASSET.hero, price: "96", rating: "4.9", vegan: true, popular: false, ar: ["خضار على الجمر", "خضار موسمية مشوية، طحينة خضراء وفتات خبز"], en: ["Ember vegetables", "Seasonal vegetables, green tahini & toasted crumbs"], fr: ["Légumes braisés", "Légumes de saison, tahini vert & chapelure grillée"] },
  { id: "4", category: "desserts", image: ASSET.dessert, price: "39", rating: "4.7", vegan: true, popular: false, ar: ["فستق وورد", "كريمة مخفوقة، فستق محمص وبتلات ورد"], en: ["Pistachio & rose", "Whipped cream, roasted pistachio & rose petals"], fr: ["Pistache & rose", "Crème fouettée, pistaches grillées & pétales de rose"] },
];

const categories: { key: CategoryKey; label: keyof typeof copy.ar }[] = [
  { key: "all", label: "all" }, { key: "breakfast", label: "breakfast" }, { key: "mezza", label: "mezza" }, { key: "mains", label: "mains" }, { key: "desserts", label: "desserts" },
];

function App() {
  const [location] = useLocation();
  if (location === "/admin") return <Admin />;
  if (location === "/checkout") return <Checkout />;

  const [locale, setLocale] = useState<Locale>("ar");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");
  const [favourites, setFavourites] = useState<string[]>(["2"]);
  const [showBooking, setShowBooking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reservationName, setReservationName] = useState("");
  const [reservationGuests, setReservationGuests] = useState("2");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("20:00");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [sortMode, setSortMode] = useState<"default" | "priceAsc" | "priceDesc" | "popular">("default");
  const [cart, setCart] = useState<Record<string, number>>(() => { try { return JSON.parse(localStorage.getItem("olive-clay-cart") || "{}"); } catch { return {}; } });
  const [cartOpen, setCartOpen] = useState(false);
  const [isNight, setIsNight] = useState(() => localStorage.getItem("olive-clay-night") === "true");
  const [waiterCalled, setWaiterCalled] = useState(false);
  const t = copy[locale];
  const isArabic = locale === "ar";
  const menuQuery = trpc.menu.list.useQuery();
  const reservationMutation = trpc.menu.createReservation.useMutation({
    onSuccess: () => setSubmitted(true),
  });
  const waiterMutation = trpc.orders.callWaiter.useMutation({ onSuccess: () => { setWaiterCalled(true); window.setTimeout(() => setWaiterCalled(false), 5000); } });

  const liveMenuItems = menuQuery.data?.length ? menuQuery.data.map((item) => ({
    id: String(item.id), category: item.category, image: item.imageUrl, price: String(item.price), rating: item.rating,
    vegan: Boolean(item.isVegan), popular: Boolean(item.isPopular),
    ar: [item.nameAr, item.descriptionAr], en: [item.nameEn, item.descriptionEn], fr: [item.nameFr, item.descriptionFr], ingredients: locale === "ar" ? ["زيت زيتون بكر", "أعشاب موسمية", "توابل محمصة"] : locale === "fr" ? ["Huile d’olive vierge", "Herbes de saison", "Épices grillées"] : ["Extra virgin olive oil", "Seasonal herbs", "Toasted spices"],
  })) : menuItems;

  const filteredItems = useMemo(() => liveMenuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const [title, description] = item[locale];
    return matchesCategory && `${title} ${description}`.toLowerCase().includes(query.toLowerCase());
  }), [activeCategory, locale, query, liveMenuItems]);
  const sortedItems = useMemo(() => [...filteredItems].sort((a, b) => sortMode === "priceAsc" ? Number(a.price) - Number(b.price) : sortMode === "priceDesc" ? Number(b.price) - Number(a.price) : sortMode === "popular" ? Number(b.popular) - Number(a.popular) || Number(b.rating) - Number(a.rating) : 0), [filteredItems, sortMode]);
  const cartItems = liveMenuItems.filter((item) => cart[item.id]);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price) * (cart[item.id] || 0), 0);
  useEffect(() => { localStorage.setItem("olive-clay-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("olive-clay-night", String(isNight)); }, [isNight]);
  const addToCart = (id: string) => setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  const changeCartQuantity = (id: string, delta: number) => setCart((current) => { const next = Math.max(0, (current[id] || 0) + delta); const updated = { ...current }; if (next) updated[id] = next; else delete updated[id]; return updated; });

  const toggleFavourite = (id: string) => setFavourites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const switchLocale = (next: Locale) => { setLocale(next); setMenuOpen(false); };

  return (
    <div className={`site-shell ${isNight ? "night-mode" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Olive & Clay home">
          <span className="brand-mark"><Leaf size={18} strokeWidth={1.6} /></span>
          <span><strong>Olive</strong><em>& Clay</em></span>
        </a>
        <nav className={`desktop-nav ${menuOpen ? "is-open" : ""}`}>
          <a href="#menu">{t.navMenu}</a><a href="#visit">{t.navVisit}</a>
        </nav>
        <div className="top-actions">
          <label className="language-select"><span>{t.chooseLanguage}</span><select value={locale} onChange={(event) => switchLocale(event.target.value as Locale)} aria-label={t.chooseLanguage}><option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option></select><ChevronDown size={13} /></label>
          <button className="theme-toggle" onClick={() => setIsNight((value) => !value)} aria-label={t.nightMode}>{isNight ? <Sun size={16} /> : <Moon size={16} />}</button><button className="reserve-button" onClick={() => { setSubmitted(false); setShowBooking(true); }}>{t.reserve}<ArrowUpRight size={16} /></button>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={21} /> : <MenuIcon size={21} />}</button>
        </div>
      </header>
      <div className="qr-banner"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=88x88&data=${encodeURIComponent(window.location.origin)}`} alt="QR code" /><span>{t.qrLabel}</span><a href="#menu">{t.navMenu} <ArrowUpRight size={13} /></a></div>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" />{t.eyebrow}</div>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroText}</p>
            <div className="hero-cta-row">
              <a href="#menu" className="primary-cta">{t.explore}<ArrowUpRight size={18} /></a>
              <span className="hero-note"><Star size={15} fill="currentColor" /> 4.9 <small>· {t.popular}</small></span>
            </div>
          </div>
          <div className="hero-bottom"><span>{t.scroll}</span><span className="scroll-line" /></div>
          <div className="hero-stamp"><div className="stamp-circle"><span>EST.</span><b>2014</b><small>JOURNAL OF TASTE</small></div></div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div><div className="section-kicker">{t.tonight}</div><h2>{t.curated}</h2></div>
            <div className="heading-rule" />
            <p>{locale === "ar" ? "قائمة صغيرة، مكونات كبيرة، ووقت كافٍ لتذوق كل لحظة." : locale === "fr" ? "Une petite carte, de grands ingrédients et le temps de savourer." : "A small menu, generous ingredients, and time to savour every moment."}</p>
          </div>
          <div className="menu-toolbar">
            <div className="category-tabs">{categories.map(({ key, label }) => <button key={key} className={activeCategory === key ? "active" : ""} onClick={() => setActiveCategory(key)}>{t[label]}</button>)}</div>
            <div className="menu-tools"><label className="sort-field">{t.sortBy}<select value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)}><option value="default">{t.defaultSort}</option><option value="priceAsc">{t.priceLow}</option><option value="priceDesc">{t.priceHigh}</option><option value="popular">{t.mostPopular}</option></select></label><label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /></label></div>
          </div>
          <div className="menu-grid">
            {sortedItems.map((item, index) => {
              const [title, description] = item[locale];
              const liked = favourites.includes(item.id);
              return <article className="dish-card" key={item.id} style={{ "--delay": `${index * 70}ms` } as React.CSSProperties} onClick={() => setSelectedItem(item)}>
                <div className="dish-image-wrap"><img src={item.image} alt={title} /><div className="image-overlay" /><button className={`heart-button ${liked ? "liked" : ""}`} onClick={(event) => { event.stopPropagation(); toggleFavourite(item.id); }} aria-label={t.order}><Heart size={18} fill={liked ? "currentColor" : "none"} /></button>{item.popular && <span className="popular-tag"><Star size={12} fill="currentColor" />{t.popular}</span>}<span className="image-hint">{locale === "ar" ? "عرض التفاصيل" : locale === "fr" ? "Voir les détails" : "View details"}</span></div>
                <div className="dish-content"><div className="dish-title-row"><h3>{title}</h3><span className="price"><small>SAR</small> {item.price}</span></div><p>{description}</p><div className="dish-meta"><span className="rating"><Star size={13} fill="currentColor" /> {item.rating}</span>{item.vegan && <span className="vegan-tag"><Leaf size={13} /> {t.vegan}</span>}<button className="tiny-action" onClick={(event) => { event.stopPropagation(); toggleFavourite(item.id); }}>{liked ? <Check size={14} /> : <Heart size={14} />} {liked ? (isArabic ? "محفوظ" : locale === "fr" ? "Ajouté" : "Saved") : t.order}</button></div><button className="add-cart-button" onClick={(event) => { event.stopPropagation(); addToCart(item.id); }}>{t.addToCart}<ShoppingCart size={15} /></button></div>
              </article>;
            })}
          </div>
          {filteredItems.length === 0 && <div className="empty-state">{locale === "ar" ? "لم نجد طبقاً يطابق بحثك." : locale === "fr" ? "Aucun plat ne correspond à votre recherche." : "No dishes match your search."}</div>}
          <div className="menu-footer"><a href="#menu" className="text-link">{t.viewAll}<ArrowUpRight size={17} /></a><span className="footer-note"><span className="dot" /> {locale === "ar" ? "خيارات نباتية متاحة" : locale === "fr" ? "Options végétales disponibles" : "Plant-based options available"}</span></div>
        </section>

      </main>

      {selectedItem && <div className="modal-backdrop dish-detail-backdrop" role="presentation" onClick={() => setSelectedItem(null)}><div className="dish-detail-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedItem(null)} aria-label={t.closeDetails}><X size={20} /></button><img className="detail-image" src={selectedItem.image} alt={selectedItem[locale][0]} /><div className="detail-body"><span className="section-kicker">{selectedItem.popular ? t.popular : t.tonight}</span><div className="detail-title-row"><h2>{selectedItem[locale][0]}</h2><span className="price"><small>SAR</small> {selectedItem.price}</span></div><p>{selectedItem[locale][1]}</p><h3>{t.ingredientsLabel}</h3><div className="ingredient-pills">{(selectedItem.ingredients || ["Extra virgin olive oil", "Seasonal herbs", "Toasted spices"]).map((ingredient: string) => <span key={ingredient}>{ingredient}</span>)}</div><button className="primary-cta detail-add" onClick={() => { addToCart(selectedItem.id); setSelectedItem(null); }}>{t.addToCart}<ShoppingCart size={17} /></button></div></div></div>}
      <button className={`floating-cart ${cartCount ? "has-items" : ""}`} onClick={() => setCartOpen(true)} aria-label={t.cart}><ShoppingCart size={21} /><span>{cartCount}</span></button>
      <button className={`waiter-button ${waiterCalled ? "called" : ""}`} onClick={() => waiterMutation.mutate({ location: "المنيو الإلكترونية" })} disabled={waiterMutation.isPending || waiterCalled}><Bell size={18} /> {waiterCalled ? (isArabic ? "تم النداء" : locale === "fr" ? "Appelé" : "Called") : (isArabic ? "نداء النادل" : locale === "fr" ? "Appeler" : "Call waiter")}</button>
      {cartOpen && <div className="modal-backdrop cart-backdrop" role="presentation" onClick={() => setCartOpen(false)}><aside className="cart-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><div className="cart-header"><div><span className="section-kicker">OLIVE & CLAY</span><h2>{t.cart}</h2></div><button className="modal-close" onClick={() => setCartOpen(false)} aria-label={t.close}><X size={20} /></button></div>{cartItems.length ? <><div className="cart-list">{cartItems.map((item) => <div className="cart-line" key={item.id}><img src={item.image} alt="" /><div className="cart-line-info"><strong>{item[locale][0]}</strong><small><span className="price"><small>SAR</small> {item.price}</span> × {cart[item.id]}</small></div><div className="quantity-controls"><button onClick={() => changeCartQuantity(item.id, -1)}><Minus size={13} /></button><b>{cart[item.id]}</b><button onClick={() => changeCartQuantity(item.id, 1)}><Plus size={13} /></button></div></div>)}</div><div className="cart-total"><span>{t.total}</span><strong><small>SAR</small> {cartTotal}</strong></div><a className="primary-cta cart-submit" href="/checkout">{t.cart} <ArrowUpRight size={17} /></a></> : <div className="cart-empty"><ShoppingCart size={32} /><p>{t.cartEmpty}</p><button className="text-link" onClick={() => setCartOpen(false)}>{t.explore}</button></div>}</aside></div>}

      <footer className="footer footer-orange" id="visit"><div className="footer-intro"><a className="brand footer-brand" href="#top"><span className="brand-mark"><Leaf size={18} strokeWidth={1.6} /></span><span><strong>Olive</strong><em>& Clay</em></span></a><span className="footer-welcome">{locale === "ar" ? "أهلاً بكم" : locale === "fr" ? "Bienvenue" : "Welcome"}</span><h2>{locale === "ar" ? "نلتقي حول المائدة" : locale === "fr" ? "À bientôt autour de la table" : "Meet us around the table"}</h2></div><div className="footer-contact"><span><Clock3 size={17} /><small>{t.hours}</small><b>12:00 — 00:00</b></span><span><MapPin size={17} /><small>{t.address}</small><a href="https://maps.google.com" target="_blank" rel="noreferrer">{locale === "ar" ? "الخريطة والاتجاهات" : locale === "fr" ? "Carte & itinéraire" : "Map & directions"} <ArrowUpRight size={13} /></a></span></div><div className="footer-actions"><button onClick={() => { setSubmitted(false); setShowBooking(true); }}>{t.reserve}<CalendarDays size={16} /></button><a href="tel:+966555555555">{t.call}<ArrowUpRight size={14} /></a><a href="/admin">Admin</a></div><div className="footer-copyright">© 2024 Olive & Clay</div></footer>

      {showBooking && <div className="modal-backdrop" role="presentation" onClick={() => setShowBooking(false)}><div className="booking-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowBooking(false)} aria-label={t.close}><X size={20} /></button>{submitted ? <div className="success-state"><div className="success-icon"><Check size={25} /></div><h3>{t.booked}</h3><p>{t.bookedText}</p><button className="primary-cta" onClick={() => setShowBooking(false)}>{t.close}</button></div> : <><div className="section-kicker">{t.reserve}</div><h2>{t.reserveTitle}</h2><form onSubmit={(event) => { event.preventDefault(); reservationMutation.mutate({ guestName: reservationName, guestCount: Number(reservationGuests), reservationAt: new Date(`${reservationDate}T${reservationTime}:00`) }); }}><label>{t.name}<input required value={reservationName} onChange={(event) => setReservationName(event.target.value)} placeholder={isArabic ? "اكتب اسمك" : "Your name"} /></label><div className="form-row"><label>{t.guests}<select value={reservationGuests} onChange={(event) => setReservationGuests(event.target.value)}><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5+</option></select></label><label>{t.date}<input required type="date" value={reservationDate} onChange={(event) => setReservationDate(event.target.value)} /></label></div><label>{t.time}<select value={reservationTime} onChange={(event) => setReservationTime(event.target.value)}><option value="19:00">19:00</option><option value="20:00">20:00</option><option value="21:00">21:00</option><option value="22:00">22:00</option></select></label><button className="primary-cta submit-button" type="submit" disabled={reservationMutation.isPending}>{reservationMutation.isPending ? "..." : t.confirm}<CalendarDays size={17} /></button></form></>}</div></div>}
    </div>
  );
}

export default App;

// Keep the type available for inline CSS custom properties without adding another dependency.

declare global { namespace React { interface CSSProperties { [key: `--${string}`]: string | number; } } }
