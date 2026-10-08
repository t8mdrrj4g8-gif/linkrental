/* LINK RENTAL - shared script for index, property, car, list-property and manager pages.
   Written without newer JavaScript syntax so it also runs inside the Facebook, Instagram and TikTok in-app browsers.

   HOW THE SITE IS UPDATED (no code editing needed):
   manager.html makes four small files: status.json, prices.json, photos.json, settings.json (+ an images folder).
   Upload them to the website and this script applies them on top of the defaults below. */

const STATUS_URL = "status.json";     // booked / available per listing code
const PRICES_URL = "prices.json";     // price per listing code
const PHOTOS_URL = "photos.json";     // photos per listing code
const SETTINGS_URL = "settings.json"; // WhatsApp number, M-Pesa, Facebook / Instagram / TikTok links, site address

/* Defaults. Everything here can be changed from manager.html, so you normally never edit these. */
const DEFAULT_SETTINGS = {
  phone: "255796048479",   // WhatsApp number, country code first, digits only
  contactName: "Adrian",   // name used to greet you in WhatsApp messages
  mpesaNumber: "",         // e.g. "0712 345 678". Leave empty to take payment details over WhatsApp instead
  mpesaName: "",
  facebook: "", instagram: "", tiktok: "",   // full profile links, e.g. https://www.instagram.com/yourname
  siteUrl: ""              // your website address, e.g. https://linkrental.co.tz  (used in share links)
};
const SETTINGS = Object.assign({}, DEFAULT_SETTINGS);

const codeOf = i => "LR-" + (101 + i);   // keep new listings at the END of the list so codes stay the same
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => "TZS " + Number(n).toLocaleString("en-US");
const wa = t => "https://wa.me/" + SETTINGS.phone + "?text=" + encodeURIComponent(t);
const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|musical_ly|TikTok|Bytedance/i.test(navigator.userAgent);

/* ===== Listings: edit or add rows here =====
   [type, name, location, price (TZS), unit, details, main photo, status, optional list of photos]
   Price, status and photos can be overridden from manager.html. */
const LISTINGS = [
  ["property","Modern 3 bedroom house","bonyokwa",1200000,"month","4 bedrooms, 2 bathrooms","photo-1600585154340-be6161a56a0c","available"],
  ["property","Luxury apartment","Masaki",1800000,"month","2 bedrooms, 2 bathrooms","photo-1600607687939-ce8a6c25118c","booked"],
  ["property","Luxury Masaki apartment","Masaki",1500000,"month","2 bedrooms, 2 bathrooms","photo-1600607687920-4e2a09cf159d","available"],
  ["property","Mikocheni executive apartment","Mikocheni",1200000,"month","2 bedrooms, 2 bathrooms","photo-1600566753086-00f18fb6b3ea","available"],
  ["property","Masaki beach Airbnb","Masaki",180000,"night","1 bedroom, 1 bathroom","photo-1505693416388-ac5ce068fe85","available"],
  ["property","Mbezi Beach Airbnb","Mbezi Beach",150000,"night","2 bedrooms, 2 bathrooms","photo-1560185008-b033106af5c3","available"],
  ["property","Modern Sinza apartment","Sinza",700000,"month","2 bedrooms, 1 bathroom","photo-1600210492486-724fe5c67fb0","available"],
  ["property","Executive Mikocheni Airbnb","Mikocheni",200000,"night","2 bedrooms, 2 bathrooms","photo-1600607688969-a5bfcd646154","booked"],
  ["property","Affordable Kimara apartment","Kimara",550000,"month","2 bedrooms, 1 bathroom","photo-1600585154526-990dced4db0d","available"],
  ["property","Premium Masaki stay","Masaki",250000,"night","2 bedrooms, 2 bathrooms","photo-1600566753190-17f0baa2a6c3","available"],
  ["property","Spacious Mbezi Beach apartment","Mbezi Beach",900000,"month","3 bedrooms, 2 bathrooms","photo-1600607687920-4e2a09cf159d","available"],
  ["property","Comfortable Sinza Airbnb","Sinza",120000,"night","1 bedroom, 1 bathroom","photo-1600210491892-03d54c0aaf87","available"],
  ["property","Modern 2 bedroom apartment","Mikocheni",950000,"month","2 bedrooms, 2 bathrooms","photo-1600566753190-17f0baa2a6c3","available"],
  ["property","Family 3 bedroom house","Kimara",650000,"month","3 bedrooms, 2 bathrooms","photo-1600585154526-990dced4db0d","available"],
  ["car","Toyota Harrier","Dar es Salaam",150000,"day","Automatic, 5 seats, petrol","photo-1549317661-bd32c8ce0db2","available"],
  ["car","Toyota Land Cruiser","Masaki",180000,"day","Automatic, 7 seats","photo-1549317661-bd32c8ce0db2","available"],
  ["car","Chevrolet Camaro","Mikocheni",120000,"day","Automatic, 4 seats","photo-1552519507-da3b142c6e3d","available"],
  ["car","Mercedes-Benz C-Class","Mbezi Beach",100000,"day","Automatic, 5 seats","photo-1541899481282-d53bffe3c35d","booked"],
  ["car","Toyota Corolla","Sinza",80000,"day","Automatic, 5 seats","photo-1502877338535-766e1452684a","available"],
  ["car","Ford Mustang","Kimara",70000,"day","Automatic, 4 seats","photo-1494976388531-d1058494cdd8","booked"]
];
LISTINGS.forEach(l => { l.stock = l[6]; });   // remember the stock photo so it can be used if one of your own photos fails to load

