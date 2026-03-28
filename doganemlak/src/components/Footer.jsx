import { Link } from "react-router-dom";
import { SAMSUN_NAV_LINKS } from "../constants/samsunNavLinks";
import logoImg from "../assets/logo.png";
import sahibindenLogo from "../assets/sahibinden.png";
import emlakjetLogo from "../assets/emlakjet.png";
import hepsiemlakLogo from "../assets/hepsiemlak.png";
import { Instagram, Phone, MessageCircle, Heart, MapPin } from "lucide-react";
import okImg from "../assets/ok.png";

export default function Footer() {
  const partnerItems = [
    {
      href: "https://www.hepsiemlak.com/emlak-ofisi/dogan-emlak-group-160279",
      label: "hepsiemlak",
      img: hepsiemlakLogo,
      alt: "hepsiemlak",
    },
    {
      href: "https://doganemlakgroup.sahibinden.com/",
      label: "sahibinden",
      img: sahibindenLogo,
      alt: "sahibinden",
    },
    {
      href: "https://www.emlakjet.com/emlak-ofisleri-detay/dogan-emlak-group-1746241",
      label: "emlakjet",
      img: emlakjetLogo,
      alt: "emlakjet",
    },
  ];

  return (
    <footer className="bg-white border-t border-border/70">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center w-24 h-24 p-0 bg-black rounded-full sm:w-28 sm:h-28 sm:p-0"
                >
                  <img
                    src={logoImg}
                    alt="Doğan Emlak Group"
                    className="h-full w-full object-contain max-w-full"
                  />
                </Link>

                <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-text-dark">
                  <Link to="/hakkimizda" className="hover:underline">
                    Hakkımızda
                  </Link>
                  <Link to="/gayrimenkul-danismanlar" className="hover:underline">
                    Danışmanlarımız
                  </Link>
                  <Link to="/sorun-oneri" className="hover:underline">
                    Talep / Şikayet
                  </Link>
                  <Link to="/ilanlar" className="hover:underline">
                    İlanlar
                  </Link>
                </nav>
              </div>

              <nav
                aria-label="Samsun ilan kategorileri"
                className="hidden sm:flex w-full flex-col gap-1 pt-4 border-t border-border/50 text-sm font-semibold text-text-dark tracking-wide"
              >
                {SAMSUN_NAV_LINKS.map(({ to, label }) => (
                  <Link key={to} to={to} className="hover:underline">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <p className="mt-6 text-sm text-muted max-w-2xl leading-relaxed">
              Doğan Emlak Group ile güvenilir emlak danışmanlığı. Kiralık ve satılık ilanları
              inceleyin, ihtiyacınıza uygun seçeneklere hızlıca ulaşın.
            </p>

            <div className="mt-4 flex items-center text-[#F4C542] tracking-tight">
              <span
                className="text-lg sm:text-xl font-extrabold italic leading-tight"
                style={{ fontFamily: '"Georgia","Times New Roman",serif' }}
              >
                HAYALDE KALMASIN BİZ GERÇEKLEŞTİRELİM
              </span>
            </div>

            <div className="mt-6 text-xs text-muted">
              © {new Date().getFullYear()} Doğan Emlak Group. Tüm hakları saklıdır.
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-border bg-white p-6">
              <img
                src={okImg}
                alt="ok"
                className="absolute top-2 right-2 w-24 h-24 sm:top-0.5 sm:right-4 sm:w-32 sm:h-32 object-contain pointer-events-none"
              />
              <h3 className="font-montserrat text-base font-semibold text-text-dark tracking-tight">
                Bize Her Yerden Ulaşın
              </h3>
              <div className="mt-4 flex flex-wrap gap-3 pr-20 sm:pr-0">
                {partnerItems.map((p) => (
                  <a
                    key={p.label}
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={p.label}
                    className="w-16 h-14 rounded-lg border border-border bg-white shadow-sm flex items-center justify-center hover:bg-amber-50 hover:border-amber-200 transition-colors"
                  >
                    <img
                      src={p.img}
                      alt={p.alt}
                      className="max-w-[70%] max-h-[70%] object-contain"
                    />
                  </a>
                ))}

                <a
                  href="https://www.instagram.com/doganemlakgroup1?igsh=MTU3OHF6eGRkend3bQ%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="instagram"
                  className="w-16 h-14 rounded-lg border border-border bg-white shadow-sm flex items-center justify-center hover:bg-amber-50 hover:border-amber-200 transition-colors"
                >
                  <Instagram className="w-7 h-7 text-[#E1306C]" />
                </a>

                <a
                  href="https://whatsapp.com/channel/0029Vaa9RAm7IUYcJfDQlF47"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="whatsapp"
                  className="w-16 h-14 rounded-lg border border-[#25D366] bg-[#25D366] shadow-sm flex items-center justify-center hover:bg-[#1EBE57] transition-colors"
                >
                  <div className="relative w-10 h-10">
                    <MessageCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                    <Phone className="absolute inset-0 m-auto w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </a>
              </div>
              <div className="mt-4 text-sm text-muted leading-relaxed">
                Kurumsal ilan sayfalarımız ve iletişim kanallarımız üzerinden bize ulaşabilirsiniz.
              </div>

              <div className="mt-2 text-sm text-[#25D366] flex items-center gap-2 leading-relaxed">
                <Heart className="w-4 h-4 text-red-600" fill="currentColor" />
                Yeni ilanlardan ilk sizin haberiniz olması için WhatsApp grubumuza
                katılmayı unutmayın
              </div>

              {/* Bizimle Tanışın / Adres */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="font-montserrat text-base font-semibold text-text-dark tracking-tight flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-bordeaux" />
                  Bizimle Tanışın
                </h3>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Tepecik+mahallesi+Gebi+caddesi+310/b+no:20+İLKADIM/SAMSUN+DOĞAN+EMLAK+GROUP"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block text-sm text-muted hover:text-bordeaux transition-colors leading-relaxed"
                >
                  Tepecik mahallesi Gebi caddesi 310/b no:20
                  <br />
                  İLKADIM / SAMSUN
                  <br />
                  <span className="font-bold text-text-dark">DOĞAN EMLAK GROUP</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

