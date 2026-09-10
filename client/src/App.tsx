import { useMemo, useState } from "react";
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
  Star,
  Utensils,
  X,
} from "lucide-react";

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
    navMenu: "القائمة", navStory: "قصتنا", navVisit: "زورونا", reserve: "احجز طاولتك", chooseLanguage: "اختر اللغة",
    eyebrow: "من مطبخنا إلى مائدتكم", heroTitle: "نكهات من ضفاف المتوسط", heroText: "نطبخ ببطء، نختار بعناية، ونترك للمكونات أن تحكي الحكاية.", explore: "استكشف القائمة", tonight: "قائمة هذا المساء", curated: "مختارات الشيف اليومية", search: "ابحث عن طبق...", all: "كل الأطباق", breakfast: "فطور", mezza: "مقبلات", mains: "أطباق رئيسية", desserts: "حلويات", featured: "الأكثر طلباً", ingredients: "مكونات موسمية، نكهة صادقة", ingredientText: "كل طبق يبدأ من سوق الصباح. خضار طازجة، زيت زيتون بكر، وتوابل نحمصها في مطبخنا.", viewAll: "عرض القائمة كاملة", hours: "نفتح يومياً", address: "شارع البحر، حي الميناء", call: "اتصل بنا", reserveTitle: "احجز طاولتك", name: "الاسم", guests: "عدد الضيوف", date: "التاريخ", time: "الوقت", confirm: "تأكيد الحجز", close: "إغلاق", booked: "تم استلام طلب الحجز", bookedText: "سنتواصل معك قريباً لتأكيد التفاصيل.", order: "أضف للمفضلة", vegan: "نباتي", popular: "مفضل الضيوف", scroll: "مرر للاستكشاف"
  },
  en: {
    navMenu: "Menu", navStory: "Our story", navVisit: "Visit us", reserve: "Reserve a table", chooseLanguage: "Choose language",
    eyebrow: "From our kitchen to your table", heroTitle: "Flavours from the Mediterranean", heroText: "We cook slowly, choose thoughtfully, and let the ingredients tell the story.", explore: "Explore menu", tonight: "Tonight's menu", curated: "A daily edit by our chef", search: "Search a dish...", all: "All dishes", breakfast: "Breakfast", mezza: "Mezza", mains: "Mains", desserts: "Desserts", featured: "Guest favourites", ingredients: "Seasonal ingredients, honest flavour", ingredientText: "Every plate starts at the morning market. Fresh produce, extra virgin olive oil, and spices toasted in our kitchen.", viewAll: "View full menu", hours: "Open daily", address: "Sea Street, Port District", call: "Call us", reserveTitle: "Reserve your table", name: "Name", guests: "Guests", date: "Date", time: "Time", confirm: "Confirm reservation", close: "Close", booked: "Reservation request received", bookedText: "We will be in touch shortly to confirm the details.", order: "Add to favourites", vegan: "Vegan", popular: "Guest favourite", scroll: "Scroll to explore"
  },
  fr: {
    navMenu: "Menu", navStory: "Notre histoire", navVisit: "Nous trouver", reserve: "Réserver une table", chooseLanguage: "Choisir la langue",
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
  const [locale, setLocale] = useState<Locale>("ar");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");
  const [favourites, setFavourites] = useState<string[]>(["2"]);
  const [showBooking, setShowBooking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[locale];
  const isArabic = locale === "ar";

  const filteredItems = useMemo(() => menuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const [title, description] = item[locale];
    return matchesCategory && `${title} ${description}`.toLowerCase().includes(query.toLowerCase());
  }), [activeCategory, locale, query]);

  const toggleFavourite = (id: string) => setFavourites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const switchLocale = (next: Locale) => { setLocale(next); setMenuOpen(false); };

  return (
    <div className="site-shell" dir={isArabic ? "rtl" : "ltr"}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Olive & Clay home">
          <span className="brand-mark"><Leaf size={18} strokeWidth={1.6} /></span>
          <span><strong>Olive</strong><em>& Clay</em></span>
        </a>
        <nav className={`desktop-nav ${menuOpen ? "is-open" : ""}`}>
          <a href="#menu">{t.navMenu}</a><a href="#story">{t.navStory}</a><a href="#visit">{t.navVisit}</a>
        </nav>
        <div className="top-actions">
          <label className="language-select"><span>{t.chooseLanguage}</span><select value={locale} onChange={(event) => switchLocale(event.target.value as Locale)} aria-label={t.chooseLanguage}><option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option></select><ChevronDown size={13} /></label>
          <button className="reserve-button" onClick={() => { setSubmitted(false); setShowBooking(true); }}>{t.reserve}<ArrowUpRight size={16} /></button>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={21} /> : <MenuIcon size={21} />}</button>
        </div>
      </header>

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
            <label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /></label>
          </div>
          <div className="menu-grid">
            {filteredItems.map((item, index) => {
              const [title, description] = item[locale];
              const liked = favourites.includes(item.id);
              return <article className="dish-card" key={item.id} style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}>
                <div className="dish-image-wrap"><img src={item.image} alt={title} /><div className="image-overlay" /><button className={`heart-button ${liked ? "liked" : ""}`} onClick={() => toggleFavourite(item.id)} aria-label={t.order}><Heart size={18} fill={liked ? "currentColor" : "none"} /></button>{item.popular && <span className="popular-tag"><Star size={12} fill="currentColor" />{t.popular}</span>}</div>
                <div className="dish-content"><div className="dish-title-row"><h3>{title}</h3><span className="price"><small>SAR</small> {item.price}</span></div><p>{description}</p><div className="dish-meta"><span className="rating"><Star size={13} fill="currentColor" /> {item.rating}</span>{item.vegan && <span className="vegan-tag"><Leaf size={13} /> {t.vegan}</span>}<button className="tiny-action" onClick={() => toggleFavourite(item.id)}>{liked ? <Check size={14} /> : <Heart size={14} />} {liked ? (isArabic ? "محفوظ" : locale === "fr" ? "Ajouté" : "Saved") : t.order}</button></div></div>
              </article>;
            })}
          </div>
          {filteredItems.length === 0 && <div className="empty-state">{locale === "ar" ? "لم نجد طبقاً يطابق بحثك." : locale === "fr" ? "Aucun plat ne correspond à votre recherche." : "No dishes match your search."}</div>}
          <div className="menu-footer"><a href="#menu" className="text-link">{t.viewAll}<ArrowUpRight size={17} /></a><span className="footer-note"><span className="dot" /> {locale === "ar" ? "خيارات نباتية متاحة" : locale === "fr" ? "Options végétales disponibles" : "Plant-based options available"}</span></div>
        </section>

        <section className="story-section" id="story">
          <div className="story-image"><img src={ASSET.flatbread} alt="Fresh Mediterranean ingredients" /><div className="story-image-caption"><span>01</span><span>{locale === "ar" ? "من السوق" : locale === "fr" ? "Du marché" : "From the market"}</span></div></div>
          <div className="story-copy"><div className="section-kicker">{locale === "ar" ? "فلسفتنا" : locale === "fr" ? "Notre philosophie" : "Our philosophy"}</div><h2>{t.ingredients}</h2><p>{t.ingredientText}</p><div className="ingredient-list"><span>01 <b>{locale === "ar" ? "زيت الزيتون البكر" : locale === "fr" ? "Huile d'olive vierge" : "Extra virgin olive oil"}</b></span><span>02 <b>{locale === "ar" ? "أعشاب من الحديقة" : locale === "fr" ? "Herbes du jardin" : "Garden herbs"}</b></span><span>03 <b>{locale === "ar" ? "حبوب محلية" : locale === "fr" ? "Céréales locales" : "Local grains"}</b></span></div></div>
        </section>

        <section className="visit-section" id="visit"><div className="visit-card"><div><div className="section-kicker">{locale === "ar" ? "أهلاً بكم" : locale === "fr" ? "Bienvenue" : "Welcome in"}</div><h2>{locale === "ar" ? "نلتقي حول المائدة" : locale === "fr" ? "À bientôt autour de la table" : "Meet us around the table"}</h2></div><div className="visit-details"><span><Clock3 size={17} /> {t.hours}<b>12:00 — 00:00</b></span><span><MapPin size={17} /> {t.address}<b>{locale === "ar" ? "الخريطة والاتجاهات" : locale === "fr" ? "Carte & itinéraire" : "Map & directions"} <ArrowUpRight size={14} /></b></span></div><button className="primary-cta light" onClick={() => { setSubmitted(false); setShowBooking(true); }}>{t.reserve}<ArrowUpRight size={18} /></button></div></section>
      </main>

      <footer className="footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><Leaf size={18} strokeWidth={1.6} /></span><span><strong>Olive</strong><em>& Clay</em></span></a><span>© 2024 Olive & Clay</span><a href="tel:+966555555555">{t.call} <ArrowUpRight size={14} /></a></footer>

      {showBooking && <div className="modal-backdrop" role="presentation" onClick={() => setShowBooking(false)}><div className="booking-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowBooking(false)} aria-label={t.close}><X size={20} /></button>{submitted ? <div className="success-state"><div className="success-icon"><Check size={25} /></div><h3>{t.booked}</h3><p>{t.bookedText}</p><button className="primary-cta" onClick={() => setShowBooking(false)}>{t.close}</button></div> : <><div className="section-kicker">{t.reserve}</div><h2>{t.reserveTitle}</h2><form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><label>{t.name}<input required placeholder={isArabic ? "اكتب اسمك" : "Your name"} /></label><div className="form-row"><label>{t.guests}<select defaultValue="2"><option>2</option><option>3</option><option>4</option><option>5+</option></select></label><label>{t.date}<input required type="date" /></label></div><label>{t.time}<select defaultValue="20:00"><option>19:00</option><option>20:00</option><option>21:00</option><option>22:00</option></select></label><button className="primary-cta submit-button" type="submit">{t.confirm}<CalendarDays size={17} /></button></form></>}</div></div>}
    </div>
  );
}

export default App;

// Keep the type available for inline CSS custom properties without adding another dependency.

declare global { namespace React { interface CSSProperties { [key: `--${string}`]: string | number; } } }
