import axios from "axios";

// Solo para debug - lo borramos después
console.log("API URL:", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
};

export const foodsService = {
  getAll: (search = "") => api.get(`/foods/?search=${search}`),
  getById: (id) => api.get(`/foods/${id}`),
  create: (data) => api.post("/foods/", data),
  update: (id, data) => api.put(`/foods/${id}`, data),
  delete: (id) => api.delete(`/foods/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/foods/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const adminService = {
  getAllUsers: () => api.get("/admin/users"),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createUser: (data) => api.post("/admin/users", data),
  getRecentUsers: () => api.get("/admin/stats/recent-users"),
  getRecentFoods: () => api.get("/admin/stats/recent-foods"),
  getUsersByCountry: () => api.get("/admin/stats/users-by-country"),
};

export const usersService = {
  getStats: () => api.get("/users/stats"),
  getMyFoods: () => api.get("/users/my-foods"),
  getFavorites: () => api.get("/users/favorites"),
  addFavorite: (foodId) => api.post(`/users/favorites/${foodId}`),
  removeFavorite: (foodId) => api.delete(`/users/favorites/${foodId}`),
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
};

export const diaryService = {
  addEntry: (data) => api.post("/diary/", data),
  getDates: () => api.get("/diary/dates"),
  getByDate: (dateStr) => api.get(`/diary/${dateStr}`),
  deleteEntry: (entryId) => api.delete(`/diary/${entryId}`),
};

export const openFoodFactsService = {
  search: async (query) => {
    const params = new URLSearchParams({
      search_terms: query,
      json: "1",
      page_size: "12",
      fields: "product_name,nutriments,image_small_url,brands,quantity",
    });

    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${params}`,
      {
        headers: { "User-Agent": "CarbCounter - Web App - contact@tuapp.com" },
      },
    );

    if (!response.ok) {
      throw new Error(`Error de Open Food Facts: ${response.status}`);
    }

    const data = await response.json();

    const results = (data.products || [])
      .map((product) => {
        const carbs = product.nutriments?.["carbohydrates_100g"];
        const name = product.product_name?.trim();
        if (!name || carbs === undefined || carbs === null) return null;
        if (carbs < 0 || carbs > 100) return null;

        return {
          name,
          carbs_per_100g: Math.round(carbs * 100) / 100,
          image_url: product.image_small_url || null,
          brand: product.brands?.split(",")[0]?.trim() || null,
          quantity: product.quantity || null,
        };
      })
      .filter(Boolean);

    return { results, count: results.length };
  },
};
