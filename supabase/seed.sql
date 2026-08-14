-- =============================================
-- SEED DATA - Investment Packages
-- Run after schema.sql
-- =============================================

INSERT INTO public.packages (slug, name, type, power, category, daily_profit, investment_period, investment_amount, min_investment, project_scale, progress, description, details, show_on_home, sort_order) VALUES
(
  'dc-60kw-basic',
  'Quỹ Phát Triển Trạm Sạc VinFast (DC 60kw)',
  'DC',
  '60kw',
  'basic',
  0.2,
  30,
  50000000,
  50000000,
  5000000000,
  30,
  'Trạm sạc DC 60kW - Gói cơ bản 30 ngày',
  '{"dividend": 0, "profitSharingMethod": "Quỹ đầu tư ngắn hạn trong 30 ngày", "minimumInvestment": 50000000, "riskFree": 100, "projectAmount": 5000000000, "profitRate": 0, "maxPurchaseLimit": 9999, "profitCalculation": "Lãi cộng theo tỉ lệ ngày", "redemptionMethod": "Quỹ đầu tư ngắn hạn trong 30 ngày", "settlementTime": "Ngày thứ 30", "investmentNumber": "VIC", "security": 100, "projectSummary": "Thưởng gói đặt lịch: 2.500.000 VND", "schedulingBonus": 2500000}'::jsonb,
  true,
  1
),
(
  'gift-card',
  'Quỹ mở thẻ tích lũy VinGroup',
  'GIFT_CARD',
  NULL,
  'basic',
  0.25,
  45,
  150000000,
  150000000,
  7500000000,
  90,
  'Phát triển hệ thống thẻ tích lũy VinGroup',
  '{"dividend": 0, "profitSharingMethod": "Quỹ đầu tư ngắn hạn", "minimumInvestment": 150000000, "riskFree": 100, "projectAmount": 7500000000, "profitRate": 0, "maxPurchaseLimit": 9999, "profitCalculation": "Lãi cộng theo tỉ lệ ngày", "redemptionMethod": "Quỹ đầu tư ngắn hạn", "settlementTime": "Ngày thứ 31", "investmentNumber": "VIC", "security": 100, "projectSummary": "Thưởng gói đặt lịch: 7.800.000 VND", "schedulingBonus": 7800000}'::jsonb,
  true,
  2
),
(
  'regular-package',
  'Quỹ Phát Triển Trạm Sạc VinFast (GÓI THƯỜNG)',
  'REGULAR',
  NULL,
  'basic',
  0.3,
  45,
  300000000,
  300000000,
  10000000000,
  120,
  'Gói đầu tư thường - Phù hợp nhà đầu tư cá nhân',
  '{"dividend": 0, "profitSharingMethod": "Quỹ đầu tư ngắn hạn trong 30 ngày", "minimumInvestment": 300000000, "riskFree": 100, "projectAmount": 10000000000, "profitRate": 0, "maxPurchaseLimit": 9999, "profitCalculation": "Lãi cộng theo tỉ lệ %/gói/ngày.", "redemptionMethod": "Quỹ đầu tư ngắn hạn trong 30 ngày", "settlementTime": "Ngày thứ 30", "investmentNumber": "VIC", "security": 100, "projectSummary": "Thưởng gói nâng cấp: 16.500.000 VND", "schedulingBonus": 16500000}'::jsonb,
  true,
  3
),
(
  'vip-package',
  'Quỹ Phát Triển Trạm Sạc VinFast (GÓI VIP)',
  'REGULAR',
  NULL,
  'standard',
  0.35,
  60,
  500000000,
  500000000,
  15000000000,
  150,
  'Gói VIP - Lợi nhuận cao cho nhà đầu tư lớn',
  '{"dividend": 0, "profitSharingMethod": "Quỹ đầu tư ngắn hạn", "minimumInvestment": 500000000, "riskFree": 100, "projectAmount": 15000000000, "profitRate": 0, "maxPurchaseLimit": 9999, "profitCalculation": "Lãi cộng theo tỉ lệ ngày", "redemptionMethod": "Quỹ đầu tư ngắn hạn", "settlementTime": "Ngày thứ 30", "investmentNumber": "VIC", "security": 100, "projectSummary": "Thưởng gói đặt lịch: 29.000.000 VND", "schedulingBonus": 29000000}'::jsonb,
  true,
  4
),
(
  'dc-80kw',
  'Quỹ Phát Triển Trạm Sạc VinFast (DC 80kw)',
  'DC',
  '80kw',
  'standard',
  0.5,
  90,
  1000000000,
  1000000000,
  50000000000,
  250,
  'Trạm sạc DC 80kW - Công suất sạc nhanh cao',
  '{"dividend": 750000, "profitSharingMethod": "Quỹ đầu tư ngắn hạn", "minimumInvestment": 1000000000, "riskFree": 100, "projectAmount": 50000000000, "profitRate": 1, "maxPurchaseLimit": 9999, "profitCalculation": "Lãi cộng theo tỉ lệ ngày", "redemptionMethod": "Quỹ đầu tư ngắn hạn", "settlementTime": "Ngày thứ 31", "investmentNumber": "VIC", "security": 100, "projectSummary": "Thưởng nâng cấp gói: 82.000.000 VND", "schedulingBonus": 82000000}'::jsonb,
  true,
  5
),
(
  'dc-120kw',
  'Quỹ Phát Triển Trạm Sạc VinFast (DC 120kw)',
  'DC',
  '120kw',
  'standard',
  0.6,
  90,
  2000000000,
  2000000000,
  100000000000,
  300,
  'Trạm sạc DC 120kW - Siêu sạc nhanh',
  '{"dividend": 0, "profitSharingMethod": "Quỹ đầu tư ngắn hạn", "minimumInvestment": 2000000000, "riskFree": 100, "projectAmount": 100000000000, "profitRate": 1, "maxPurchaseLimit": 9999, "profitCalculation": "Lãi cộng theo tỉ lệ ngày", "redemptionMethod": "Quỹ đầu tư ngắn hạn", "settlementTime": "Ngày thứ 31", "investmentNumber": "VIC", "security": 100, "projectSummary": "Thưởng gói nâng cấp gói: 246.000.000 VND", "schedulingBonus": 246000000}'::jsonb,
  true,
  6
),
(
  'dc-150kw',
  'Quỹ Phát Triển Trạm Sạc VinFast (DC 150kw)',
  'DC',
  '150kw',
  'standard',
  0.7,
  100,
  5000000000,
  5000000000,
  200000000000,
  365,
  'Trạm sạc DC 150kW - Công nghệ sạc tối ưu',
  '{"dividend": 0, "profitSharingMethod": "Quỹ đầu tư ngắn hạn", "minimumInvestment": 5000000000, "riskFree": 100, "projectAmount": 200000000000, "profitRate": 1, "maxPurchaseLimit": 9999, "profitCalculation": "Lãi cộng theo tỉ lệ ngày", "redemptionMethod": "Quỹ đầu tư ngắn hạn", "settlementTime": "Ngày thứ 31", "investmentNumber": "VIC", "security": 100, "projectSummary": "Thưởng gói đặt lịch: 595.000.000 VND", "schedulingBonus": 595000000}'::jsonb,
  true,
  7
),
(
  '3d-300kw',
  'Quỹ Phát Triển Trạm Sạc VinFast (3D 300kw)',
  'DC',
  '300kw',
  'premium',
  0.8,
  180,
  10000000000,
  10000000000,
  300000000000,
  400,
  'Trạm sạc 3D 300kW - Công nghệ sạc thế hệ mới',
  '{"dividend": 0, "profitSharingMethod": "Quỹ đầu tư ngắn hạn", "minimumInvestment": 10000000000, "riskFree": 100, "projectAmount": 300000000000, "profitRate": 1, "maxPurchaseLimit": 9999, "profitCalculation": "Lãi cộng theo tỉ lệ ngày", "redemptionMethod": "Quỹ đầu tư ngắn hạn", "settlementTime": "Ngày thứ 31", "investmentNumber": "VIC", "security": 100, "projectSummary": "Thưởng gói nâng cấp: 1.408.000.000 VND", "schedulingBonus": 1408000000}'::jsonb,
  true,
  8
),
(
  'vic01',
  'Quỹ Phát Triển Trạm Sạc VinFast (VIC01)',
  'VIC',
  NULL,
  'premium',
  1.0,
  180,
  25000000000,
  25000000000,
  500000000000,
  450,
  'Gói đầu tư VIC01 - Phát triển hệ thống trạm sạc thế hệ mới',
  '{"dividend": 0, "profitSharingMethod": "Quỹ đầu tư ngắn hạn", "minimumInvestment": 25000000000, "riskFree": 100, "projectAmount": 500000000000, "profitRate": 1, "maxPurchaseLimit": 9999, "profitCalculation": "Lãi cộng theo tỉ lệ ngày", "redemptionMethod": "Quỹ đầu tư ngắn hạn", "settlementTime": "Ngày thứ 31", "investmentNumber": "VIC", "security": 100, "projectSummary": "Thưởng gói đặt lịch: 2.500.000.000 VND", "schedulingBonus": 2500000000}'::jsonb,
  true,
  9
),
(
  'vic25',
  'Quỹ Phát Triển Trạm Sạc VinFast (VIC25)',
  'VIC',
  NULL,
  'premium',
  2.2,
  365,
  150000000000,
  150000000000,
  50000000000000,
  1500,
  'Gói VIC25 - Đầu tư siêu lớn tối ưu',
  '{"dividend": 0, "profitSharingMethod": "Quỹ Nhà Đầu Tư", "minimumInvestment": 150000000000, "riskFree": 100, "projectAmount": 50000000000000, "profitRate": 2, "maxPurchaseLimit": 9999, "profitCalculation": "Lãi cộng theo tỉ lệ ngày", "redemptionMethod": "Quỹ Nhà Đầu Tư", "settlementTime": "Ngày thứ 31", "investmentNumber": "VIC", "security": 100, "projectSummary": "Thưởng gói đặt lịch: 15.000.000.000 VND", "schedulingBonus": 15000000000}'::jsonb,
  true,
  10
);

