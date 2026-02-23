import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import * as auth from "./server/auth.js";
import * as news from "./server/news.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up uploads directory
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  
  const decoded = auth.verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Invalid token" });
  
  req.user = decoded;
  next();
};

// --- API Routes ---

// Auth
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    await auth.registerReporter(username, email, password);
    res.json({ message: "Registered successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await auth.loginReporter(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// News (Public)
app.get("/api/news", (req, res) => {
  const filters = req.query;
  const result = news.getNews(filters);
  res.json(result);
});

app.get("/api/news/:id", (req, res) => {
  const result = news.getNewsById(Number(req.params.id));
  if (!result) return res.status(404).json({ error: "News not found" });
  res.json(result);
});

// News (Protected)
app.get("/api/admin/news", authenticate, (req, res) => {
  const result = news.getAdminNews();
  res.json(result);
});

app.post("/api/news", authenticate, upload.single("image"), async (req: any, res) => {
  try {
    const { title, content, base_language, coverage, category, published } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Auto-translate
    const translations = await news.translateNews(title, content, base_language);
    
    const result = news.createNews({
      base_language,
      ...translations,
      coverage,
      category,
      image_url: imageUrl,
      published: published === "true" ? 1 : 0,
      reporter_id: req.user.id
    });
    
    res.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/news/:id", authenticate, upload.single("image"), async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content, base_language, coverage, category, published, existing_image } = req.body;
    
    let imageUrl = existing_image;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Check if content changed to re-translate
    const current = news.getNewsById(id) as any;
    let translations = {
      title_en: current.title_en, title_hi: current.title_hi, title_mr: current.title_mr,
      content_en: current.content_en, content_hi: current.content_hi, content_mr: current.content_mr
    };

    if (title !== current[`title_${base_language}`] || content !== current[`content_${base_language}`]) {
      translations = await news.translateNews(title, content, base_language);
    }

    news.updateNews(id, {
      ...translations,
      coverage,
      category,
      image_url: imageUrl,
      published: published === "true" ? 1 : 0
    });
    
    res.json({ message: "Updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/news/:id", authenticate, (req, res) => {
  news.deleteNews(Number(req.params.id));
  res.json({ message: "Deleted successfully" });
});

// --- Vite Integration ---
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
