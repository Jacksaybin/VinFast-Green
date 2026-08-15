/**
 * NewsDetail page component - Xem chi tiết một bài viết
 * Nguồn: newsApi.getNewsBySlug (có fallback nội dung tối thiểu khi offline)
 * Đã tinh chỉnh: token semantic 100%, fallback thumbnail gradient nội bộ (không CDN ngoài).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Clock, Eye, Share2, Calendar, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/ui/PageHeader';
import { Loading } from '../components/ui/StateViews';
import { Illustration, NoNotifications } from '../assets/illustrations';
import { EmptyState } from '../components/ui/EmptyState';
import { newsApi } from '../lib/api';
import { cn } from '../lib/utils';

interface NewsDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string | null;
  author: string;
  tags: string[];
  isFeatured: boolean;
  views: number;
  readTime: number;
  publishedAt: string;
}

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  vgreen: 'newsDetail.categoryVgreen',
  market: 'newsDetail.categoryMarket',
  policy: 'newsDetail.categoryPolicy',
};
const CATEGORY_BADGE: Record<string, string> = {
  vgreen: 'bg-success-subtle text-primary',
  market: 'bg-info-subtle text-info',
  policy: 'bg-warning-subtle text-warning-strong',
};

const HeroPlaceholder: React.FC<{ category: string }> = ({ category }) => {
  const gradient =
    category === 'market'
      ? 'from-info to-brand-accent-700'
      : category === 'policy'
        ? 'from-warning to-brand-energy-orange'
        : 'from-brand-primary-600 to-brand-accent-700';
  const name = category === 'policy' ? 'ChargingStationHero' : category === 'market' ? 'EnergyDashboard' : 'EVNetworkMap';
  return (
    <div className={cn('relative flex h-56 w-full items-center justify-center overflow-hidden bg-gradient-to-br', gradient)}>
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(at 30% 30%, rgba(255,255,255,0.25) 0px, transparent 50%), radial-gradient(at 70% 70%, rgba(255,255,255,0.15) 0px, transparent 50%)",
        }}
      />
      <div className="relative z-10 h-3/5 w-3/5 max-w-[240px] text-white">
        <Illustration name={name as never} />
      </div>
      <div className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-card/20 px-2.5 py-1 text-xs text-white backdrop-blur-md">
        <Sparkles className="h-3 w-3" />
        V-GREEN
      </div>
    </div>
  );
};

const NewsDetail: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    const fetchWithFallback = async () => {
      try {
        const data = await newsApi.getNewsBySlug(slug);
        if (cancelled) return;
        if (data) {
          setArticle(data);
          return;
        }
      } catch {
        // Network error - try list fallback
      }
      try {
        const listResult = await newsApi.getNews(undefined, 1, 50);
        if (!cancelled && listResult?.news) {
          const match = listResult.news.find((n: any) => n.slug === slug);
          if (match) {
            setArticle({
              ...match,
              content: match.summary || `<p>${t('newsDetail.contentUpdating')}</p>`,
              author: '',
            });
            return;
          }
        }
      } catch {}
      if (!cancelled) setNotFound(true);
    };

    fetchWithFallback().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatViews = (count: number) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: article?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert(t('newsDetail.shareCopied'));
      }
    } catch {
      // user cancelled share
    }
  };

  const hasImage = useMemo(() => Boolean(article?.imageUrl), [article]);

  const categoryLabel = (cat: string) => {
    const key = CATEGORY_LABEL_KEYS[cat];
    return key ? t(key) : cat;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-2xl px-4 pb-24">
        {loading ? (
          <Loading fullScreen text={t('newsDetail.loading')} />
        ) : notFound || !article ? (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <EmptyState
              illustration={<NoNotifications size={140} />}
              title={t('newsDetail.notFoundTitle')}
              description={t('newsDetail.notFoundDesc')}
              action={
                <button
                  onClick={() => navigate('/news')}
                  className="bg-info text-primary-foreground rounded-xl px-5 py-2.5 font-semibold hover:shadow-glow transition-all"
                >
                  {t('newsDetail.backToNews')}
                </button>
              }
            />
          </div>
        ) : (
          <>
            <PageHeader
              title=""
              onBack={() => navigate('/news')}
              sticky
              rightAction={
                <button
                  onClick={handleShare}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={t('newsDetail.share')}
                >
                  <Share2 className="h-5 w-5" />
                </button>
              }
            />

            <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              {hasImage ? (
                <img
                  src={article.imageUrl!}
                  alt={article.title}
                  className="h-56 w-full object-cover"
                />
              ) : (
                <HeroPlaceholder category={article.category} />
              )}
              <div className="p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded px-2 py-0.5 text-xs font-medium',
                      CATEGORY_BADGE[article.category] ||
                        'bg-muted text-muted-foreground',
                    )}
                  >
                    {categoryLabel(article.category)}
                  </span>
                  {article.isFeatured && (
                    <span className="rounded bg-warning-subtle px-2 py-0.5 text-xs font-medium text-warning-strong">
                      {t('newsDetail.featured')}
                    </span>
                  )}
                </div>

                <h1 className="mb-4 text-xl font-bold leading-snug text-foreground md:text-2xl">
                  {article.title}
                </h1>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3.5 w-3.5" />
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      {t('newsDetail.minutes', { count: article.readTime })}
                    </span>
                    <span className="flex items-center">
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      {formatViews(article.views)}
                    </span>
                  </div>
                  {article.author && (
                    <span className="text-muted-foreground">{t('newsDetail.byAuthor', { author: article.author })}</span>
                  )}
                </div>

                {article.summary && (
                  <p className="mb-4 font-medium leading-relaxed text-muted-foreground">
                    {article.summary}
                  </p>
                )}

                <div
                  className="prose prose-sm max-w-none leading-relaxed text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: article.content || `<p>${t('newsDetail.noContent')}</p>`,
                  }}
                />

                {article.tags && article.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </>
        )}

        {/* Empty fallback Back button if loading or any other state without page header */}
        {loading && (
          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
            <button onClick={() => navigate(-1)} className="text-sm">
              {t('common.back')}
            </button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default NewsDetail;
