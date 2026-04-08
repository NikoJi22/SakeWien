import type { SiteContentConfig } from "./menu-types";

export const defaultSiteContent: SiteContentConfig = {
  hero: {
    title: { de: "Sushi Sensation", en: "Sushi Sensation" },
    mainImage: "/hero-main.png"
  },
  cards: {
    order: {
      label: { de: "Jetzt bestellen", en: "Order now" },
      image: "/order-now-hero.png"
    },
    reservation: {
      label: { de: "Reservierung", en: "Reservation" },
      image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1600&q=85"
    },
    about: {
      label: { de: "Über uns", en: "About us" },
      image: "/about-us-hero.png"
    }
  }
};
