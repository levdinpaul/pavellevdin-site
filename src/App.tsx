import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from '@/hooks/useTheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { PlatformRedirect } from '@/components/PlatformRedirect';
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
  
  // title/description/canonical — только на уровне страницы (PageMeta/Helmet страницы): с React 19 каждый уровень Helmet
  // давал свой <title> в head и в теле пререндера.
  const htmlLang = lang && ['de', 'en', 'ru'].includes(lang) ? lang : 'ru';

  return (
    <>
      <Helmet>
        <html lang={htmlLang} />
      </Helmet>
      <Layout>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </Layout>
    </>
  );
}

// Публичные страницы — lazy, чтобы не раздувать стартовый бандл (Home грузится сразу как вход)
const PortfolioPage = lazy(() => import('@/pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const ProjectPage = lazy(() => import('@/pages/ProjectPage').then(m => ({ default: m.ProjectPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import('@/pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ServiceLandingPage = lazy(() => import('@/pages/ServiceLandingPage').then(m => ({ default: m.ServiceLandingPage })));
const ReviewPage = lazy(() => import('@/pages/ReviewPage').then(m => ({ default: m.ReviewPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const BriefPage = lazy(() => import('@/pages/BriefPage').then(m => ({ default: m.BriefPage })));
const CalculatorPage = lazy(() => import('@/pages/CalculatorPage').then(m => ({ default: m.CalculatorPage })));
const BusinessCardPage = lazy(() => import('@/pages/BusinessCardPage').then(m => ({ default: m.BusinessCardPage })));
const ImprintPage = lazy(() => import('@/pages/ImprintPage').then(m => ({ default: m.ImprintPage })));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

// Короткая ссылка /review/<token> → /ru/review/<token>
function ReviewRedirect() {
  const { token } = useParams();
  return <Navigate to={`/ru/review/${token ?? ''}`} replace />;
}

// Router-agnostic содержимое приложения: маршруты + cookie-баннер.
// Клиент оборачивает это в <BrowserRouter>, SSR-пререндер — в <StaticRouter> (см. entry-server.tsx).
export function AppRoutes() {
  const { consent, isLoaded, accept, decline } = useCookieConsent();
  const { pathname } = useLocation();
  const isRu = pathname === '/ru' || pathname.startsWith('/ru/');

  // GA4 — на всех языках после согласия; Яндекс.Метрика — только на /ru (рынок РФ).
  useEffect(() => {
    if (consent === true) loadAnalytics({ yandex: isRu });
  }, [consent, isRu]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to={`/${detectBrowserLanguage()}`} replace />} />
        <Route path="/review/:token" element={<ReviewRedirect />} />
        <Route path="/:lang" element={<LangLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="portfolio/:slug" element={<ProjectPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:slug" element={<ServiceLandingPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="brief" element={<BriefPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="business-card" element={<BusinessCardPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="imprint" element={<ImprintPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="review/:token" element={<ReviewPage />} />
          {/* Блог / кабинет / админка / вход — на pl-platform (nginx). Внутри SPA → полная перезагрузка. */}
          <Route path="blog/*" element={<PlatformRedirect />} />
          <Route path="cabinet/*" element={<PlatformRedirect />} />
          <Route path="admin/*" element={<PlatformRedirect />} />
          <Route path="login" element={<PlatformRedirect />} />
          <Route path="register" element={<PlatformRedirect />} />
          <Route path="forgot-password" element={<PlatformRedirect />} />
          <Route path="reset-password" element={<PlatformRedirect />} />
          <Route path="set-password" element={<PlatformRedirect />} />
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