const POOL_H = ["photo-1600585154340-be6161a56a0c","photo-1600607687939-ce8a6c25118c","photo-1600607687920-4e2a09cf159d","photo-1600566753086-00f18fb6b3ea","photo-1600210492486-724fe5c67fb0","photo-1600607688969-a5bfcd646154","photo-1600585154526-990dced4db0d","photo-1600566753190-17f0baa2a6c3","photo-1505693416388-ac5ce068fe85","photo-1560185008-b033106af5c3","photo-1600210491892-03d54c0aaf87"];
const POOL_C = ["photo-1549317661-bd32c8ce0db2","photo-1552519507-da3b142c6e3d","photo-1541899481282-d53bffe3c35d","photo-1502877338535-766e1452684a","photo-1494976388531-d1058494cdd8"];

const pic = (p, w) => String(p).indexOf("photo-") === 0 ? "https://images.unsplash.com/" + p + "?auto=format&fit=crop&w=" + w + "&q=70" : p;
const PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='#14243A'/><text x='200' y='158' fill='#C9A24A' font-family='Georgia,serif' font-size='26' text-anchor='middle'>LINK RENTAL</text></svg>");
/* If a photo cannot load: try the listing's stock photo once, then show a plain placeholder. */
function imgFail(img) {
  if (img.dataset.fb && !img.dataset.tried) { img.dataset.tried = "1"; img.src = pic(img.dataset.fb, +img.dataset.w || 800); }
  else { img.onerror = null; img.src = PLACEHOLDER; }
}
const badge = s => '<span class="status ' + s + '"><i></i>' + (s === "booked" ? "Booked" : "Available") + "</span>";

/* Photos for a listing. Until you add real photos, other photos from the same set are shown as placeholders. */
function gallery(l) {
  if (l[8] && l[8].length) return l[8];
  const pool = l[0] === "car" ? POOL_C : POOL_H, k = pool.indexOf(l.stock), out = [l.stock];
  for (let j = 1; out.length < 4 && j <= pool.length; j++) {
    const p = pool[(k + j + pool.length) % pool.length];
    if (out.indexOf(p) < 0) out.push(p);
  }
  return out;
}

const askText = l => l[7] === "booked"
  ? "Hello " + SETTINGS.contactName + ", I see the " + l[1] + " is booked. When will it be available?"
  : "Hello " + SETTINGS.contactName + ", I'm interested in the " + l[1] + ".";

/* Opens a link in a new tab, and falls back to the same tab if an in-app browser blocks pop-ups. */
function openLink(url) {
  const w = window.open(url, "_blank");
  if (!w) location.href = url;
}

/* ===== Loading status.json, prices.json, photos.json, settings.json ===== */
const LIVE = { status: false, photos: false, prices: false, settings: false };   // true when the file was found on the website

async function getJson(url) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return j && typeof j === "object" ? j : null;
  } catch (e) { return null; }
}

