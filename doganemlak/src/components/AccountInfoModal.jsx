import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

function formatRegisterDate(createdAt) {
  if (!createdAt) return "—";
  try {
    return new Date(createdAt).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/**
 * Giriş yapmış kullanıcı için kullanıcı adı, e-posta ve kayıt tarihi gösterir.
 */
export default function AccountInfoModal({ open, onClose, user }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !user) return null;

  const username = user.username ?? "—";
  const email = user.email ?? "—";
  const registered = formatRegisterDate(user.createdAt);

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 border border-border relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-lg text-text-dark/60 hover:bg-accent/20 hover:text-text-dark transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 id="account-modal-title" className="text-lg font-bold text-text-dark pr-10 mb-4">
          Hesap bilgilerim
        </h2>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-text-dark/60 uppercase tracking-wide mb-1">
              Kullanıcı adı
            </dt>
            <dd className="text-text-dark font-medium break-all">{username}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-text-dark/60 uppercase tracking-wide mb-1">
              E-posta
            </dt>
            <dd className="text-text-dark font-medium break-all">{email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-text-dark/60 uppercase tracking-wide mb-1">
              Kayıt tarihi
            </dt>
            <dd className="text-text-dark font-medium">{registered}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-bordeaux text-white text-sm font-medium hover:bg-bordeaux/90 transition-colors"
        >
          Tamam
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
