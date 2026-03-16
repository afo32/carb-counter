import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { foodsService } from "../services/api";
import styles from "./EditFood.module.css";

export default function EditFood() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileRef = useRef(null);

  const [formData, setFormData] = useState({ name: "", carbs_per_100g: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const loadFood = async () => {
      try {
        const res = await foodsService.getById(id);
        const food = res.data;
        setFormData({ name: food.name, carbs_per_100g: food.carbs_per_100g });
        if (food.image_url) setImagePreview(food.image_url);
      } catch {
        setError("No se pudo cargar el alimento.");
      } finally {
        setLoading(false);
      }
    };
    loadFood();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      let image_url = imagePreview;
      if (imageFile) {
        const uploadRes = await foodsService.uploadImage(imageFile);
        image_url = uploadRes.data.image_url;
      }
      await foodsService.update(id, {
        name: formData.name,
        carbs_per_100g: parseFloat(formData.carbs_per_100g),
        image_url,
      });
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const carbsValue = parseFloat(formData.carbs_per_100g) || 0;

  if (loading)
    return (
      <div className={styles.center}>
        <span style={{ fontSize: "2rem" }}>🌿</span>
        <span>Cargando alimento...</span>
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <h1 className={styles.bannerTitle}>✏️ Editar alimento</h1>
        <div className={styles.breadcrumb}>
          <Link to="/">{t("common.home")}</Link>
          <span>/</span>
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            Alimentos
          </Link>
          <span>/</span>
          <span>Editar</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.imageCol}>
          <div className={styles.imageWrap}>
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={styles.imagePreview}
                />
                <button
                  type="button"
                  className={styles.imageRemoveBtn}
                  onClick={handleRemoveImage}
                  title="Quitar imagen"
                >
                  ✕
                </button>
              </>
            ) : (
              <div className={styles.imagePlaceholder}>🥗</div>
            )}
          </div>

          <label className={styles.imageUploadLabel}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className={styles.imageInput}
              onChange={handleImageChange}
            />
            <span className={styles.imageUploadBtn}>
              📷 {imagePreview ? "Cambiar imagen" : "Subir imagen"}
            </span>
          </label>
          <span className={styles.imageHint}>
            Dejá vacío para mantener la imagen actual.
          </span>
        </div>

        <div className={styles.formCol}>
          <h2 className={styles.sectionTitle}>Editar alimento</h2>
          <p className={styles.sectionSubtitle}>
            Modificá el nombre, los carbohidratos o la imagen del alimento.
          </p>

          {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Nombre del alimento <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Arroz blanco cocido"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Carbohidratos por 100g{" "}
                <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className={styles.input}
                value={formData.carbs_per_100g}
                onChange={(e) =>
                  setFormData({ ...formData, carbs_per_100g: e.target.value })
                }
                required
              />
              <span className={styles.inputHint}>
                Gramos de carbohidratos cada 100g de alimento (0–100)
              </span>

              {carbsValue > 0 && (
                <div className={styles.carbsPreview}>
                  <span className={styles.carbsPreviewLabel}>
                    🌾 Por cada 100g tenés:
                  </span>
                  <span className={styles.carbsPreviewValue}>
                    {carbsValue}g carbs
                  </span>
                </div>
              )}
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className={styles.btnSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : t("common.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