function normPhone(s) {
  let d = String(s || "").replace(/\D/g, "");
  if (d.charAt(0) === "0" && d.length === 10) d = "255" + d.slice(1);   // 0796 048 479 -> 255796048479
  return d;
}
const cleanUrl = s => (typeof s === "string" && /^https?:\/\/\S+$/i.test(s.trim())) ? s.trim() : "";

function applySettings(se) {
  if (!se) return;
  const p = normPhone(se.phone);
  if (p.length >= 9) SETTINGS.phone = p;
  if (typeof se.contactName === "string" && se.contactName.trim()) SETTINGS.contactName = se.contactName.trim();
  if (typeof se.mpesaNumber === "string") SETTINGS.mpesaNumber = se.mpesaNumber.trim();
  if (typeof se.mpesaName === "string") SETTINGS.mpesaName = se.mpesaName.trim();
  ["facebook", "instagram", "tiktok", "siteUrl"].forEach(k => { if (k in se) SETTINGS[k] = cleanUrl(se[k]); });
}
function applyStatus(st) {
  if (!st) return;
  LISTINGS.forEach((l, i) => { const v = st[codeOf(i)]; if (v === "available" || v === "booked") l[7] = v; });
}
function applyPrices(pr) {
  if (!pr) return;
  LISTINGS.forEach((l, i) => { const v = Math.round(Number(pr[codeOf(i)])); if (isFinite(v) && v > 0) l[3] = v; });
}
function applyPhotos(ph) {
  if (!ph) return;
  LISTINGS.forEach((l, i) => {
    const list = ph[codeOf(i)];
    if (!Array.isArray(list)) return;
    const ok = list.filter(p => typeof p === "string" && /^(images\/|https?:\/\/)/i.test(p));
    if (ok.length) { l[8] = ok; l[6] = ok[0]; }
  });
}

let dataPromise = null;
function loadData() {
  if (!dataPromise) {
    dataPromise = Promise.all([getJson(STATUS_URL), getJson(PHOTOS_URL), getJson(PRICES_URL), getJson(SETTINGS_URL)]).then(r => {
      LIVE.status = !!r[0]; LIVE.photos = !!r[1]; LIVE.prices = !!r[2]; LIVE.settings = !!r[3];
      applyStatus(r[0]); applyPhotos(r[1]); applyPrices(r[2]); applySettings(r[3]);
    });
  }
  return dataPromise;
}
const loadStatus = loadData;   // old name, kept so nothing else breaks

/* ===== Cards ===== */
function listingPage(i) { return (LISTINGS[i][0] === "car" ? "car.html" : "property.html") + "?id=" + i; }

function card(l) {
  const type = l[0], name = l[1], loc = l[2], price = l[3], unit = l[4], spec = l[5], status = l[7];
  const idx = LISTINGS.indexOf(l), code = codeOf(idx), page = listingPage(idx);
  const where = loc === "Dar es Salaam" ? loc : loc + ", Dar es Salaam";
  const n = gallery(l).length;
  return '<article class="plate reveal' + (status === "booked" ? " is-booked" : "") + '" data-category="' + type + '" data-location="' + esc(loc) + '" data-price="' + price + '" data-unit="' + unit + '" data-status="' + status + '">' +
  '<div class="plate-media"><a href="' + page + '" tabindex="-1" aria-hidden="true"><img src="' + esc(pic(l[6], 800)) + '" data-fb="' + l.stock + '" data-w="800" onerror="imgFail(this)" alt="' + esc(name) + '" loading="lazy"></a>' + badge(status) + '<span class="count">' + n + (n === 1 ? " photo" : " photos") + '</span></div>' +
  '<div class="plate-body">' +
    '<p class="plate-place">' + esc(where) + ' <span class="code">' + code + '</span></p>' +
    '<h3>' + esc(name) + '</h3>' +
    '<p class="plate-spec">' + esc(spec) + '</p>' +
    '<p class="price">' + money(price) + ' <small>per ' + unit + '</small></p>' +
    '<div class="plate-actions">' +
      (status === "booked" ? "" : '<button type="button" class="btn" data-book="' + idx + '">Book now</button>') +
      '<a class="whatsapp-btn" href="' + wa(askText(l)) + '" target="_blank" rel="noopener">' + (status === "booked" ? "Ask about next dates" : "WhatsApp") + '</a>' +
      '<a class="view-btn" href="' + page + '">View details</a>' +
      '<button type="button" class="view-btn" data-share="' + idx + '">Share</button>' +
    '</div>' +
  '</div></article>';
}

