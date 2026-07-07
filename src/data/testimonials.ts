export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

// Фейковые отзывы удалены (риск по ФЗ «О рекламе» ст. 5 + слабое доверие).
// Заполнять только реальными кейсами с согласия клиентов. Пока пусто — секция скрывается.
export const testimonials: Record<string, Testimonial[]> = {
  ru: [],
  en: [],
  de: [],
};