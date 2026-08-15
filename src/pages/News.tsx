/**
 * News page component - Investment news and market updates
 * Nguồn dữ liệu: backend API (newsApi), fallback tĩnh khi offline
 * Đã tinh chỉnh: token semantic 100%, thay hero gradient info → brand, featured card dùng pattern gradient mềm thay vì img ngoài CDN.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, TrendingUp, Eye, ChevronRight, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { newsApi } from '../lib/api';
import { Illustration, NoNotifications } from '../assets/illustrations';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  imageUrl: string | null;
  tags: string[];
  isFeatured: boolean;
  views: number;
  readTime: number;
  publishedAt: string;
}

const CATEGORY_LABELS_KEYS: Record<string, string> = {
  vgreen: 'newsDetail.categoryVgreen',
  market: 'newsDetail.categoryMarket',
  policy: 'newsDetail.categoryPolicy',
};

const CATEGORY_BADGE: Record<string, string> = {
  vgreen: 'bg-success-subtle text-primary',
  market: 'bg-info-subtle text-info',
  policy: 'bg-warning-subtle text-warning-strong',
};

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'V-GREEN Fund đạt mốc 50.000 nhà đầu tư',
    slug: 'v-green-dat-moc-50000-nha-dau-tu',
    summary: 'Quỹ đầu tư V-GREEN chính thức vượt mốc 50.000 nhà đầu tư sau 6 tháng hoạt động.',
    category: 'vgreen',
    imageUrl: null,
    tags: ['V-GREEN', 'Đầu tư'],
    isFeatured: true,
    views: 12500,
    readTime: 3,
    publishedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Thị trường xe điện Việt Nam tăng trưởng 250%',
    slug: 'thi-truong-xe-dien-viet-nam-tang-truong-250',
    summary: 'Báo cáo mới nhất cho thấy thị trường xe điện Việt Nam tăng trưởng mạnh mẽ trong năm 2024.',
    category: 'market',
    imageUrl: null,
    tags: ['Xe điện', 'Thị trường'],
    isFeatured: true,
    views: 8900,
    readTime: 4,
    publishedAt: '2024-01-14T14:15:00Z',
  },
  {
    id: '3',
    title: 'Chính phủ ưu đãi thuế cho đầu tư xanh',
    slug: 'chinh-phu-uu-dai-thue-cho-dau-tu-xanh',
    summary: 'Nghị định mới về ưu đãi thuế dành cho các dự án đầu tư xanh.',
    category: 'policy',
    imageUrl: null,
    tags: ['Chính sách', 'Thuế'],
    isFeatured: false,
    views: 6700,
    readTime: 5,
    publishedAt: '2024-01-13T09:45:00Z',
  },
];

const FALLBACK_IMG_BY_CATEGORY: Record<string, string> = {
  vgreen: 'EVNetworkMap',
  market: 'EnergyDashboard',
  policy: 'ChargingStationHero',
};

const FeaturedPlaceholder: React.FC<{ category: string }> = ({ category }) => {
  const name = FALLBACK_IMG_BY_CATEGORY[category] || 'EVNetworkMap';
  const gradient =
    category === 'market'
      ? 'from-info to-brand-accent-700'
      : category === 'policy'
        ? 'from-warning to-brand-energy-orange'
        : 'from-brand-primary-600 to-brand-accent-700';
  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br',
        gradient,
      )}
    >
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(at 30% 30%, rgba(255,255,255,0.25) 0px, transparent 50%), radial-gradient(at 70% 70%, rgba(255,255,255,0.15) 0px, transparent 50%)",
        }}
      />
      <div className="relative z-10 h-3/4 w-3/4 max-w-[60%] text-white">
        <Illustration name={name as never} />
      </div>
    </div>
  );
};

const ThumbPlaceholder: React.FC<{ category: string }> = ({ category }) => {
  const gradient =
    category === 'market'
      ? 'from-info to-brand-accent-500'
      : category === 'policy'
        ? 'from-warning to-brand-energy-orange'
        : 'from-brand-primary-500 to-brand-accent-500';
  return (
    <div className={cn('relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br', gradient)}>
      <div className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(at 30% 30%, rgba(255,255,255,0.3) 0px, transparent 50%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <Sparkles className="h-5 w-5" />
      </div>
    </div>
  );
};

const News: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'market' | 'vgreen' | 'policy'>('all');
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    newsApi
      .getNews(selectedCategory === 'all' ? undefined : selectedCategory, 1, 50)
      .then((result) => {
        if (cancelled) return;
        if (result.news && result.news.length > 0) {
          setNews(result.news);
        }
      })
      .catch(() => {
        // Backend offline - keep fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  const categories = [
    { id: 'all', name: t('news.filterAll'), color: 'bg-muted text-muted-foreground' },
    { id: 'vgreen', name: t('news.filterVgreen'), color: 'bg-success-subtle text-primary' },
    { id: 'market', name: t('news.filterMarket'), color: 'bg-info-subtle text-info' },
    { id: 'policy', name: t('news.filterPolicy'), color: 'bg-warning-subtle text-warning-strong' },
  ];

  const filteredNews = useMemo(
    () => news.filter((n) => selectedCategory === 'all' || n.category === selectedCategory),
    [news, selectedCategory],
  );
  const featuredNews = useMemo(() => news.filter((n) => n.isFeatured), [news]);

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
    return new Date(dateString).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatViews = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const formatCategoryLabel = (cat: string) => {
    const key = CATEGORY_LABELS_KEYS[cat];
    return key ? t(key) : cat;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-elevated backdrop-blur-sm transition-transform hover:scale-105"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-info to-brand-accent-700">
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(at 20% 50%, rgba(255,255,255,0.3) 0px, transparent 50%), radial-gradient(at 80% 50%, rgba(255,255,255,0.2) 0px, transparent 50%)",
            }}
          />
          <div className="relative z-10 px-4 text-center">
            <h1 className="text-2xl font-bold text-white">{t('news.title')}</h1>
            <p className="mt-1 text-sm text-primary-foreground/90">
              {t('news.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* Quick Stats */}
        <div className="relative -mt-6 z-10 mb-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-xs text-muted-foreground">{t('news.statInvestors')}</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-info">1000+</div>
              <div className="text-xs text-muted-foreground">{t('news.statStations')}</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-warning-strong">2.5B</div>
              <div className="text-xs text-muted-foreground">{t('news.statCapital')}</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-card">
          <h3 className="mb-3 font-semibold text-foreground">{t('news.filterTitle')}</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as 'all' | 'vgreen' | 'market' | 'policy')}
                className={cn(
                  'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  selectedCategory === category.id
                    ? 'bg-info text-white shadow-sm'
                    : `${category.color} hover:opacity-80`,
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Featured News */}
            {featuredNews.length > 0 && selectedCategory === 'all' && (
              <div className="mb-6">
                <h2 className="mb-4 flex items-center text-lg font-semibold text-foreground">
                  <Star className="mr-2 h-5 w-5 text-warning-strong" />
                  {t('news.featuredTitle')}
                </h2>
                <div className="space-y-4">
                  {featuredNews.slice(0, 2).map((newsItem) => (
                    <button
                      key={newsItem.id}
                      onClick={() => navigate(`/news/${newsItem.slug}`)}
                      className="group w-full overflow-hidden rounded-xl border border-border bg-card text-left shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
                    >
                      <div className="relative h-44 overflow-hidden">
                        {newsItem.imageUrl ? (
                          <img
                            src={newsItem.imageUrl}
                            alt={newsItem.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <FeaturedPlaceholder category={newsItem.category} />
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-warning/95 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                            {t('news.badgeFeatured')}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatDate(newsItem.publishedAt)}</span>
                          <span>•</span>
                          <span>{t('news.minutes', { count: newsItem.readTime })}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Eye className="mr-1 h-3 w-3" />
                            {formatViews(newsItem.views)}
                          </span>
                        </div>
                        <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">
                          {newsItem.title}
                        </h3>
                        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                          {newsItem.summary}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5">
                            {(newsItem.tags || []).slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="flex items-center text-sm font-medium text-info">
                            {t('news.readMore')} <ChevronRight className="ml-1 h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* News List */}
            <div className="mb-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                {t('news.latestTitle', { count: filteredNews.length })}
              </h2>

              {filteredNews.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <EmptyState
                    illustration={<NoNotifications size={140} />}
                    title={t('news.emptyTitle')}
                    description={t('news.emptyDesc')}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNews.map((newsItem) => (
                    <button
                      key={newsItem.id}
                      onClick={() => navigate(`/news/${newsItem.slug}`)}
                      className="group flex w-full gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
                    >
                      {newsItem.imageUrl ? (
                        <img
                          src={newsItem.imageUrl}
                          alt={newsItem.title}
                          className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <ThumbPlaceholder category={newsItem.category} />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={cn(
                              'rounded px-2 py-0.5 text-xs font-medium',
                              CATEGORY_BADGE[newsItem.category] ||
                                'bg-muted text-muted-foreground',
                            )}
                          >
                            {formatCategoryLabel(newsItem.category)}
                          </span>
                          {newsItem.isFeatured && (
                            <span className="rounded bg-warning-subtle px-2 py-0.5 text-xs font-medium text-warning-strong">
                              {t('news.badgeFeatured')}
                            </span>
                          )}
                        </div>
                        <h3 className="mb-1 line-clamp-1 font-semibold text-foreground">
                          {newsItem.title}
                        </h3>
                        <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                          {newsItem.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span>{formatDate(newsItem.publishedAt)}</span>
                            <span>•</span>
                            <span>{t('news.minutes', { count: newsItem.readTime })}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Eye className="mr-1 h-3 w-3" />
                              {formatViews(newsItem.views)}
                            </span>
                          </div>
                          <span className="flex items-center text-info transition-transform group-hover:translate-x-0.5">
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Market Insights */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-6 text-white shadow-elevated">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-card/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-accent-400/30 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{t('news.marketTitle')}</h3>
                <p className="text-sm text-primary-foreground/90">{t('news.marketSubtitle')}</p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-card/15 p-3 backdrop-blur-md">
                <div className="text-lg font-bold">2.2%</div>
                <div className="text-sm text-primary-foreground/90">{t('news.highestRate')}</div>
              </div>
              <div className="rounded-lg bg-card/15 p-3 backdrop-blur-md">
                <div className="text-lg font-bold">250%</div>
                <div className="text-sm text-primary-foreground/90">{t('news.marketGrowth')}</div>
              </div>
            </div>

            <button
              onClick={() => navigate('/investment')}
              className="w-full rounded-lg bg-card py-3 font-semibold text-primary transition-all hover:scale-[1.02] hover:shadow-elevated"
            >
              {t('news.exploreCta')}
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default News;