/* ===== Detail pages (property.html and car.html) ===== */
function renderDetail() {
  const detail = document.getElementById("detail");
  if (!detail) return;
  const params = new URLSearchParams(location.search);
  const l = params.has("id") ? LISTINGS[+params.get("id")] : LISTINGS.filter(x => x[0] === detail.dataset.type)[0];
  if (!l) {
    document.title = "Listing not found - LINK RENTAL";
    detail.innerHTML = '<div class="details-content"><h1>Listing not found</h1><p>This listing is not available any more. See what we have right now.</p><a class="btn btn-gold" href="index.html#properties">Back to all listings</a></div>';
    observeReveals();
    return;
  }
  const type = l[0], name = l[1], loc = l[2], price = l[3], unit = l[4], spec = l[5], status = l[7], ph = gallery(l);
  const idx = LISTINGS.indexOf(l);
  document.title = name + " - LINK RENTAL";
  const desc = name + ", " + loc + ". " + money(price) + " per " + unit + ". " + spec + ".";
  [["meta[name=description]", desc], ["meta[property='og:title']", name + " - LINK RENTAL"], ["meta[property='og:description']", desc]].forEach(m => {
    const el = document.querySelector(m[0]); if (el) el.setAttribute("content", m[1]);
  });
  detail.innerHTML = '<p><a class="view-btn" href="index.html#' + (type === "car" ? "cars" : "properties") + '">&larr; All ' + (type === "car" ? "cars" : "properties") + '</a></p>' +
    '<div class="gallery"><div class="gallery-main"><img id="gMain" src="' + esc(pic(ph[0], 1400)) + '" data-fb="' + l.stock + '" data-w="1400" onerror="imgFail(this)" alt="' + esc(name) + '">' +
    '<button class="g-prev" aria-label="Previous photo">&#8249;</button><button class="g-next" aria-label="Next photo">&#8250;</button>' + badge(status) + '</div>' +
    '<div class="thumbs">' + ph.map((p, k) => '<button class="thumb' + (k ? "" : " on") + '" aria-label="Show photo ' + (k + 1) + '"><img src="' + esc(pic(p, 240)) + '" data-fb="' + l.stock + '" data-w="240" onerror="imgFail(this)" alt=""></button>').join("") + '</div></div>' +
    '<div class="details-content"><p class="location">' + esc(loc === "Dar es Salaam" ? loc : loc + ", Dar es Salaam") + '</p><h1>' + esc(name) + '</h1><p class="plate-code">Booking code ' + codeOf(idx) + '</p>' +
    '<p class="price">' + money(price) + ' <small>per ' + unit + '</small></p><p>' + esc(spec) + '</p>' +
    '<p>' + (status === "booked" ? "This one is booked at the moment. Message us to ask when it will be free." : "This one is available now.") + '</p>' +
    '<div class="plate-actions">' + (status === "booked" ? "" : '<button type="button" class="btn" data-book="' + idx + '">Book now</button>') +
    '<a class="whatsapp-btn" href="' + wa(askText(l)) + '" target="_blank" rel="noopener">' + (status === "booked" ? "Ask about next dates" : "Ask about this " + (type === "car" ? "car" : "property")) + '</a>' +
    '<button type="button" class="view-btn" data-share="' + idx + '">Share</button></div></div>';
  const main = document.getElementById("gMain"), thumbs = [].slice.call(detail.querySelectorAll(".thumb"));
  let cur = 0;
  const show = k => {
    cur = (k + ph.length) % ph.length;
    main.classList.add("swap");
    setTimeout(() => { main.dataset.tried = ""; main.src = pic(ph[cur], 1400); main.classList.remove("swap"); }, 200);
    thumbs.forEach((t, i) => t.classList.toggle("on", i === cur));
  };
  thumbs.forEach((t, i) => t.addEventListener("click", () => show(i)));
  detail.querySelector(".g-prev").addEventListener("click", () => show(cur - 1));
  detail.querySelector(".g-next").addEventListener("click", () => show(cur + 1));
  let x0 = null;   // swipe on phones
  main.parentNode.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  main.parentNode.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
  });
  document.addEventListener("keydown", e => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || dlg.open || shareDlg.open) return;
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
  observeReveals();
}

