import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, Send, Rocket, ShoppingCart, AppWindow,
  TrendingUp, Bot, Globe, Share2, LineChart, PenLine, Search, Layout as LayoutIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PACKAGES } from '@/data/pricing';

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '';
const LEAD_ENDPOINT = `${API_BASE}/api/lead`;
const YM_ID = 108284704;

// Аналитика: события отправляются в Метрику/GA только если они уже загружены (после согласия)
function track(event: string, params?: Record<string, unknown>) {
  const w = window as unknown as { ym?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };
  try {
    if (typeof w.ym === 'function') w.ym(YM_ID, 'reachGoal', event, params);
    if (typeof w.gtag === 'function') w.gtag('event', event, params);
  } catch { /* аналитика не должна ломать форму */ }
}

const fmt = (n: number) => n.toLocaleString('ru-RU');

type Group = 'dev' | 'setup' | 'monthly';
interface Module {
  id: string;
  group: Group;
  title: string;
  desc: string;
  from: number;
  monthly?: boolean;
  icon: typeof Rocket;
}

// Цены «от» (₽): разработка, интеграции и SEO — из единого прайса src/data/pricing.json (медиана регионального рынка РФ),
// остальные модули — собственные ориентиры калькулятора.
const rub = (id: string, fallback: number) => PACKAGES.find((p) => p.id === id)?.price.ru ?? fallback;
const MODULES: Module[] = [
  { id: 'landing', group: 'dev', title: 'Лендинг / одностраничник', desc: 'Дизайн, адаптив, быстрая загрузка, форма заявок', from: rub('landing', 45000), icon: LayoutIcon },
  { id: 'corporate', group: 'dev', title: 'Корпоративный сайт', desc: 'Многостраничник: услуги, блог, кейсы, формы', from: rub('business-site', 120000), icon: Globe },
  { id: 'shop', group: 'dev', title: 'Интернет-магазин', desc: 'Каталог, корзина, оплата, админка', from: rub('shop', 100000), icon: ShoppingCart },
  { id: 'webapp', group: 'dev', title: 'Веб-приложение / MVP', desc: 'Личный кабинет, логика, API, интеграции', from: rub('web-app', 180000), icon: AppWindow },
  { id: 'localbiz', group: 'setup', title: 'Google + Яндекс Бизнес', desc: 'Профили, карты, категории, фото, отзывы', from: 8000, icon: Search },
  { id: 'social', group: 'setup', title: 'Оформление соцсетей', desc: 'Визуал, шапки, настройка бизнес-аккаунтов', from: 15000, icon: Share2 },
  { id: 'analytics', group: 'setup', title: 'Веб-аналитика', desc: 'Яндекс.Метрика + GA4, цели и события', from: 15000, icon: LineChart },
  { id: 'crm', group: 'setup', title: 'CRM и автоматизация', desc: 'Интеграция CRM, боты, автоворонки (при наличии нужного обеспечения)', from: rub('integrations', 25000), icon: Bot },
  { id: 'content', group: 'setup', title: 'Контент / копирайтинг', desc: 'Тексты под задачи и SEO, пакет страниц', from: 15000, icon: PenLine },
  { id: 'seo', group: 'monthly', title: 'SEO-продвижение', desc: 'Ключи, структура, ссылки, рост позиций', from: rub('seo-care', 25000), monthly: true, icon: TrendingUp },
];

interface Goal { id: string; title: string; preselect: string[]; icon: typeof Rocket }
const GOALS: Goal[] = [
  { id: 'new-site', title: 'Нужен новый сайт', preselect: ['landing'], icon: Rocket },
  { id: 'shop', title: 'Интернет-магазин', preselect: ['shop'], icon: ShoppingCart },
  { id: 'webapp', title: 'Веб-приложение / сервис', preselect: ['webapp'], icon: AppWindow },
  { id: 'promote', title: 'Продвинуть существующий', preselect: ['seo', 'localbiz'], icon: TrendingUp },
  { id: 'automate', title: 'Автоматизация / CRM', preselect: ['crm'], icon: Bot },
];

const BUDGETS = ['до 50 000 ₽', '50 000 – 150 000 ₽', '150 000 – 500 000 ₽', 'от 500 000 ₽', 'пока не знаю'];
const DEADLINES = ['Срочно (1–2 недели)', '2–4 недели', '1–2 месяца', 'Гибко'];

const STEP_TITLES = ['Что нужно?', 'Соберите проект', 'Детали', 'Контакт'];

// Точный расчёт «от–до» со сроком и разбивкой — в калькуляторе (/calculator, общий модуль src/lib/calculator.ts).
// Здесь — только ориентир «от» по пакетам для брифа.
const CALC_HINT = {
  ru: 'Нужна цена «от–до» и срок с разбивкой? Откройте калькулятор',
  de: 'Preisrahmen und Dauer mit Aufschlüsselung? Zum Kostenrechner',
  en: 'Need a price range and timeline with a breakdown? Open the calculator',
} as const;

