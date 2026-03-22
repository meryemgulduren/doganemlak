/**
 * Sorun / öneri bildirimi — navbar bağlantısı için yer tutucu sayfa.
 * İleride form veya e-posta entegrasyonu eklenebilir.
 */
export default function SorunOneriPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-2xl font-bold text-text-dark mb-2">Sorun / öneri bildirimi</h1>
      <p className="text-text-dark/70 text-sm leading-relaxed mb-6">
        Karşılaştığınız sorunları veya geliştirme önerilerinizi bize iletmek için bu sayfayı
        kullanabilirsiniz. Yakında burada bir iletişim formu yer alacaktır.
      </p>
      <p className="text-sm text-muted">
        Acil durumlarda ofisimizle doğrudan iletişime geçebilirsiniz.
      </p>
    </div>
  );
}
