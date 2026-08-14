/**
 * News Service
 */

import { query, queryOne, execute } from '../db';

export const newsService = {
  async getNews(category?: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    let where = 'WHERE is_published = true';

    if (category) {
      params.push(category);
      where += ` AND category = $${params.length}`;
    }

    const total = (await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM news ${where}`, params
    ))?.count || '0';

    params.push(limit, offset);
    const news = await query(
      `SELECT * FROM news ${where}
       ORDER BY is_featured DESC, published_at DESC NULLS LAST, created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      news: news.map((n: any) => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        summary: n.summary,
        content: n.content,
        category: n.category,
        imageUrl: n.image_url,
        author: n.author,
        tags: n.tags,
        isFeatured: n.is_featured,
        views: n.views,
        readTime: n.read_time,
        publishedAt: n.published_at,
      })),
      total: parseInt(total),
    };
  },

  async getNewsBySlug(slug: string): Promise<any | null> {
    const news = await queryOne<any>(
      'SELECT * FROM news WHERE slug = $1 AND is_published = true',
      [slug]
    );
    if (!news) return null;

    await execute('UPDATE news SET views = views + 1 WHERE id = $1', [news.id]);

    return {
      id: news.id,
      title: news.title,
      slug: news.slug,
      summary: news.summary,
      content: news.content,
      category: news.category,
      imageUrl: news.image_url,
      author: news.author,
      tags: news.tags,
      isFeatured: news.is_featured,
      views: news.views + 1,
      readTime: news.read_time,
      publishedAt: news.published_at,
    };
  },

  async createNews(data: {
    title: string;
    slug: string;
    summary?: string;
    content?: string;
    category?: string;
    imageUrl?: string;
    author?: string;
    tags?: string[];
    isFeatured?: boolean;
    publishedAt?: string;
  }): Promise<string | null> {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO news (title, slug, summary, content, category, image_url, author, tags, is_featured, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        data.title,
        data.slug,
        data.summary || null,
        data.content || null,
        data.category || 'vgreen',
        data.imageUrl || null,
        data.author || null,
        data.tags || null,
        data.isFeatured || false,
        data.publishedAt || null,
      ]
    );
    return result?.id || null;
  },

  async updateNews(
    newsId: string,
    data: Partial<{
      title: string;
      slug: string;
      summary: string;
      content: string;
      category: string;
      imageUrl: string;
      author: string;
      tags: string[];
      isFeatured: boolean;
      isPublished: boolean;
    }>
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title); }
    if (data.slug !== undefined) { fields.push(`slug = $${idx++}`); values.push(data.slug); }
    if (data.summary !== undefined) { fields.push(`summary = $${idx++}`); values.push(data.summary); }
    if (data.content !== undefined) { fields.push(`content = $${idx++}`); values.push(data.content); }
    if (data.category !== undefined) { fields.push(`category = $${idx++}`); values.push(data.category); }
    if (data.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); values.push(data.imageUrl); }
    if (data.author !== undefined) { fields.push(`author = $${idx++}`); values.push(data.author); }
    if (data.tags !== undefined) { fields.push(`tags = $${idx++}`); values.push(data.tags); }
    if (data.isFeatured !== undefined) { fields.push(`is_featured = $${idx++}`); values.push(data.isFeatured); }
    if (data.isPublished !== undefined) { fields.push(`is_published = $${idx++}`); values.push(data.isPublished); }

    if (fields.length === 0) return true;
    values.push(newsId);

    const count = await execute(
      `UPDATE news SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );
    return count > 0;
  },

  async deleteNews(newsId: string): Promise<boolean> {
    const count = await execute('DELETE FROM news WHERE id = $1', [newsId]);
    return count > 0;
  },
};