export function BriefPage() {
  const { i18n } = useTranslation();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru') as 'de' | 'en' | 'ru';

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [business, setBusiness] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const totals = useMemo(() => {
    let once = 0;
    let monthly = 0;
    selected.forEach((id) => {
      const m = MODULES.find((x) => x.id === id);
      if (!m) return;
      if (m.monthly) monthly += m.from;
      else once += m.from;
    });
    return { once, monthly };
  }, [selected]);

  const toggle = (id: string) => {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const pickGoal = (g: Goal) => {
    setGoal(g.id);
    setSelected((cur) => Array.from(new Set([...cur, ...g.preselect])));
    track('brief_goal', { goal: g.id });
    goNext(1);
  };

  const goNext = (to?: number) => {
    const next = to ?? step + 1;
    setStep(next);
    track('brief_step', { step: next });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canNext = () => {
    if (step === 1) return selected.length > 0;
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('sending');

    const summary = selected
      .map((id) => MODULES.find((m) => m.id === id)?.title)
      .filter(Boolean)
      .join(', ');

    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          type: 'brief',
          page: goal ? `brief:${goal}` : 'brief',
          name: data.get('name'),
          contact: data.get('contact'),
          business,
          budget: budget || `от ${fmt(totals.once)} ₽${totals.monthly ? ` + ${fmt(totals.monthly)} ₽/мес` : ''}`,
          deadline,
          details,
          selectedServices: summary,
          language: lang,
          consent: data.get('consent') === 'on',
          company_website: data.get('company_website') || '',
        }),
      });
      if (!response.ok) throw new Error('failed');
      track('brief_submit', { once: totals.once, monthly: totals.monthly, modules: selected.length });
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setStatus('error');
    }
  };

  const progress = ((step + 1) / STEP_TITLES.length) * 100;

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>Конструктор проекта — рассчитайте стоимость | PL Innovativ Digitalbau</title>
        <meta name="description" content="Соберите цифровой проект под ключ по шагам и узнайте ориентировочную стоимость: сайт, магазин, SEO, соцсети, аналитика, CRM и автоматизация." />
        <link rel="canonical" href={`https://pavellevdin.ru/${lang}/brief`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950 pt-28 text-white">
        <section className="relative overflow-hidden px-4 pb-24 sm:px-6 lg:px-8">

          <div className="relative mx-auto max-w-3xl">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-8 text-center md:p-12"
              >
                <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/15">
                  <Check className="h-7 w-7 text-emerald-300" />
                </div>
                <h1 className="text-3xl font-black md:text-4xl">Бриф получен 🎯</h1>
                <p className="mx-auto mt-4 max-w-md text-white/70">
                  Ваш проект — <span className="font-bold text-white">от {fmt(totals.once)} ₽</span>
                  {totals.monthly > 0 && <> и <span className="font-bold text-white">{fmt(totals.monthly)} ₽/мес</span></>}.
                  Я свяжусь с вами в течение 2 часов, уточню детали и пришлю точную смету.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to={`/${lang}/portfolio`}>
                    <Button variant="outline" className="h-12 w-full rounded-xl border-white/20 bg-white/[0.05] text-white hover:bg-white hover:text-slate-950 sm:w-auto">
                      Посмотреть работы
                    </Button>
                  </Link>
                  <a href="https://t.me/PavelLevdin" target="_blank" rel="noopener noreferrer">
                    <Button className="h-12 w-full rounded-xl bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200 sm:w-auto">
                      <Send className="mr-2 h-4 w-4" /> Написать в Telegram
                    </Button>
                  </a>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="mb-8">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
                    Конструктор проекта · шаг {step + 1} из {STEP_TITLES.length}
                  </span>
                  <h1 className="text-3xl font-black leading-tight md:text-5xl">{STEP_TITLES[step]}</h1>

                  <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-cyan-300"
                      animate={{ width: `${progress}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    />
                  </div>
                </div>

                {step === 0 && (
                  <Link
                    to={`/${lang}/calculator`}
                    className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.06] p-4 text-sm text-cyan-50 transition hover:border-cyan-300/50"
                  >
                    <span>{CALC_HINT[lang]}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>
                )}

                <AnimatePresence mode="wait">
                  {/* ШАГ 1 — цель */}
                  {step === 0 && (
                    <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-3">
                      {GOALS.map((g) => {
                        const Icon = g.icon;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => pickGoal(g)}
                            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.08]"
                          >
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[0.08] text-cyan-100">
                              <Icon className="h-6 w-6" />
                            </span>
                            <span className="flex-1 text-lg font-bold">{g.title}</span>
                            <ArrowRight className="h-5 w-5 text-white/40 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* ШАГ 2 — модули */}
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                      {(['dev', 'setup', 'monthly'] as Group[]).map((grp) => (
                        <div key={grp} className="mb-6">
                          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-100/60">
                            {grp === 'dev' ? 'Разработка · разово' : grp === 'setup' ? 'Настройка · разово' : 'Продвижение · ежемесячно'}
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {MODULES.filter((m) => m.group === grp).map((m) => {
                              const Icon = m.icon;
                              const checked = selected.includes(m.id);
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  aria-pressed={checked}
                                  onClick={() => toggle(m.id)}
                                  className={`flex flex-col rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                                    checked ? 'border-cyan-300/50 bg-cyan-300/[0.10] shadow-glow-sm' : 'border-white/10 bg-white/[0.05] hover:border-white/25'
                                  }`}
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${checked ? 'bg-cyan-300/20 text-cyan-100' : 'bg-white/[0.08] text-white/70'}`}>
                                      <Icon className="h-5 w-5" />
                                    </span>
                                    <span className={`grid h-6 w-6 place-items-center rounded-md border ${checked ? 'border-cyan-300 bg-cyan-300 text-slate-950' : 'border-white/20'}`}>
                                      {checked && <Check className="h-4 w-4" />}
                                    </span>
                                  </div>
                                  <span className="font-bold">{m.title}</span>
                                  <span className="mt-1 text-xs leading-5 text-white/55">{m.desc}</span>
                                  <span className="mt-3 font-mono text-sm font-bold text-cyan-200">
                                    от {fmt(m.from)} ₽{m.monthly ? '/мес' : ''}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* ШАГ 3 — детали */}
                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-6">
                      <div>
                        <Label className="mb-3 block text-sm text-white/70">Ориентир бюджета</Label>
                        <div className="flex flex-wrap gap-2">
                          {BUDGETS.map((b) => (
                            <button key={b} type="button" onClick={() => setBudget(b)}
                              className={`rounded-xl border px-4 py-2 text-sm transition ${budget === b ? 'border-cyan-300/50 bg-cyan-300/12 text-cyan-100' : 'border-white/12 bg-white/[0.05] text-white/70 hover:border-white/25'}`}>
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-3 block text-sm text-white/70">Желаемый срок</Label>
                        <div className="flex flex-wrap gap-2">
                          {DEADLINES.map((d) => (
                            <button key={d} type="button" onClick={() => setDeadline(d)}
                              className={`rounded-xl border px-4 py-2 text-sm transition ${deadline === d ? 'border-cyan-300/50 bg-cyan-300/12 text-cyan-100' : 'border-white/12 bg-white/[0.05] text-white/70 hover:border-white/25'}`}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="business" className="mb-2 block text-sm text-white/70">Бизнес / ниша</Label>
                        <Input id="business" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Например: строительство, доставка, услуги" className="border-white/10 bg-slate-950/50 text-white" />
                      </div>
                      <div>
                        <Label htmlFor="details" className="mb-2 block text-sm text-white/70">Что важно рассказать о проекте?</Label>
                        <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Задача, примеры, пожелания, ссылки" className="border-white/10 bg-slate-950/50 text-white" />
                      </div>
                    </motion.div>
                  )}

                  {/* ШАГ 4 — контакт */}
                  {step === 3 && (
                    <motion.form key="s3" onSubmit={handleSubmit} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid gap-5">
                      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                      <div>
                        <Label htmlFor="name" className="mb-2 block text-sm text-white/70">Как вас зовут?</Label>
                        <Input id="name" name="name" required className="border-white/10 bg-slate-950/50 text-white" />
                      </div>
                      <div>
                        <Label htmlFor="contact" className="mb-2 block text-sm text-white/70">Контакт (Email, Telegram или телефон)</Label>
                        <Input id="contact" name="contact" required className="border-white/10 bg-slate-950/50 text-white" />
                      </div>
                      <label className="flex items-start gap-3 text-sm text-white/60">
                        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-cyan-300" />
                        <span>
                          Я согласен на обработку персональных данных для обработки заявки.{' '}
                          <Link to={`/${lang}/privacy`} className="text-cyan-200 underline">Политика конфиденциальности</Link>
                        </span>
                      </label>
                      {status === 'error' && (
                        <p className="rounded-xl bg-red-400/10 p-3 text-sm text-red-200">Ошибка отправки. Напишите в Telegram: @PavelLevdin</p>
                      )}
                      <Button disabled={status === 'sending'} className="h-12 rounded-xl bg-cyan-300 font-black text-slate-950 hover:bg-cyan-200">
                        {status === 'sending' ? 'Отправляю…' : 'Отправить заявку'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Итоговая панель + навигация */}
                <div className="sticky bottom-4 mt-8 rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-white/45">Ориентир</p>
                      <p className="font-mono text-lg font-black text-white">
                        от {fmt(totals.once)} ₽
                        {totals.monthly > 0 && <span className="text-cyan-200"> + {fmt(totals.monthly)} ₽/мес</span>}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {step > 0 && (
                        <Button type="button" variant="outline" onClick={goBack} className="h-11 rounded-xl border-white/20 bg-white/[0.05] text-white hover:bg-white hover:text-slate-950">
                          <ArrowLeft className="mr-1 h-4 w-4" /> Назад
                        </Button>
                      )}
                      {step < STEP_TITLES.length - 1 && step !== 0 && (
                        <Button type="button" onClick={() => canNext() && goNext()} disabled={!canNext()}
                          className="h-11 rounded-xl bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-40">
                          Далее <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {step === 1 && selected.length === 0 && (
                    <p className="mt-2 text-xs text-amber-200/80">Выберите хотя бы один модуль, чтобы продолжить.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
