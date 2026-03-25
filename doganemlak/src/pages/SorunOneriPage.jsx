import { useState } from "react";
import { getToken } from "../api/client";

const API = import.meta.env.VITE_API_URL;

export default function SorunOneriPage() {
  const [type, setType] = useState("TALEP");
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 3);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setResult({ ok: false, msg: "Açıklama alanı boş bırakılamaz." });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("text", text);
      files.forEach((f) => formData.append("images", f));

      const headers = {};
      const tk = getToken();
      if (tk) headers.Authorization = `Bearer ${tk}`;

      const res = await fetch(`${API}/complaints`, {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setResult({ ok: true, msg: "Talebiniz başarıyla gönderildi. Teşekkür ederiz!" });
        setText("");
        setFiles([]);
        setPreviews([]);
      } else {
        setResult({ ok: false, msg: data.message || "Gönderilemedi." });
      }
    } catch {
      setResult({ ok: false, msg: "Sunucuya bağlanılamadı." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-[56rem] mx-auto px-4 sm:px-6 pt-2 pb-8 font-sans bg-background">
      <h1 className="font-montserrat text-[2rem] font-semibold text-black tracking-tight mb-2">
        Talep / Şikayet Formu
      </h1>
      <p className="text-text-dark/70 text-[15px] leading-relaxed mb-6">
        Karşılaştığınız sorunları veya taleplerinizi aşağıdaki formu kullanarak bize iletebilirsiniz.
        Önerileriniz bizim için çok kıymetli; her geri bildiriminizi dikkatle değerlendiriyoruz.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tür seçimi */}
        <div>
          <label className="block text-[15px] font-medium text-text-dark mb-1.5">Tür</label>
          <div className="flex gap-3">
            {[
              { value: "TALEP", label: "Talep / Öneri" },
              { value: "SIKAYET", label: "Şikayet / Sorun" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`px-4 py-2 rounded-lg border text-[15px] font-medium transition-colors ${
                  type === opt.value
                    ? "bg-amber-100/90 text-text-dark border-amber-300/80 hover:bg-amber-200/80 hover:border-amber-300"
                    : "bg-white text-text-dark border-border hover:bg-amber-100/60 hover:border-amber-200/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Açıklama */}
        <div>
          <label htmlFor="complaint-text" className="block text-[15px] font-medium text-text-dark mb-1.5">
            Açıklama
          </label>
          <textarea
            id="complaint-text"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Lütfen açıklayınız..."
            className="w-full rounded-xl border border-border bg-white px-5 py-4 text-base text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-bordeaux/30 resize-none"
          />
        </div>

        {/* Fotoğraf yükleme */}
        <div>
          <label className="block text-[15px] font-medium text-text-dark mb-1.5">
            Fotoğraf Ekle <span className="text-muted font-normal">(en fazla 3)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="block w-full text-base text-muted file:mr-3 file:py-2.5 file:px-5 file:rounded-lg file:border file:border-amber-200 file:text-base file:font-medium file:bg-amber-50 file:text-text-dark hover:file:bg-amber-100 cursor-pointer"
          />
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gönder */}
        <button
          type="submit"
          disabled={sending}
          className="w-full py-3.5 rounded-xl bg-amber-200 text-text-dark font-semibold text-base hover:bg-amber-300 transition-colors disabled:opacity-50"
        >
          {sending ? "Gönderiliyor..." : "Gönder"}
        </button>

        {/* Sonuç */}
        {result && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              result.ok
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {result.msg}
          </div>
        )}
      </form>
    </div>
  );
}