function renderHome() {
  const propertyGrid = document.getElementById("propertyGrid"), carGrid = document.getElementById("carGrid");
  if (!propertyGrid || !carGrid) return;
  propertyGrid.innerHTML = LISTINGS.filter(l => l[0] === "property").map(card).join("");
  carGrid.innerHTML = LISTINGS.filter(l => l[0] === "car").map(card).join("");
  observeReveals();
}

/* ===== Settings shown on the page: WhatsApp links, phone number, social links, year ===== */
function prettyPhone(d) {
  return /^255\d{9}$/.test(d) ? "+255 " + d.slice(3, 6) + " " + d.slice(6, 9) + " " + d.slice(9) : "+" + d;
}
function renderSettings() {
  document.querySelectorAll("[data-wa]").forEach(a => { a.href = wa(a.dataset.wa); });
  document.querySelectorAll("[data-phone]").forEach(el => { el.textContent = prettyPhone(SETTINGS.phone); });
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
  const names = [["facebook", "Facebook"], ["instagram", "Instagram"], ["tiktok", "TikTok"]];
  document.querySelectorAll("[data-social]").forEach(el => {
    const html = names.filter(n => SETTINGS[n[0]]).map(n => '<a href="' + esc(SETTINGS[n[0]]) + '" target="_blank" rel="noopener">' + n[1] + "</a>").join("");
    el.innerHTML = html;
    el.hidden = !html;
  });
}

async function render() {
  await loadData();
  renderSettings();
  renderDetail();
  renderHome();
  observeReveals();
}

/* ===== Search ===== */
const val = id => { const el = document.getElementById(id); return el ? el.value : "all"; };

function applyFilter() {
  const c = val("category"), l = val("location"), b = val("budget"), u = val("period"), st = val("status");
  let found = 0;
  document.querySelectorAll(".plate").forEach(p => {
    const d = p.dataset;
    const ok = (c === "all" || d.category === c) && (l === "all" || d.location === l) && (b === "all" || +d.price <= +b) && (u === "all" || d.unit === u) && (st === "all" || d.status === st);
    p.style.display = ok ? "" : "none";
    if (ok) found++;
  });
  document.querySelectorAll(".listings").forEach(s => {
    s.style.display = [].some.call(s.querySelectorAll(".plate"), p => p.style.display !== "none") ? "" : "none";
  });
  document.getElementById("noResults").hidden = found > 0;
  return found;
}

function searchListings() {
  applyFilter();
  const first = [].filter.call(document.querySelectorAll(".listings"), s => s.style.display !== "none")[0];
  (first || document.getElementById("noResults")).scrollIntoView({ behavior: "smooth" });
}

function showAllListings() {
  ["category", "location", "budget", "period", "status"].forEach(id => { const el = document.getElementById(id); if (el) el.value = "all"; });
  applyFilter();
}

/* ===== Scroll effects ===== */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const bar = document.createElement("div");
bar.className = "progress";
document.body.insertBefore(bar, document.body.firstChild);
const nav = document.querySelector("nav");
const heroBg = document.querySelector(".hero-bg");
let ticking = false;

function onScroll() {
  const y = window.pageYOffset, max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
  if (nav) nav.classList.toggle("scrolled", y > 30);
  if (heroBg && !reduce && y < window.innerHeight * 1.2) heroBg.style.transform = "translate3d(0," + (y * 0.3) + "px,0)";
  ticking = false;
}
addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

/* Some in-app browsers have no IntersectionObserver. Then everything is simply shown. */
const HAS_IO = "IntersectionObserver" in window;
const reveal = HAS_IO ? new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); }
  });
}, { threshold: 0.12 }) : null;
function observeReveals() {
  document.querySelectorAll(".reveal,.details-content>*,.gallery,.form-container").forEach(el => {
    el.classList.add("reveal");
    if (reveal) reveal.observe(el); else el.classList.add("in");
  });
}

if (HAS_IO) {
  const navLinks = [].slice.call(document.querySelectorAll(".nav-links a"));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("#top,#properties,#cars,#contact").forEach(s => spy.observe(s));
}

