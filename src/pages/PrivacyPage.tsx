import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/pl/PageMeta';
import { useRef } from 'react';
import { useBuildReveal } from '@/components/BuildReveal';
import { getEmail } from '@/constants/contacts';
import {
  Shield, Building2, Database, Target, Scale, Server,
  Share2, Cookie, UserCheck, Undo2, Lock, Gavel, FileText, type LucideIcon,
} from 'lucide-react';

interface Section {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

interface Policy {
  seoTitle: string;
  seoDesc: string;
  title: string;
  intro: string;
  updatedLabel: string;
  updated: string;
  contactLabel: string;
  sections: Section[];
}

const sectionIcons: LucideIcon[] = [
  Shield, Building2, Database, Target, Scale, Server,
  Share2, Cookie, UserCheck, Undo2, Lock, Gavel, FileText,
];

const SITE = 'pavellevdin.ru';

// Почта оператора зависит от локали (constants/contacts). В de/en аналитика — только GA4, без Яндекса.
const buildPolicy = (OPERATOR_EMAIL: string): Record<'ru' | 'en' | 'de', Policy> => ({
  ru: {
    seoTitle: 'Политика конфиденциальности | Delimes',
    seoDesc: 'Политика обработки персональных данных сайта в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».',
    title: 'Политика конфиденциальности',
    intro: 'Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта и разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».',
    updatedLabel: 'Дата последнего обновления',
    updated: '6 июля 2026 г.',
    contactLabel: 'Контакт по вопросам обработки персональных данных',
    sections: [
      {
        heading: '1. Общие положения',
        paragraphs: [
          `Политика регулирует обработку персональных данных пользователей сайта ${SITE} (далее — «Сайт») Оператором и разработана во исполнение требований п. 2 ч. 1 ст. 18.1 Федерального закона № 152-ФЗ.`,
          'Использование Сайта и отправка любой формы означают согласие пользователя с настоящей Политикой и условиями обработки его персональных данных. В случае несогласия пользователю следует воздержаться от использования соответствующих функций Сайта.',
        ],
      },
      {
        heading: '2. Оператор персональных данных',
        paragraphs: ['Оператором персональных данных (далее — «Оператор») является:'],
        items: [
          'Павел Левдин',
          'Адрес: Ганновер, Германия',
          `Электронная почта: ${OPERATOR_EMAIL}`,
        ],
      },
      {
        heading: '3. Персональные данные, которые обрабатываются',
        paragraphs: ['При заполнении форм на Сайте (форма связи и конфигуратор проекта) Оператор обрабатывает данные, которые вы предоставляете добровольно:'],
        items: [
          'имя;',
          'контактные данные: адрес электронной почты, номер телефона, идентификатор в мессенджере (Telegram, WhatsApp);',
          'сведения о проекте: сфера бизнеса, бюджет, сроки, описание задачи и выбранные услуги;',
          'содержание вашего сообщения.',
        ],
      },
      {
        heading: '4. Автоматически собираемые данные',
        paragraphs: ['При использовании Сайта автоматически обрабатываются технические данные: IP-адрес, сведения о браузере и устройстве, файлы cookie, а также данные о действиях на Сайте, собираемые системами веб-аналитики. Оператор не обрабатывает специальные категории персональных данных (о состоянии здоровья, расовой или национальной принадлежности, политических взглядах и т. п.).'],
      },
      {
        heading: '5. Цели обработки',
        items: [
          'обработка заявок и обращений, ответ на них;',
          'подготовка коммерческого предложения, плана работ, сроков и стоимости;',
          'связь с вами по вашему запросу;',
          'ведение статистики посещений и улучшение работы Сайта.',
        ],
      },
      {
        heading: '6. Правовые основания обработки',
        paragraphs: ['Обработка персональных данных осуществляется на основании:'],
        items: [
          'согласия субъекта персональных данных на обработку (п. 1 ч. 1 ст. 6 152-ФЗ), которое вы предоставляете, отмечая соответствующий чекбокс при отправке формы;',
          'необходимости обработки для заключения и исполнения договора, стороной которого является субъект персональных данных.',
        ],
      },
      {
        heading: '7. Порядок обработки, сроки и локализация',
        paragraphs: [
          'Обработка ведётся как с использованием средств автоматизации, так и без них.',
          'Запись, систематизация, накопление, хранение, уточнение и извлечение персональных данных граждан Российской Федерации осуществляются с использованием баз данных, находящихся на территории Российской Федерации (ч. 5 ст. 18 152-ФЗ).',
          'Персональные данные хранятся не дольше, чем этого требуют цели обработки, но не более 1 (одного) года с момента последнего обращения, если иное не предусмотрено законом или договором. По достижении целей обработки либо при отзыве согласия данные подлежат уничтожению или обезличиванию.',
        ],
      },
      {
        heading: '8. Передача данных третьим лицам',
        paragraphs: ['Оператор не продаёт персональные данные и не передаёт их третьим лицам, за исключением случаев, необходимых для достижения целей обработки:'],
        items: [
          'сервис Telegram — для доставки Оператору уведомления о вашей заявке;',
          'система веб-аналитики Яндекс.Метрика — для сбора обезличенной статистики;',
          'хостинг-провайдер Сайта — для технического функционирования и хранения данных.',
        ],
      },
      {
        heading: '9. Файлы cookie и веб-аналитика',
        paragraphs: [
          'Сайт использует файлы cookie и системы веб-аналитики (Яндекс.Метрика, в том числе технология «Вебвизор») для анализа поведения пользователей и улучшения Сайта.',
          'Вы можете отказаться от аналитических cookie в баннере согласия при первом посещении, а также отключить cookie в настройках браузера. Отключение отдельных cookie может повлиять на работу некоторых функций Сайта.',
        ],
      },
      {
        heading: '10. Права субъекта персональных данных',
        paragraphs: ['В соответствии со ст. 14 152-ФЗ вы имеете право:'],
        items: [
          'получать информацию об обработке ваших персональных данных;',
          'требовать уточнения, блокирования или уничтожения данных, если они неполны, устарели, неточны либо обрабатываются с нарушением закона;',
          'отозвать согласие на обработку персональных данных;',
          'обжаловать действия или бездействие Оператора.',
        ],
      },
      {
        heading: '11. Отзыв согласия',
        paragraphs: [`Вы вправе в любой момент отозвать согласие на обработку персональных данных, направив письменное уведомление на адрес ${OPERATOR_EMAIL}. После получения отзыва Оператор прекращает обработку и уничтожает данные в срок, установленный законом, при отсутствии иных законных оснований для обработки.`],
      },
      {
        heading: '12. Защита персональных данных',
        paragraphs: ['Оператор принимает необходимые правовые, организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования и распространения. Передача данных при отправке форм осуществляется по защищённому протоколу HTTPS/TLS.'],
      },
      {
        heading: '13. Обращения, жалобы и изменения Политики',
        paragraphs: [
          `По вопросам обработки персональных данных обращайтесь к Оператору по адресу ${OPERATOR_EMAIL}. Вы также вправе обжаловать действия Оператора в Федеральной службе по надзору в сфере связи, информационных технологий и массовых коммуникаций (Роскомнадзор).`,
          'Оператор вправе вносить изменения в настоящую Политику. Актуальная редакция всегда размещается на данной странице; дата последнего обновления указана ниже.',
        ],
      },
    ],
  },
  en: {
    seoTitle: 'Privacy Policy | Delimes',
    seoDesc: 'Personal data processing policy in accordance with Russian Federal Law No. 152-FZ “On Personal Data”.',
    title: 'Privacy Policy',
    intro: 'This Policy defines how users’ personal data is processed and protected and is drawn up in accordance with Russian Federal Law No. 152-FZ of 27 July 2006 “On Personal Data”.',
    updatedLabel: 'Last updated',
    updated: 'July 6, 2026',
    contactLabel: 'Contact for personal data matters',
    sections: [
      {
        heading: '1. General provisions',
        paragraphs: [
          `This Policy governs the Operator’s processing of personal data of users of the website ${SITE} (the “Website”) and is published pursuant to Art. 18.1(1)(2) of Federal Law No. 152-FZ.`,
          'Using the Website and submitting any form constitute the user’s consent to this Policy and to the processing of their personal data. If you do not agree, please refrain from using the relevant features.',
        ],
      },
      {
        heading: '2. Data operator',
        paragraphs: ['The personal data operator (the “Operator”) is:'],
        items: ['Pavel Levdin', 'Address: Hannover, Germany', `Email: ${OPERATOR_EMAIL}`],
      },
      {
        heading: '3. Personal data we process',
        paragraphs: ['When you fill in the Website forms (contact form and project configurator), the Operator processes data you provide voluntarily:'],
        items: [
          'name;',
          'contact details: email, phone number, messenger handle (Telegram, WhatsApp);',
          'project details: business area, budget, timeline, task description and selected services;',
          'the content of your message.',
        ],
      },
      {
        heading: '4. Automatically collected data',
        paragraphs: ['When you use the Website, technical data is processed automatically: IP address, browser and device data, cookies, and data about actions on the Website collected by web-analytics systems. The Operator does not process special categories of personal data (health, race, political views, etc.).'],
      },
      {
        heading: '5. Purposes of processing',
        items: [
          'handling and answering requests and enquiries;',
          'preparing a commercial offer, work plan, timeline and cost;',
          'contacting you upon your request;',
          'keeping visit statistics and improving the Website.',
        ],
      },
      {
        heading: '6. Legal grounds',
        paragraphs: ['Processing is carried out on the basis of:'],
        items: [
          'the data subject’s consent (Art. 6(1)(1) of 152-FZ), which you give by ticking the relevant checkbox when submitting a form;',
          'the necessity of processing to conclude and perform a contract to which the data subject is a party.',
        ],
      },
      {
        heading: '7. Procedure, retention and localisation',
        paragraphs: [
          'Processing is carried out both with and without automation means.',
          'Recording, systematisation, accumulation, storage, updating and retrieval of personal data of citizens of the Russian Federation are carried out using databases located within the Russian Federation (Art. 18(5) of 152-FZ).',
          'Personal data is stored no longer than the purposes require, but no more than one (1) year from the last enquiry, unless otherwise provided by law or contract. Once the purposes are achieved or consent is withdrawn, the data is destroyed or anonymised.',
        ],
      },
      {
        heading: '8. Data sharing with third parties',
        paragraphs: ['The Operator does not sell personal data and does not share it with third parties, except where necessary to achieve the purposes of processing:'],
        items: [
          'Telegram — to deliver a notification of your request to the Operator;',
          'Google Analytics 4 (Google Ireland Ltd.) — only with your consent, to collect anonymised statistics;',
          'the Website’s hosting provider — for technical operation and data storage.',
        ],
      },
      {
        heading: '9. Cookies and web analytics',
        paragraphs: [
          'With your consent, the Website uses cookies and Google Analytics 4 (IP anonymisation enabled) to analyse usage and improve the Website. Without consent no analytics scripts are loaded.',
          'You can decline analytics cookies in the consent banner on your first visit and disable cookies in your browser settings. Disabling some cookies may affect certain Website features.',
        ],
      },
      {
        heading: '10. Rights of the data subject',
        paragraphs: ['Under Art. 14 of 152-FZ you have the right to:'],
        items: [
          'obtain information about the processing of your personal data;',
          'request clarification, blocking or destruction of data that is incomplete, outdated, inaccurate or processed unlawfully;',
          'withdraw your consent to processing;',
          'appeal the Operator’s actions or omissions.',
        ],
      },
      {
        heading: '11. Withdrawal of consent',
        paragraphs: [`You may withdraw your consent to the processing of personal data at any time by sending a written notice to ${OPERATOR_EMAIL}. Upon receipt, the Operator ceases processing and destroys the data within the period established by law, absent other lawful grounds for processing.`],
      },
      {
        heading: '12. Data protection',
        paragraphs: ['The Operator takes the necessary legal, organisational and technical measures to protect personal data against unlawful or accidental access, destruction, alteration, blocking, copying and distribution. Data submitted via forms is transmitted over a secure HTTPS/TLS connection.'],
      },
      {
        heading: '13. Enquiries, complaints and changes',
        paragraphs: [
          `For personal data matters, contact the Operator at ${OPERATOR_EMAIL}. You may also appeal the Operator’s actions to Roskomnadzor (the Russian Federal Service for Supervision of Communications, IT and Mass Media).`,
          'The Operator may amend this Policy. The current version is always available on this page; the last update date is shown below.',
        ],
      },
    ],
  },
  de: {
    seoTitle: 'Datenschutzrichtlinie | Delimes',
    seoDesc: 'Richtlinie zur Verarbeitung personenbezogener Daten gemäß dem russischen Föderationsgesetz Nr. 152-FZ „Über personenbezogene Daten“.',
    title: 'Datenschutzrichtlinie',
    intro: 'Diese Richtlinie regelt die Verarbeitung und den Schutz personenbezogener Daten der Nutzer der Website und wurde gemäß dem russischen Föderationsgesetz Nr. 152-FZ vom 27.07.2006 „Über personenbezogene Daten“ erstellt.',
    updatedLabel: 'Zuletzt aktualisiert',
    updated: '6. Juli 2026',
    contactLabel: 'Kontakt für Fragen zur Datenverarbeitung',
    sections: [
      {
        heading: '1. Allgemeine Bestimmungen',
        paragraphs: [
          `Diese Richtlinie regelt die Verarbeitung personenbezogener Daten der Nutzer der Website ${SITE} (die „Website“) durch den Betreiber und wird gemäß Art. 18.1 Abs. 1 Nr. 2 des Gesetzes Nr. 152-FZ veröffentlicht.`,
          'Die Nutzung der Website und das Absenden eines Formulars gelten als Einwilligung des Nutzers in diese Richtlinie und in die Verarbeitung seiner personenbezogenen Daten. Bei Nichteinverständnis nutzen Sie die entsprechenden Funktionen bitte nicht.',
        ],
      },
      {
        heading: '2. Betreiber',
        paragraphs: ['Betreiber der personenbezogenen Daten (der „Betreiber“) ist:'],
        items: ['Pavel Levdin', 'Adresse: Hannover, Deutschland', `E-Mail: ${OPERATOR_EMAIL}`],
      },
      {
        heading: '3. Verarbeitete personenbezogene Daten',
        paragraphs: ['Beim Ausfüllen der Formulare (Kontaktformular und Projekt-Konfigurator) verarbeitet der Betreiber die von Ihnen freiwillig angegebenen Daten:'],
        items: [
          'Name;',
          'Kontaktdaten: E-Mail, Telefonnummer, Messenger-Kennung (Telegram, WhatsApp);',
          'Projektangaben: Branche, Budget, Fristen, Aufgabenbeschreibung und gewählte Leistungen;',
          'Inhalt Ihrer Nachricht.',
        ],
      },
      {
        heading: '4. Automatisch erfasste Daten',
        paragraphs: ['Bei der Nutzung der Website werden automatisch technische Daten verarbeitet: IP-Adresse, Browser- und Gerätedaten, Cookies sowie durch Web-Analyse erfasste Nutzungsdaten. Besondere Kategorien personenbezogener Daten (Gesundheit, Herkunft, politische Ansichten usw.) verarbeitet der Betreiber nicht.'],
      },
      {
        heading: '5. Zwecke der Verarbeitung',
        items: [
          'Bearbeitung und Beantwortung von Anfragen;',
          'Erstellung eines Angebots, Arbeitsplans, Zeit- und Kostenrahmens;',
          'Kontaktaufnahme auf Ihre Anfrage;',
          'Besuchsstatistik und Verbesserung der Website.',
        ],
      },
      {
        heading: '6. Rechtsgrundlagen',
        paragraphs: ['Die Verarbeitung erfolgt auf Grundlage:'],
        items: [
          'der Einwilligung der betroffenen Person (Art. 6 Abs. 1 Nr. 1 des 152-FZ), die Sie durch Ankreuzen des entsprechenden Kontrollkästchens beim Absenden erteilen;',
          'der Erforderlichkeit zur Anbahnung und Erfüllung eines Vertrags, dessen Partei die betroffene Person ist.',
        ],
      },
      {
        heading: '7. Verfahren, Speicherung und Lokalisierung',
        paragraphs: [
          'Die Verarbeitung erfolgt sowohl automatisiert als auch nicht automatisiert.',
          'Erfassung, Systematisierung, Speicherung, Aktualisierung und Abruf personenbezogener Daten von Bürgern der Russischen Föderation erfolgen über Datenbanken auf dem Gebiet der Russischen Föderation (Art. 18 Abs. 5 des 152-FZ).',
          'Die Daten werden nicht länger als zur Zweckerreichung erforderlich gespeichert, höchstens jedoch ein (1) Jahr ab der letzten Anfrage, sofern Gesetz oder Vertrag nichts anderes bestimmen. Nach Zweckerreichung oder Widerruf werden die Daten gelöscht oder anonymisiert.',
        ],
      },
      {
        heading: '8. Weitergabe an Dritte',
        paragraphs: ['Der Betreiber verkauft keine personenbezogenen Daten und gibt sie nicht an Dritte weiter, außer soweit dies zur Zweckerreichung erforderlich ist:'],
        items: [
          'Telegram — zur Zustellung einer Benachrichtigung über Ihre Anfrage an den Betreiber;',
          'Google Analytics 4 (Google Ireland Ltd.) — nur mit Ihrer Einwilligung, zur Erhebung anonymisierter Statistiken;',
          'Hosting-Anbieter der Website — für den technischen Betrieb und die Datenspeicherung.',
        ],
      },
      {
        heading: '9. Cookies und Web-Analyse',
        paragraphs: [
          'Mit Ihrer Einwilligung nutzt die Website Cookies und Google Analytics 4 (mit IP-Anonymisierung) zur Analyse der Nutzung und zur Verbesserung der Website. Ohne Einwilligung werden keine Analyse-Skripte geladen.',
          'Sie können Analyse-Cookies im Einwilligungsbanner beim ersten Besuch ablehnen und Cookies in den Browsereinstellungen deaktivieren. Das Deaktivieren einzelner Cookies kann Funktionen der Website beeinträchtigen.',
        ],
      },
      {
        heading: '10. Rechte der betroffenen Person',
        paragraphs: ['Gemäß Art. 14 des 152-FZ haben Sie das Recht:'],
        items: [
          'Auskunft über die Verarbeitung Ihrer Daten zu erhalten;',
          'Berichtigung, Sperrung oder Löschung unvollständiger, veralteter, unrichtiger oder rechtswidrig verarbeiteter Daten zu verlangen;',
          'Ihre Einwilligung zu widerrufen;',
          'Handlungen oder Unterlassungen des Betreibers anzufechten.',
        ],
      },
      {
        heading: '11. Widerruf der Einwilligung',
        paragraphs: [`Sie können Ihre Einwilligung jederzeit durch eine schriftliche Mitteilung an ${OPERATOR_EMAIL} widerrufen. Nach Eingang stellt der Betreiber die Verarbeitung ein und löscht die Daten innerhalb der gesetzlichen Frist, sofern keine anderen rechtmäßigen Verarbeitungsgründe bestehen.`],
      },
      {
        heading: '12. Datensicherheit',
        paragraphs: ['Der Betreiber trifft die erforderlichen rechtlichen, organisatorischen und technischen Maßnahmen zum Schutz der Daten vor unbefugtem oder zufälligem Zugriff, Vernichtung, Veränderung, Sperrung, Kopieren und Verbreitung. Die Übermittlung der Formulardaten erfolgt über eine gesicherte HTTPS/TLS-Verbindung.'],
      },
      {
        heading: '13. Anfragen, Beschwerden und Änderungen',
        paragraphs: [
          `Bei Fragen zur Datenverarbeitung wenden Sie sich an den Betreiber unter ${OPERATOR_EMAIL}. Sie können Handlungen des Betreibers auch bei Roskomnadzor (russische Aufsichtsbehörde für Kommunikation, IT und Medien) anfechten.`,
          'Der Betreiber kann diese Richtlinie ändern. Die aktuelle Fassung ist stets auf dieser Seite verfügbar; das Datum der letzten Aktualisierung ist unten angegeben.',
        ],
      },
    ],
  },
});

export function PrivacyPage() {
  const { i18n } = useTranslation();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru') as 'de' | 'en' | 'ru';
  const OPERATOR_EMAIL = getEmail(lang);
  const text = buildPolicy(OPERATOR_EMAIL)[lang];
  const root = useRef<HTMLDivElement>(null);
  useBuildReveal(root);

  return (
    <>
      <PageMeta lang={lang} path="/privacy" title={text.seoTitle} description={text.seoDesc} />

      <div ref={root} className="bg-background pt-28 pb-24" data-build-flat="">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl" data-build="">{text.title}</h1>
          <p className="mx-auto mb-12 max-w-2xl text-center leading-relaxed text-muted-foreground" data-build="">{text.intro}</p>

          <div className="space-y-6 rounded-3xl border border-border/50 bg-card/80 p-6 shadow-lg backdrop-blur-sm md:p-10" data-pl-build="slide-columns">
            {text.sections.map((section, index) => {
              const Icon = sectionIcons[index % sectionIcons.length];
              return (
                <section key={section.heading} className="flex items-start gap-4" data-build="">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="mb-2 text-lg font-semibold">{section.heading}</h2>
                    {section.paragraphs?.map((p, i) => (
                      <p key={i} className="mb-2 leading-relaxed text-muted-foreground">{p}</p>
                    ))}
                    {section.items && (
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                        {section.items.map((item, i) => (
                          <li key={i} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              );
            })}

            <div className="mt-4 border-t border-border/50 pt-6" data-build="">
              <p className="text-sm text-muted-foreground">
                {text.contactLabel}:{' '}
                <a href={`mailto:${OPERATOR_EMAIL}`} className="text-primary underline underline-offset-2">{OPERATOR_EMAIL}</a>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground" data-build="">
            {text.updatedLabel}: {text.updated}
          </p>
        </div>
      </div>
    </>
  );
}
