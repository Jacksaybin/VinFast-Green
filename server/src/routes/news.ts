/**
 * News Routes (Public)
 */

import { Router, Response } from 'express';
import { newsService } from '../services/newsService';
import { ok, paginated } from '../utils/response';

const router = Router();

router.get('/', async (req, res) => {
  const { category, page = '1', limit = '10' } = req.query;
  const result = await newsService.getNews(category as string, parseInt(page as string), parseInt(limit as string));
  return paginated(res, result.news, result.total, parseInt(page as string), parseInt(limit as string));
});

router.get('/categories/list', async (req, res) => {
  const cats = await newsService.getCategories();
  return ok(res, cats);
});

router.get('/:slug', async (req, res) => {
  const news = await newsService.getNewsBySlug(req.params.slug);
  if (!news) return res.status(404).json({ success: false, error: 'Không tìm thấy bài viết' });
  return ok(res, news);
});

export default router;