/* ===== Button effects: click ripple and magnetic pull ===== */
document.addEventListener("click", e => {
  const b = e.target.closest(".btn,.whatsapp-btn,.owner-btn,.finder button,.form-container button");
  if (!b || b.classList.contains("view-btn")) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
  const o = document.createElement("span");
  o.className = "ripple";
  o.style.cssText = "width:" + s + "px;height:" + s + "px;left:" + (e.clientX - r.left - s / 2) + "px;top:" + (e.clientY - r.top - s / 2) + "px";
  b.appendChild(o);
  setTimeout(() => o.remove(), 700);
});

if (!reduce) {
  document.querySelectorAll(".magnetic").forEach(m => {
    m.addEventListener("mousemove", e => {
      const r = m.getBoundingClientRect();
      m.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28) + "px)";
    });
    m.addEventListener("mouseleave", () => { m.style.transform = ""; });
  });
}

/* ===== List-your-property form: sends details to WhatsApp ===== */
const ownerForm = document.getElementById("ownerForm");
if (ownerForm) {
  ownerForm.addEventListener("submit", e => {
    e.preventDefault();
    const g = id => document.getElementById(id).value;
    const text = "Hello LINK RENTAL,\n\nI would like to list my property/vehicle.\n\n" +
      "Name: " + g("ownerName") + "\nPhone: " + g("ownerPhone") + "\nType: " + g("listingType") + "\n" +
      "Listing: " + g("listingName") + "\nLocation: " + g("listingLocation") + "\nPrice: " + g("listingPrice") + "\n" +
      "Description: " + g("description");
    openLink(wa(text));
    const msg = document.getElementById("formMessage");
    if (msg) msg.textContent = "WhatsApp is opening with your details. Please attach your photos in the chat.";
  });
}

/* ===== Booking: customer pays by M-Pesa (if you set a number) or waits for your payment details, then sends details on WhatsApp ===== */
const dlg = document.createElement("dialog");
dlg.className = "book";
document.body.appendChild(dlg);

function localDate() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function openBook(i) {
  const l = LISTINGS[i], code = codeOf(i), unit = l[4], today = localDate(), pay = !!SETTINGS.mpesaNumber;
  if (!dlg.showModal) {   // very old browsers: skip the form and talk on WhatsApp
    openLink(wa("Hello " + SETTINGS.contactName + ", I would like to book " + l[1] + " (" + code + ")."));
    return;
  }
  dlg.innerHTML = '<form class="book-form" id="bookForm">' +
    '<button type="button" class="book-close" aria-label="Close">&times;</button>' +
    '<h2>Book ' + esc(l[1]) + '</h2>' +
    '<p class="book-code">Booking code ' + code + '</p>' +
    '<ol class="book-steps">' + (pay
      ? '<li>Send <strong id="bAmt"></strong> by M-Pesa to <strong>' + esc(SETTINGS.mpesaNumber) + '</strong>' + (SETTINGS.mpesaName ? " (" + esc(SETTINGS.mpesaName) + ")" : "") + '. Use <strong>' + code + '</strong> as the reference.</li>' +
        '<li>Fill in the form below, including the transaction ID from your M-Pesa message.</li>' +
        '<li>Send it to us on WhatsApp. We confirm your payment and mark the listing as booked.</li>'
      : '<li>Fill in the form below. The total is <strong id="bAmt"></strong>.</li>' +
        '<li>Send it to us on WhatsApp.</li>' +
        '<li>We reply with the payment details and confirm your booking.</li>') + '</ol>' +
    '<label>Your name<input id="bName" required autocomplete="name"></label>' +
    '<label>Phone number<input id="bPhone" type="tel" required autocomplete="tel"></label>' +
    '<label>Start date<input id="bDate" type="date" min="' + today + '" required></label>' +
    '<label>Number of ' + unit + 's<input id="bUnits" type="number" min="1" value="1" required></label>' +
    (pay ? '<label>M-Pesa transaction ID<input id="bTx" required></label>' : "") +
    '<p class="book-note">The amount is the price times the number of ' + unit + 's. Ask us about any deposit before you pay.</p>' +
    '<button class="btn btn-gold" type="submit"><span class="btn-roll"><span data-text="Send details on WhatsApp">Send details on WhatsApp</span></span></button>' +
  '</form>';
  const units = dlg.querySelector("#bUnits"), amt = dlg.querySelector("#bAmt");
  const count = () => Math.max(1, Math.floor(+units.value) || 1);
  const total = () => count() * l[3];
  const upd = () => { amt.textContent = money(total()); };
  units.addEventListener("input", upd);
  upd();
  dlg.querySelector(".book-close").addEventListener("click", () => dlg.close());
  dlg.querySelector("#bookForm").addEventListener("submit", e => {
    e.preventDefault();
    const g = id => dlg.querySelector(id).value;
    const n = count();
    const lines = ["Name: " + g("#bName"), "Phone: " + g("#bPhone"), "Start date: " + g("#bDate"), "Length: " + n + " " + unit + (n > 1 ? "s" : ""),
      (pay ? "Amount paid: " : "Total amount: ") + money(total())];
    if (pay) lines.push("M-Pesa transaction ID: " + g("#bTx"));
    openLink(wa("Hello " + SETTINGS.contactName + ", I " + (pay ? "have booked and paid for " : "would like to book ") + l[1] + " (" + code + ").\n\n" + lines.join("\n")));
    dlg.close();
  });
  dlg.showModal();
}

