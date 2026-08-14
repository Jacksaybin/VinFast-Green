/**
 * Audit Log Routes - Admin only
 */

import { Router, Response } from 'express';
import { auditService } from '../services/auditService';
import { requireAdmin, requirePermission, PERMISSIONS, AuthRequest } from '../middleware/auth';
import { ok, paginated, badRequest } from '../utils/response';

const router = Router();

router.use(requireAdmin, requirePermission(PERMISSIONS.AUDIT_VIEW));

router.get('/', async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '50', action, userId, userSearch, from, to } = req.query;
  const limitNum = Math.min(Math.max(parseInt(limit as string) || 50, 1), 200);

  const dateError = validateDateRange(from as string, to as string);
  if (dateError) return badRequest(res, dateError);

  const result = await auditService.getLogs(
    parseInt(page as string) || 1,
    limitNum,
    action as string,
    userId as string,
    from as string,
    to as string,
    userSearch as string
  );
  return paginated(res, result.logs, result.total, parseInt(page as string) || 1, limitNum);
});

router.get('/stats', async (req: AuthRequest, res: Response) => {
  const stats = await auditService.getStats();
  return ok(res, stats);
});

router.get('/export', async (req: AuthRequest, res: Response) => {
  const { action, userId, userSearch, from, to } = req.query;
  const dateError = validateDateRange(from as string, to as string);
  if (dateError) return badRequest(res, dateError);

  const rows = await auditService.getLogsForExport(
    action as string,
    userId as string,
    from as string,
    to as string,
    userSearch as string
  );

  const BOM = '\uFEFF';
  const header = [
    'ID',
    'Thời gian',
    'Hành động',
    'Họ tên',
    'Số điện thoại',
    'IP',
    'User-Agent',
    'Metadata',
  ];
  const csvLines = [header.join(',')];

  const escape = (val: any) => {
    if (val === null || val === undefined) return '';
    let s = String(val);
    // CSV injection defense: nếu bắt đầu bằng ký tự formula nguy hiểm, prefix apostrophe
    if (/^[=+\-@\t\r]/.test(s)) {
      s = `'${s}`;
    }
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  for (const r of rows) {
    csvLines.push(
      [
        r.id,
        r.created_at ? new Date(r.created_at).toISOString() : '',
        r.action,
        r.user_full_name,
        r.user_phone,
        r.ip_address,
        r.user_agent,
        r.new_data || r.old_data ? JSON.stringify({ old: r.old_data, new: r.new_data }) : '',
      ]
        .map(escape)
        .join(',')
    );
  }

  const filename = `audit_${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(BOM + csvLines.join('\n'));
});

function validateDateRange(from?: string, to?: string): string | null {
  if (from && Number.isNaN(Date.parse(from))) return 'from không đúng định dạng ngày';
  if (to && Number.isNaN(Date.parse(to))) return 'to không đúng định dạng ngày';
  if (from && to && Date.parse(from) > Date.parse(to)) return 'from phải nhỏ hơn hoặc bằng to';
  return null;
}

export default router;