-- =============================================
-- SEED DATA - News Articles
-- =============================================

INSERT INTO public.news (title, slug, summary, content, category, author, tags, is_featured, published_at) VALUES
(
  'V-GREEN Fund đạt mốc 50.000 nhà đầu tư',
  'v-green-dat-moc-50000-nha-dau-tu',
  'Quỹ đầu tư V-GREEN chính thức vượt mốc 50.000 nhà đầu tư sau 6 tháng hoạt động.',
  'Chỉ sau 6 tháng ra mắt, V-GREEN Fund đã thu hút được hơn 50.000 nhà đầu tư...',
  'vgreen',
  'Ban biên tập',
  ARRAY['V-GREEN', 'Milestone', 'Đầu tư'],
  true,
  NOW()
),
(
  'Thị trường xe điện Việt Nam tăng trưởng 250%',
  'thi-truong-xe-dien-viet-nam-tang-truong-250',
  'Báo cáo mới nhất cho thấy thị trường xe điện Việt Nam tăng trưởng mạnh mẽ trong năm 2024.',
  'Theo báo cáo của Hiệp hội Ô tô Việt Nam, doanh số xe điện tăng 250%...',
  'market',
  'Ban biên tập',
  ARRAY['Xe điện', 'Thị trường', 'Tăng trưởng'],
  true,
  NOW()
),
(
  'Chính phủ ưu đãi thuế cho đầu tư xanh',
  'chinh-phu-uu-dai-thue-cho-dau-tu-xanh',
  'Nghị định mới về ưu đãi thuế dành cho các dự án đầu tư xanh, giảm 50% thuế thu nhập doanh nghiệp.',
  'Chính phủ vừa ban hành nghị định mới khuyến khích đầu tư vào các dự án xanh...',
  'policy',
  'Ban biên tập',
  ARRAY['Chính sách', 'Thuế', 'Đầu tư xanh'],
  false,
  NOW()
);

-- =============================================
-- SEED DATA - System Settings
-- =============================================

INSERT INTO public.settings (id, value, description) VALUES
('min_deposit', '{"amount": 100000}', 'Số tiền nạp tối thiểu'),
('min_withdraw', '{"amount": 100000}', 'Số tiền rút tối thiểu'),
('referral_commission', '{"level1": 5, "level2": 2, "level3": 1}', 'Hoa hồng giới thiệu theo cấp (%)'),
('bank_info', '{"name": "Vietcombank", "account": "1234567890", "holder": "V-GREEN FUND"}', 'Thông tin tài khoản ngân hàng')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- STORED PROCEDURES FOR WALLET OPERATIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.add_balance(p_user_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.wallets
  SET balance = balance + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.subtract_balance(p_user_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.wallets
  SET balance = GREATEST(0, balance - p_amount), updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SEED DATA - Admin Account
-- Run after creating auth user manually in Supabase Dashboard
-- Then update the profile role to 'admin'
-- =============================================

-- NOTE: Create admin user via Supabase Dashboard > Authentication > Add User
-- Then manually update their role:
-- UPDATE public.profiles SET role = 'admin' WHERE phone = 'admin';