/* ===== Sharing: Facebook, WhatsApp, Instagram, TikTok ===== */
const shareDlg = document.createElement("dialog");
shareDlg.className = "book";
document.body.appendChild(shareDlg);

function listingUrl(i) {
  const base = SETTINGS.siteUrl ? SETTINGS.siteUrl.replace(/\/+$/, "") + "/" : new URL(".", location.href).href;
  return base + listingPage(i);
}

function copyText(t) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
  return new Promise((ok, no) => {
    const ta = document.createElement("textarea");
    ta.value = t; ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy") ? ok() : no(); } catch (e) { no(e); }
    ta.remove();
  });
}

function showShare(title, text, url) {
  const u = encodeURIComponent(url);
  shareDlg.innerHTML = '<div class="book-form">' +
    '<button type="button" class="book-close" aria-label="Close">&times;</button>' +
    '<h2>Share</h2><p class="book-code">' + esc(title) + '</p>' +
    '<div class="share-grid">' +
      '<a class="share-opt" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '" target="_blank" rel="noopener">Facebook</a>' +
      '<a class="share-opt" href="https://wa.me/?text=' + encodeURIComponent(text + " " + url) + '" target="_blank" rel="noopener">WhatsApp</a>' +
      '<button type="button" class="share-opt" data-copy="Instagram">Instagram</button>' +
      '<button type="button" class="share-opt" data-copy="TikTok">TikTok</button>' +
      '<button type="button" class="share-opt" data-copy="">Copy link</button>' +
    '</div>' +
    '<p class="book-note" id="shMsg" role="status">Instagram and TikTok do not take links from websites, so we copy the link and you paste it into your story, bio or message.</p>' +
  '</div>';
  shareDlg.querySelector(".book-close").addEventListener("click", () => shareDlg.close());
  [].forEach.call(shareDlg.querySelectorAll("[data-copy]"), b => b.addEventListener("click", () => {
    const where = b.dataset.copy, msg = shareDlg.querySelector("#shMsg");
    copyText(url).then(
      () => { msg.textContent = where ? "Link copied. Open " + where + " and paste it in your story, bio or message." : "Link copied."; },
      () => { msg.textContent = "Could not copy. Select and copy this link: " + url; }
    );
  }));
  if (shareDlg.showModal) shareDlg.showModal();
  else openLink("https://www.facebook.com/sharer/sharer.php?u=" + u);
}

function openShare(i) {
  const l = LISTINGS[i], url = listingUrl(i);
  const text = l[1] + ", " + l[2] + " - " + money(l[3]) + " per " + l[4] + " | LINK RENTAL";
  /* On phones the share sheet already lists Facebook, Instagram, TikTok, WhatsApp and the rest. */
  if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    navigator.share({ title: l[1], text: text, url: url }).catch(err => { if (!err || err.name !== "AbortError") showShare(l[1], text, url); });
  } else showShare(l[1], text, url);
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-book]"), s = e.target.closest("[data-share]");
  if (b) { e.preventDefault(); openBook(+b.dataset.book); }
  else if (s) { e.preventDefault(); openShare(+s.dataset.share); }
  else if (e.target === dlg) dlg.close();
  else if (e.target === shareDlg) shareDlg.close();
});

render();
