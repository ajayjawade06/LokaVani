import { GoogleGenAI } from "@google/genai";
import db from "./db.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function translateNews(title: string, content: string, fromLang: string) {
  const targetLangs = ["en", "hi", "mr"].filter(l => l !== fromLang);
  const results: any = {
    [`title_${fromLang}`]: title,
    [`content_${fromLang}`]: content
  };

  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found, skipping translation");
    return results;
  }

  for (const lang of targetLangs) {
    try {
      const langName = lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Marathi";
      const prompt = `Translate the following news title and content into ${langName}. 
      Return the translation in JSON format with keys "title" and "content".
      
      Title: ${title}
      Content: ${content}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const translated = JSON.parse(response.text || "{}");
      results[`title_${lang}`] = translated.title || title;
      results[`content_${lang}`] = translated.content || content;
    } catch (error) {
      console.error(`Translation to ${lang} failed:`, error);
      results[`title_${lang}`] = title;
      results[`content_${lang}`] = content;
    }
  }

  return results;
}

export function getNews(filters: any) {
  let query = "SELECT * FROM news WHERE published = 1";
  const params: any[] = [];

  if (filters.coverage) {
    query += " AND coverage = ?";
    params.push(filters.coverage);
  }

  if (filters.search) {
    query += " AND (title_en LIKE ? OR title_hi LIKE ? OR title_mr LIKE ?)";
    const searchParam = `%${filters.search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += " ORDER BY created_at DESC";
  return db.prepare(query).all(...params);
}

export function getAdminNews() {
  return db.prepare("SELECT * FROM news ORDER BY created_at DESC").all();
}

export function getNewsById(id: number) {
  return db.prepare("SELECT * FROM news WHERE id = ?").get(id);
}

export function createNews(data: any) {
  const { 
    base_language, title_en, title_hi, title_mr, 
    content_en, content_hi, content_mr, 
    coverage, category, image_url, published, reporter_id 
  } = data;

  const stmt = db.prepare(`
    INSERT INTO news (
      base_language, title_en, title_hi, title_mr, 
      content_en, content_hi, content_mr, 
      coverage, category, image_url, published, reporter_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    base_language, title_en, title_hi, title_mr, 
    content_en, content_hi, content_mr, 
    coverage, category, image_url, published, reporter_id
  );
}

export function updateNews(id: number, data: any) {
  const { 
    title_en, title_hi, title_mr, 
    content_en, content_hi, content_mr, 
    coverage, category, image_url, published 
  } = data;

  const stmt = db.prepare(`
    UPDATE news SET 
      title_en = ?, title_hi = ?, title_mr = ?, 
      content_en = ?, content_hi = ?, content_mr = ?, 
      coverage = ?, category = ?, image_url = ?, published = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  return stmt.run(
    title_en, title_hi, title_mr, 
    content_en, content_hi, content_mr, 
    coverage, category, image_url, published, id
  );
}

export function deleteNews(id: number) {
  return db.prepare("DELETE FROM news WHERE id = ?").run(id);
}
