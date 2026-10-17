import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from '@/hooks/useTheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { CookiePreloader } from '@/components/CookiePreloader';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { loadAnalytics } from '@/lib/analytics';
import './App.css';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // Переход на якорь (/ru#about) прокручивает сама страница — не перебиваем его скроллом наверх.
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);
  return null;
}

// Определяем язык браузера
function detectBrowserLanguage(): string {
  // SSR-guard: во время renderToString navigator нет — отдаём дефолт фазы 1 (ru).
  if (typeof navigator === 'undefined') return 'ru';
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'de';
  const lang = browserLang.slice(0, 2).toLowerCase();
  const supportedLangs = ['ru', 'de', 'en'];
  return supportedLangs.includes(lang) ? lang : 'ru';
}

function LangLayout() {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && ['de', 'en', 'ru'].includes(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [i18n, lang]);
  
  const seoData = {
    en: { lang: 'en', title: 'Pavel Levdin - Web Coding, SEO, AI Search and Automation' },
    ru: { lang: 'ru', title: 'Павел Левдин - веб-кодинг, SEO, AI Search и автоматизация' },
    de: { lang: 'de', title: 'Pavel Levdin - Web Coding, SEO, AI Search und Automation' },
  };
  
  const currentSeo = seoData[lang as keyof typeof seoData] || seoData.de;
  
  return (
    <>
      <Helmet>
        <html lang={currentSeo.lang} />
        <title>{currentSeo.title}</title>
      </Helmet>
      <Layout>
        <Suspense fallback={<AdminFallback />}>
          <Outlet />
        </Suspense>
      </Layout>
    </>
  );
}

// Публичные страницы — lazy, чтобы не раздувать стартовый бандл (Home грузится сразу как вход)
const PortfolioPage = lazy(() => import('@/pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const ServicesPage = lazy(() => import('@/pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const BriefPage = lazy(() => import('@/pages/BriefPage').then(m => ({ default: m.BriefPage })));
const BusinessCardPage = lazy(() => import('@/pages/BusinessCardPage').then(m => ({ default: m.BusinessCardPage })));
const ImprintPage = lazy(() => import('@/pages/ImprintPage').then(m => ({ default: m.ImprintPage })));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const BlogList = lazy(() => import('@/pages/blog/BlogList').then(m => ({ default: m.BlogList })));
const BlogPost = lazy(() => import('@/pages/blog/BlogPost').then(m => ({ default: m.BlogPost })));
const CategoryPage = lazy(() => import('@/pages/blog/CategoryPage').then(m => ({ default: m.CategoryPage })));
const TagPage = lazy(() => import('@/pages/blog/TagPage').then(m => ({ default: m.TagPage })));

// Admin pages (lazy-loaded)
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminArticles = lazy(() => import('@/pages/admin/AdminArticles').then(m => ({ default: m.AdminArticles })));
const AdminSocial = lazy(() => import('@/pages/admin/AdminSocial').then(m => ({ default: m.AdminSocial })));
const AdminPublications = lazy(() => import('@/pages/admin/AdminPublications').then(m => ({ default: m.AdminPublications })));
const AdminCreatePublication = lazy(() => import('@/pages/admin/AdminCreatePublication').then(m => ({ default: m.AdminCreatePublication })));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminManualPublish = lazy(() => import('@/pages/admin/AdminManualPublish').then(m => ({ default: m.AdminManualPublish })));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminProtectedRoute = lazy(() => import('@/components/admin/AdminProtectedRoute').then(m => ({ default: m.AdminProtectedRoute })));

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

// Router-agnostic содержимое приложения: маршруты + cookie-баннер.
// Клиент оборачивает это в <BrowserRouter>, SSR-пререндер — в <StaticRouter> (см. entry-server.tsx).
export function AppRoutes() {
  const { consent, isLoaded, accept, decline } = useCookieConsent();

  useEffect(() => {
    if (consent === true) loadAnalytics();
  }, [consent]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to={`/${detectBrowserLanguage()}`} replace />} />
        <Route path="/:lang" element={<LangLayout />}>
          <Route index element={<Home />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="brief" element={<BriefPage />} />
          <Route path="business-card" element={<BusinessCardPage />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="blog/category/:category" element={<CategoryPage />} />
          <Route path="blog/tag/:tag" element={<TagPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="imprint" element={<ImprintPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
        </Route>
        {/* Admin routes (lazy-loaded, separate layout) */}
        <Route path="/:lang/admin">
          <Route index element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />
          <Route element={<Suspense fallback={<AdminFallback />}><AdminProtectedRoute /></Suspense>}>
            <Route element={<Suspense fallback={<AdminFallback />}><AdminLayout /></Suspense>}>
              <Route path="dashboard" element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
              <Route path="analytics" element={<Suspense fallback={<AdminFallback />}><AdminAnalytics /></Suspense>} />
              <Route path="articles" element={<Suspense fallback={<AdminFallback />}><AdminArticles /></Suspense>} />
              <Route path="social" element={<Suspense fallback={<AdminFallback />}><AdminSocial /></Suspense>} />
              <Route path="publications" element={<Suspense fallback={<AdminFallback />}><AdminPublications /></Suspense>} />
              <Route path="publications/create" element={<Suspense fallback={<AdminFallback />}><AdminCreatePublication /></Suspense>} />
              <Route path="publish" element={<Suspense fallback={<AdminFallback />}><AdminManualPublish /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<AdminFallback />}><AdminSettings /></Suspense>} />
            </Route>
          </Route>
        </Route>
      </Routes>
      {isLoaded && consent === null && <CookiePreloader onAccept={accept} onDecline={decline} />}
    </>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
