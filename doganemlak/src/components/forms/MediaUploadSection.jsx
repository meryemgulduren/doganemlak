import { useState } from "react";
import { uploadImage, uploadVideo } from "../../api/admin";

export default function MediaUploadSection({ media, onChange }) {
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [error, setError] = useState(null);

  const images = media?.images || [];
  const videos = media?.videos || [];

  const handleImageFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    if (images.length + files.length > 20) {
      setError("En fazla 20 adet fotoğraf yükleyebilirsiniz.");
      return;
    }

    setError(null);
    setImageUploading(true);
    const newImages = [...images];

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const url = await uploadImage(file);
        newImages.push(url);
      } catch (err) {
        setError(err.message || "Resim yükleme başarısız.");
      }
    }

    onChange({ ...media, images: newImages });
    setImageUploading(false);
    e.target.value = "";
  };

  const handleVideoFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (videos.length + files.length > 5) {
      setError("En fazla 5 adet video yükleyebilirsiniz.");
      return;
    }

    setError(null);
    setVideoUploading(true);
    const newVideos = [...videos];

    for (const file of files) {
      if (!file.type.startsWith("video/")) continue;
      try {
        const url = await uploadVideo(file);
        newVideos.push(url);
      } catch (err) {
        setError(err.message || "Video yükleme başarısız. Maksimum 50MB sınırını kontrol edin.");
      }
    }

    onChange({ ...media, videos: newVideos });
    setVideoUploading(false);
    e.target.value = "";
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange({ ...media, images: newImages });
  };

  const removeVideo = (index) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    onChange({ ...media, videos: newVideos });
  };

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm px-4 py-4 space-y-4 mb-4">
      <header className="flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-secondary flex-shrink-0" />
        <h3 className="text-base font-semibold text-slate-600">Medya Yönetimi</h3>
      </header>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fotoğraflar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text-dark">Fotoğraflar ({images.length}/20)</h4>
            <label className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              images.length >= 20 || imageUploading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-accent text-primary hover:bg-primary hover:text-white'
            }`}>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageFileSelect}
                disabled={images.length >= 20 || imageUploading}
              />
              {imageUploading ? "Yükleniyor..." : "Fotoğraf Seç"}
            </label>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[140px] flex flex-wrap gap-2">
            {images.length === 0 ? (
              <div className="w-full text-center text-xs text-gray-400 mt-10">Henüz fotoğraf yüklenmedi</div>
            ) : (
              images.map((url, idx) => (
                <div key={idx} className="relative group w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                  <img src={url} alt="ilan_foto" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    Kaldır
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Videolar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text-dark">Videolar ({videos.length}/5)</h4>
            <label className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              videos.length >= 5 || videoUploading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-accent text-primary hover:bg-primary hover:text-white'
            }`}>
              <input 
                type="file" 
                multiple 
                accept="video/*" 
                className="hidden" 
                onChange={handleVideoFileSelect}
                disabled={videos.length >= 5 || videoUploading}
              />
              {videoUploading ? "Yükleniyor..." : "Video Seç"}
            </label>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[140px] flex flex-wrap gap-2">
            {videos.length === 0 ? (
              <div className="w-full text-center text-xs text-gray-400 mt-10">Henüz video yüklenmedi</div>
            ) : (
              videos.map((url, idx) => (
                <div key={idx} className="relative group w-32 h-20 rounded-md overflow-hidden border border-gray-200 bg-black">
                  <video src={url} className="w-full h-full object-contain" muted />
                  <button
                    type="button"
                    onClick={() => removeVideo(idx)}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-xs"
                  >
                    <span>Kaldır</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
