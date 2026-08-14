/**
 * Database seed script - Run AFTER schema.sql
 * Seeds investment packages, news, and settings
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

import { pool, query, queryOne, testConnection } from './db';

async function seed() {
  console.log('🌱 Seeding database...\n');

  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('❌ Database not connected');
    process.exit(1);
  }

  // =============================================
  // Investment Packages
  // =============================================
  console.log('📦 Seeding investment packages...');

  const packages = [
    {
      slug: 'dc-60kw-basic',
      name: 'Quỹ Phát Triển Trạm Sạc VinFast (DC 60kw)',
      type: 'DC',
      power: '60kw',
      category: 'basic',
      daily_profit: 0.2,
      investment_period: 30,
      investment_amount: 50000000,
      min_investment: 50000000,
      project_scale: 5000000000,
      progress: 30,
      description: 'Trạm sạc DC 60kW - Gói cơ bản 30 ngày',
      details: {
        profitSharingMethod: 'Quỹ đầu tư ngắn hạn trong 30 ngày',
        riskFree: 100,
        profitRate: 0,
        maxPurchaseLimit: 9999,
        profitCalculation: 'Lãi cộng theo tỉ lệ ngày',
        settlementTime: 'Ngày thứ 30',
        investmentNumber: 'VIC',
        security: 100,
        projectSummary: 'Thưởng gói đặt lịch: 2.500.000 VND',
        schedulingBonus: 2500000,
      },
      show_on_home: true,
      sort_order: 1,
    },
    {
      slug: 'gift-card',
      name: 'Quỹ mở thẻ tích lũy VinGroup',
      type: 'GIFT_CARD',
      power: null,
      category: 'basic',
      daily_profit: 0.25,
      investment_period: 45,
      investment_amount: 150000000,
      min_investment: 150000000,
      project_scale: 7500000000,
      progress: 90,
      description: 'Phát triển hệ thống thẻ tích lũy VinGroup',
      details: {
        profitSharingMethod: 'Quỹ đầu tư ngắn hạn',
        riskFree: 100,
        profitRate: 0,
        maxPurchaseLimit: 9999,
        profitCalculation: 'Lãi cộng theo tỉ lệ ngày',
        settlementTime: 'Ngày thứ 31',
        investmentNumber: 'VIC',
        security: 100,
        projectSummary: 'Thưởng gói đặt lịch: 7.800.000 VND',
        schedulingBonus: 7800000,
      },
      show_on_home: true,
      sort_order: 2,
    },
    {
      slug: 'regular-package',
      name: 'Quỹ Phát Triển Trạm Sạc VinFast (GÓI THƯỜNG)',
      type: 'REGULAR',
      power: null,
      category: 'basic',
      daily_profit: 0.3,
      investment_period: 45,
      investment_amount: 300000000,
      min_investment: 300000000,
      project_scale: 10000000000,
      progress: 120,
      description: 'Gói đầu tư thường - Phù hợp nhà đầu tư cá nhân',
      details: {
        profitSharingMethod: 'Quỹ đầu tư ngắn hạn trong 30 ngày',
        riskFree: 100,
        profitRate: 0,
        maxPurchaseLimit: 9999,
        profitCalculation: 'Lãi cộng theo tỉ lệ %/gói/ngày.',
        settlementTime: 'Ngày thứ 30',
        investmentNumber: 'VIC',
        security: 100,
        projectSummary: 'Thưởng gói nâng cấp: 16.500.000 VND',
        schedulingBonus: 16500000,
      },
      show_on_home: true,
      sort_order: 3,
    },
    {
      slug: 'vip-package',
      name: 'Quỹ Phát Triển Trạm Sạc VinFast (GÓI VIP)',
      type: 'REGULAR',
      power: null,
      category: 'standard',
      daily_profit: 0.35,
      investment_period: 60,
      investment_amount: 500000000,
      min_investment: 500000000,
      project_scale: 15000000000,
      progress: 150,
      description: 'Gói VIP - Lợi nhuận cao cho nhà đầu tư lớn',
      details: {
        profitSharingMethod: 'Quỹ đầu tư ngắn hạn',
        riskFree: 100,
        profitRate: 0,
        maxPurchaseLimit: 9999,
        profitCalculation: 'Lãi cộng theo tỉ lệ ngày',
        settlementTime: 'Ngày thứ 30',
        investmentNumber: 'VIC',
        security: 100,
        projectSummary: 'Thưởng gói đặt lịch: 29.000.000 VND',
        schedulingBonus: 29000000,
      },
      show_on_home: true,
      sort_order: 4,
    },
    {
      slug: 'dc-80kw',
      name: 'Quỹ Phát Triển Trạm Sạc VinFast (DC 80kw)',
      type: 'DC',
      power: '80kw',
      category: 'standard',
      daily_profit: 0.5,
      investment_period: 90,
      investment_amount: 1000000000,
      min_investment: 1000000000,
      project_scale: 50000000000,
      progress: 250,
      description: 'Trạm sạc DC 80kW - Công suất sạc nhanh cao',
      details: {
        dividend: 750000,
        profitSharingMethod: 'Quỹ đầu tư ngắn hạn',
        riskFree: 100,
        profitRate: 1,
        maxPurchaseLimit: 9999,
        profitCalculation: 'Lãi cộng theo tỉ lệ ngày',
        settlementTime: 'Ngày thứ 31',
        investmentNumber: 'VIC',
        security: 100,
        projectSummary: 'Thưởng nâng cấp gói: 82.000.000 VND',
        schedulingBonus: 82000000,
      },
      show_on_home: true,
      sort_order: 5,
    },
    {
      slug: 'dc-120kw',
      name: 'Quỹ Phát Triển Trạm Sạc VinFast (DC 120kw)',
      type: 'DC',
      power: '120kw',
      category: 'standard',
      daily_profit: 0.6,
      investment_period: 90,
      investment_amount: 2000000000,
      min_investment: 2000000000,
      project_scale: 100000000000,
      progress: 300,
      description: 'Trạm sạc DC 120kW - Siêu sạc nhanh',
      details: {
        profitSharingMethod: 'Quỹ đầu tư ngắn hạn',
        riskFree: 100,
        profitRate: 1,
        maxPurchaseLimit: 9999,
        profitCalculation: 'Lãi cộng theo tỉ lệ ngày',
        settlementTime: 'Ngày thứ 31',
        investmentNumber: 'VIC',
        security: 100,
        projectSummary: 'Thưởng gói nâng cấp gói: 246.000.000 VND',
        schedulingBonus: 246000000,
      },
      show_on_home: true,
      sort_order: 6,
    },
    {
      slug: 'dc-150kw',
      name: 'Quỹ Phát Triển Trạm Sạc VinFast (DC 150kw)',
      type: 'DC',
      power: '150kw',
      category: 'standard',
      daily_profit: 0.7,
      investment_period: 100,
      investment_amount: 5000000000,
      min_investment: 5000000000,
      project_scale: 200000000000,
      progress: 365,
      description: 'Trạm sạc DC 150kW - Công nghệ sạc tối ưu',
      details: {
        profitSharingMethod: 'Quỹ đầu tư ngắn hạn',
        riskFree: 100,
        profitRate: 1,
        maxPurchaseLimit: 9999,
        profitCalculation: 'Lãi cộng theo tỉ lệ ngày',
        settlementTime: 'Ngày thứ 31',
        investmentNumber: 'VIC',
        security: 100,
        projectSummary: 'Thưởng gói đặt lịch: 595.000.000 VND',
        schedulingBonus: 595000000,
      },
      show_on_home: true,
      sort_order: 7,
    },
    {
      slug: 'vic01',
      name: 'Quỹ Phát Triển Trạm Sạc VinFast (VIC01)',
      type: 'VIC',
      power: null,
      category: 'premium',
      daily_profit: 1.0,
      investment_period: 180,
      investment_amount: 25000000000,
      min_investment: 25000000000,
      project_scale: 500000000000,
      progress: 450,
      description: 'Gói đầu tư VIC01 - Phát triển hệ thống trạm sạc thế hệ mới',
      details: {
        profitSharingMethod: 'Quỹ đầu tư ngắn hạn',
        riskFree: 100,
        profitRate: 1,
        maxPurchaseLimit: 9999,
        profitCalculation: 'Lãi cộng theo tỉ lệ ngày',
        settlementTime: 'Ngày thứ 31',
        investmentNumber: 'VIC',
        security: 100,
        projectSummary: 'Thưởng gói đặt lịch: 2.500.000.000 VND',
        schedulingBonus: 2500000000,
      },
      show_on_home: true,
      sort_order: 8,
    },
    {
      slug: 'vic25',
      name: 'Quỹ Phát Triển Trạm Sạc VinFast (VIC25)',
      type: 'VIC',
      power: null,
      category: 'premium',
      daily_profit: 2.2,
      investment_period: 365,
      investment_amount: 150000000000,
      min_investment: 150000000000,
      project_scale: 50000000000000,
      progress: 1500,
      description: 'Gói VIC25 - Đầu tư siêu lớn tối ưu',
      details: {
        profitSharingMethod: 'Quỹ Nhà Đầu Tư',
        riskFree: 100,
        profitRate: 2,
        maxPurchaseLimit: 9999,
        profitCalculation: 'Lãi cộng theo tỉ lệ ngày',
        settlementTime: 'Ngày thứ 31',
        investmentNumber: 'VIC',
        security: 100,
        projectSummary: 'Thưởng gói đặt lịch: 15.000.000.000 VND',
        schedulingBonus: 15000000000,
      },
      show_on_home: true,
      sort_order: 9,
    },
  ];

  for (const pkg of packages) {
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM packages WHERE slug = $1',
      [pkg.slug]
    );

    if (!existing) {
      await query(
        `INSERT INTO packages (slug, name, type, power, category, daily_profit, investment_period, investment_amount, min_investment, project_scale, progress, description, details, show_on_home, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          pkg.slug, pkg.name, pkg.type, pkg.power, pkg.category,
          pkg.daily_profit, pkg.investment_period, pkg.investment_amount,
          pkg.min_investment, pkg.project_scale, pkg.progress, pkg.description,
          JSON.stringify(pkg.details), pkg.show_on_home, pkg.sort_order,
        ]
      );
      console.log(`  ✅ ${pkg.name}`);
    } else {
      console.log(`  ⏭️  ${pkg.name} (already exists)`);
    }
  }

  // =============================================
  // News Articles
  // =============================================
  console.log('\n📰 Seeding news articles...');

  const news = [
    {
      title: 'V-GREEN Fund đạt mốc 50.000 nhà đầu tư',
      slug: 'v-green-dat-moc-50000-nha-dau-tu',
      summary: 'Quỹ đầu tư V-GREEN chính thức vượt mốc 50.000 nhà đầu tư sau 6 tháng hoạt động.',
      content: 'Chỉ sau 6 tháng ra mắt, V-GREEN Fund đã thu hút được hơn 50.000 nhà đầu tư...',
      category: 'vgreen',
      author: 'Ban biên tập',
      tags: ['V-GREEN', 'Milestone', 'Đầu tư'],
      is_featured: true,
    },
    {
      title: 'Thị trường xe điện Việt Nam tăng trưởng 250%',
      slug: 'thi-truong-xe-dien-viet-nam-tang-truong-250',
      summary: 'Báo cáo mới nhất cho thấy thị trường xe điện Việt Nam tăng trưởng mạnh mẽ.',
      content: 'Theo báo cáo của Hiệp hội Ô tô Việt Nam, doanh số xe điện tăng 250%...',
      category: 'market',
      author: 'Ban biên tập',
      tags: ['Xe điện', 'Thị trường', 'Tăng trưởng'],
      is_featured: true,
    },
    {
      title: 'Chính phủ ưu đãi thuế cho đầu tư xanh',
      slug: 'chinh-phu-uu-dai-thue-cho-dau-tu-xanh',
      summary: 'Nghị định mới về ưu đãi thuế dành cho các dự án đầu tư xanh.',
      content: 'Chính phủ vừa ban hành nghị định mới khuyến khích đầu tư vào các dự án xanh...',
      category: 'policy',
      author: 'Ban biên tập',
      tags: ['Chính sách', 'Thuế', 'Đầu tư xanh'],
      is_featured: false,
    },
  ];

  for (const article of news) {
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM news WHERE slug = $1',
      [article.slug]
    );

    if (!existing) {
      await query(
        `INSERT INTO news (title, slug, summary, content, category, author, tags, is_featured, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [article.title, article.slug, article.summary, article.content, article.category, article.author, article.tags, article.is_featured]
      );
      console.log(`  ✅ ${article.title}`);
    } else {
      console.log(`  ⏭️  ${article.title} (already exists)`);
    }
  }

  // =============================================
  // Settings
  // =============================================
  console.log('\n⚙️  Seeding settings...');

  const settings = [
    { id: 'min_deposit', value: JSON.stringify({ amount: 100000 }), description: 'Số tiền nạp tối thiểu' },
    { id: 'min_withdraw', value: JSON.stringify({ amount: 100000 }), description: 'Số tiền rút tối thiểu' },
    { id: 'referral_commission', value: JSON.stringify({ level1: 5, level2: 2, level3: 1 }), description: 'Hoa hồng giới thiệu (%)' },
    { id: 'bank_info', value: JSON.stringify({ name: 'Vietcombank', account: '1234567890', holder: 'V-GREEN FUND' }), description: 'Thông tin tài khoản' },
  ];

  for (const setting of settings) {
    await query(
      `INSERT INTO settings (id, value, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET value = $2`,
      [setting.id, setting.value, setting.description]
    );
    console.log(`  ✅ ${setting.id}`);
  }

  console.log('\n🎉 Seeding complete!');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
