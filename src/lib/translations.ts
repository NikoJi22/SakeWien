export type Language = "en" | "de";

type TranslationSchema = {
  nav: {
    home: string;
    menu: string;
    about: string;
    order: string;
    orderShort: string;
    contact: string;
    reservation: string;
    bookTable: string;
    /** Short label for hero nav CTA (styled uppercase in UI) */
    reserveTableNav: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    cardMenu: string;
    /** Hero side tile — direct order (replaces separate menu page) */
    cardOrder: string;
    cardReservation: string;
    cardRestaurant: string;
    cardNewDishes: string;
    cardAboutUs: string;
  };
  sections: { bestsellers: string; newDishes: string };
  menu: {
    filterLabel: string;
    filterVegan: string;
    filterVegetarian: string;
    filterSpicy1: string;
    filterSpicy2: string;
    filterBestseller: string;
    filterNew: string;
    filterSpecialDeals: string;
    clearFilters: string;
    lunchHoursHint: string;
    allergensShort: string;
    allergenLegendTitle: string;
    allergenLegendHint: string;
    noDishesFilter: string;
  };
  form: {
    fullName: string;
    phone: string;
    /** Shown inside tel field as format hint */
    phonePlaceholder: string;
    /** Short hint under or near phone field */
    phoneHint: string;
    email: string;
    address: string;
    message: string;
    guests: string;
    date: string;
    time: string;
    type: string;
    pickup: string;
    delivery: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };
  page: {
    menuTitle: string;
    menuText: string;
    orderTitle: string;
    orderText: string;
    contactTitle: string;
    contactText: string;
    reservationTitle: string;
    reservationText: string;
    newDishesTitle: string;
    newDishesText: string;
    bestsellersTitle: string;
    bestsellersText: string;
  };
  about: {
    title: string;
    intro: string;
    storyTitle: string;
    storyBody: string;
    qualityTitle: string;
    qualityBody: string;
    serviceTitle: string;
    serviceBody: string;
    locationTitle: string;
    locationBody: string;
    ctaLabel: string;
  };
  order: {
    browseMenu: string;
    yourOrder: string;
    emptyCart: string;
    subtotal: string;
    addToCart: string;
    qty: string;
    newBadge: string;
    bestsellerBadge: string;
    vegetarian: string;
    vegan: string;
    spicy: string;
    giftUnlocked: string;
    giftHint: string;
    fulfillment: string;
    pickupTime: string;
    deliveryTime: string;
    paymentMethod: string;
    cash: string;
    card: string;
    comment: string;
    commentPlaceholder: string;
    placeOrder: string;
    scrollToCheckout: string;
    /** Mobile bar / drawer — open cart (no scroll) */
    openCart: string;
    /** Brief confirmation after + without opening drawer */
    addedToCart: string;
    itemsInCart: string;
    emailOptional: string;
    smsVerifyTitle: string;
    /** Shown before any SMS was sent: code is requested via “Place order” */
    smsVerifyHintSubmit: string;
    /** After SMS was sent successfully */
    codeSentInfo: string;
    sendCode: string;
    resendCode: string;
    enterCode: string;
    confirmCode: string;
    codeSending: string;
    codeVerifying: string;
    verifiedPhone: string;
    errInvalidPhone: string;
    errSendCode: string;
    errVerifyCode: string;
    errRateLimit: string;
    errWaitResend: string;
    errPhoneNotVerified: string;
    errPhoneMismatch: string;
    errServerConfig: string;
    paymentHeading: string;
    paymentPickupCash: string;
    paymentPickupCardNote: string;
    paymentDeliveryCash: string;
    orderErrorGeneric: string;
    /** Mittagsmenü — explain starter choice */
    lunchStarterHint: string;
    soldOut: string;
    deliveryMinOrder: string;
    pickupSameDayOnly: string;
    sushiExtras: string;
    wasabi: string;
    ginger: string;
    cutlery: string;
    chopsticks: string;
    woodenCutlery: string;
    cutleryCount: string;
  };
};

export const translations: Record<Language, TranslationSchema> = {
  en: {
    nav: {
      home: "Home",
      menu: "Menu",
      about: "About",
      order: "Order online",
      orderShort: "Order",
      contact: "Contact",
      reservation: "Reservation",
      bookTable: "Book a table",
      reserveTableNav: "Reserve table"
    },
    hero: {
      title: "Sushi Sensation",
      subtitle: "Japanese fine dining in Vienna. Dark elegance, precise craft, unforgettable taste.",
      ctaPrimary: "Book a table",
      ctaSecondary: "Order online",
      cardMenu: "Menu",
      cardOrder: "Order now",
      cardReservation: "Reservation",
      cardRestaurant: "Our restaurant",
      cardNewDishes: "New dishes",
      cardAboutUs: "About us"
    },
    sections: {
      bestsellers: "Bestsellers",
      newDishes: "New dishes"
    },
    menu: {
      filterLabel: "Filter",
      filterVegan: "Vegan",
      filterVegetarian: "Vegetarian",
      filterSpicy1: "Spicy (1 chili)",
      filterSpicy2: "Very spicy (2 chili)",
      filterBestseller: "Bestsellers",
      filterNew: "New",
      filterSpecialDeals: "Special deals",
      clearFilters: "Clear all",
      lunchHoursHint: "Lunch menu daily 11:00-15:00 (Vienna time).",
      allergensShort: "Allergens",
      allergenLegendTitle: "Allergen key",
      allergenLegendHint: "According to EU regulation — codes on dishes refer to the following allergens.",
      noDishesFilter: "No dishes match these filters. Try clearing a filter."
    },
    form: {
      fullName: "Full name",
      phone: "Phone",
      phonePlaceholder: "+43 660 1234567",
      phoneHint:
        "Use country code +43 or national format (e.g. 0660 1234567). Spaces and dashes are fine.",
      email: "Email",
      address: "Address",
      message: "Message",
      guests: "Guests",
      date: "Date",
      time: "Time",
      type: "Type",
      pickup: "Pickup",
      delivery: "Delivery",
      submit: "Send",
      sending: "Sending...",
      success: "Message sent successfully.",
      error: "Something went wrong. Please try again."
    },
    page: {
      menuTitle: "Digital Menu",
      menuText: "Explore the full selection of Japanese dishes and handcrafted signatures.",
      orderTitle: "Order online",
      orderText: "Place your order for pickup or delivery in Vienna. We confirm quickly by phone.",
      contactTitle: "Contact",
      contactText: "Questions, private events or special requests. We are happy to help.",
      reservationTitle: "Reservation",
      reservationText: "Reserve your table and enjoy an elegant Japanese dining experience.",
      newDishesTitle: "New Dishes",
      newDishesText: "Discover our newest creations and seasonal specials.",
      bestsellersTitle: "Bestsellers",
      bestsellersText: "Guest favorites chosen most often from our menu."
    },
    about: {
      title: "About us",
      intro:
        "SAKE Vienna brings refined Japanese cuisine to the Ring—dark elegance, precise craft, and warm hospitality in the heart of the city.",
      storyTitle: "Atmosphere & story",
      storyBody:
        "In a calm, dark interior inspired by Japanese minimalism, we focus on precision, presentation, and the warmth of true omotenashi. Every detail is composed so you can slow down and savour the moment.",
      qualityTitle: "Ingredients & craft",
      qualityBody:
        "We select fresh fish, seasonal produce, and pantry staples with care. Our kitchen prepares sushi, sashimi, and hot dishes daily—respecting tradition while refining each plate for Vienna.",
      serviceTitle: "Dine in, takeaway & delivery",
      serviceBody:
        "Reserve a table for a full evening in our dining room, enjoy dishes to go, or order online for pickup and delivery across Vienna. Wherever you choose to experience SAKE, the same standards apply.",
      locationTitle: "Find us",
      locationBody:
        "Kärntner Ring—in the heart of Vienna. For directions, opening hours, and private events, our team is one message away.",
      ctaLabel: "Contact & directions"
    },
    order: {
      browseMenu: "Browse & order",
      yourOrder: "Your order",
      emptyCart: "Your cart is empty. Add dishes from the menu.",
      subtotal: "Subtotal",
      addToCart: "Add",
      qty: "Qty",
      newBadge: "New",
      bestsellerBadge: "Bestseller",
      vegetarian: "Vegetarian",
      vegan: "Vegan",
      spicy: "Spicy",
      giftUnlocked: "Bonus unlocked",
      giftHint: "Spend more to unlock a complimentary gift.",
      fulfillment: "Pickup or delivery",
      pickupTime: "Pickup time",
      deliveryTime: "Delivery time",
      paymentMethod: "Payment on delivery",
      cash: "Cash",
      card: "Card (terminal)",
      comment: "Comment for the kitchen",
      commentPlaceholder: "Allergies, cutlery, special requests…",
      placeOrder: "Send order",
      scrollToCheckout: "Review order",
      openCart: "Cart",
      addedToCart: "Added to cart",
      itemsInCart: "items",
      emailOptional: "Email (optional)",
      smsVerifyTitle: "Verify your phone",
      smsVerifyHintSubmit: "Tap “Send order” first — we’ll text you a code (pickup and delivery).",
      codeSentInfo: "We’ve sent a code. Enter it below and tap Confirm.",
      sendCode: "Send code",
      resendCode: "Resend code",
      enterCode: "SMS code",
      confirmCode: "Confirm",
      codeSending: "Sending…",
      codeVerifying: "Checking…",
      verifiedPhone: "Phone verified",
      errInvalidPhone: "Please enter a valid mobile number.",
      errSendCode: "Could not send SMS. Please try again later.",
      errVerifyCode: "Invalid or expired code. Please try again.",
      errRateLimit: "Too many requests. Please try again later.",
      errWaitResend: "Please wait a minute before requesting a new code.",
      errPhoneNotVerified: "Please verify your phone with SMS before ordering.",
      errPhoneMismatch: "Verified phone does not match the number in the form.",
      errServerConfig: "Ordering is temporarily unavailable.",
      paymentHeading: "Payment",
      paymentPickupCash: "Payment is made in cash when you pick up your order.",
      paymentPickupCardNote: "At the restaurant you can also pay by card (terminal).",
      paymentDeliveryCash: "Delivery is paid in cash to the driver. No online payment.",
      orderErrorGeneric: "Order could not be sent. Please try again.",
      lunchStarterHint: "Included with this lunch menu — pick one.",
      soldOut: "Sold out",
      deliveryMinOrder: "Minimum order for delivery: €15.00",
      pickupSameDayOnly: "Pickup is only available for today.",
      sushiExtras: "Sushi extras",
      wasabi: "Wasabi",
      ginger: "Ginger",
      cutlery: "Cutlery",
      chopsticks: "Chopsticks",
      woodenCutlery: "Wooden cutlery",
      cutleryCount: "Count"
    }
  },
  de: {
    nav: {
      home: "Startseite",
      menu: "Speisekarte",
      about: "Über uns",
      order: "Online bestellen",
      orderShort: "Bestellen",
      contact: "Kontakt",
      reservation: "Reservierung",
      bookTable: "Tisch reservieren",
      reserveTableNav: "Tisch reservieren"
    },
    hero: {
      title: "Sushi Sensation",
      subtitle: "Japanisches Fine Dining in Wien. Dunkle Eleganz, präzise Handwerkskunst, unvergesslicher Geschmack.",
      ctaPrimary: "Tisch reservieren",
      ctaSecondary: "Online bestellen",
      cardMenu: "Speisekarte",
      cardOrder: "Jetzt bestellen",
      cardReservation: "Reservierung",
      cardRestaurant: "Unser Restaurant",
      cardNewDishes: "Neue Gerichte",
      cardAboutUs: "Über uns"
    },
    sections: {
      bestsellers: "Bestseller",
      newDishes: "Neue Gerichte"
    },
    menu: {
      filterLabel: "Filter",
      filterVegan: "Vegan",
      filterVegetarian: "Vegetarisch",
      filterSpicy1: "Scharf (1 Chili)",
      filterSpicy2: "Sehr scharf (2 Chili)",
      filterBestseller: "Bestseller",
      filterNew: "Neu",
      filterSpecialDeals: "Aktionen",
      clearFilters: "Alle zurücksetzen",
      lunchHoursHint: "Mittagsmenü täglich 11:00-15:00 Uhr (Wiener Zeit).",
      allergensShort: "Allergene",
      allergenLegendTitle: "Allergenkennzeichnung",
      allergenLegendHint: "Gemäß EU-Verordnung — die Codes bei den Gerichten beziehen sich auf folgende Allergene.",
      noDishesFilter: "Keine Gerichte mit diesen Filtern. Filter zurücksetzen."
    },
    form: {
      fullName: "Vollständiger Name",
      phone: "Telefon",
      phonePlaceholder: "+43 660 1234567",
      phoneHint:
        "Mit Ländervorwahl +43 oder national z. B. 0660 1234567. Leerzeichen und Bindestriche sind in Ordnung.",
      email: "E-Mail",
      address: "Adresse",
      message: "Nachricht",
      guests: "Gäste",
      date: "Datum",
      time: "Uhrzeit",
      type: "Typ",
      pickup: "Abholung",
      delivery: "Lieferung",
      submit: "Senden",
      sending: "Wird gesendet...",
      success: "Nachricht erfolgreich gesendet.",
      error: "Etwas ist schief gelaufen. Bitte erneut versuchen."
    },
    page: {
      menuTitle: "Digitale Speisekarte",
      menuText: "Entdecken Sie die gesamte Auswahl an japanischen Gerichten und Signature-Kreationen.",
      orderTitle: "Online bestellen",
      orderText: "Bestellen Sie zur Abholung oder Lieferung in Wien. Wir bestätigen rasch telefonisch.",
      contactTitle: "Kontakt",
      contactText: "Fragen, private Events oder spezielle Wünsche. Wir helfen gerne weiter.",
      reservationTitle: "Reservierung",
      reservationText: "Reservieren Sie Ihren Tisch und genießen Sie ein elegantes japanisches Erlebnis.",
      newDishesTitle: "Neue Gerichte",
      newDishesText: "Entdecken Sie unsere neuesten Kreationen und saisonalen Specials.",
      bestsellersTitle: "Bestseller",
      bestsellersText: "Die beliebtesten Gerichte unserer Gäste."
    },
    about: {
      title: "Über uns",
      intro:
        "SAKE Vienna verbindet japanische Präzision mit Wiener Gastfreundschaft—dunkle Eleganz, sorgfältiges Handwerk und echte Herzlichkeit am Ring.",
      storyTitle: "Atmosphäre & Geschichte",
      storyBody:
        "In ruhigem, dunklem Ambiente inspiriert von japanischer Reduktion legen wir Wert auf Präsentation, Präzision und die Wärme echter Omotenashi. Jedes Detail ist darauf ausgelegt, den Moment bewusst zu genießen.",
      qualityTitle: "Zutaten & Handwerk",
      qualityBody:
        "Wir wählen frischen Fisch, saisonales Gemüse und ausgewählte Spezialitäten mit Sorgfalt. Küche und Sushi-Bar bereiten täglich Sushi, Sashimi und warme Gerichte zu—traditionsbewusst und zugleich fein auf Wien abgestimmt.",
      serviceTitle: "Restaurant, Takeaway & Lieferung",
      serviceBody:
        "Reservieren Sie einen Tisch für den Abend im Restaurant, genießen Sie Gerichte zum Mitnehmen oder bestellen Sie online zur Abholung oder Lieferung in Wien. Überall gilt derselbe Anspruch an Qualität und Sorgfalt.",
      locationTitle: "Besuchen Sie uns",
      locationBody:
        "Am Kärntner Ring, im Herzen Wiens. Für Anfahrt, Öffnungszeiten und private Anlässe erreichen Sie uns direkt über die Kontaktseite.",
      ctaLabel: "Kontakt & Anfahrt"
    },
    order: {
      browseMenu: "Bestellen",
      yourOrder: "Ihre Bestellung",
      emptyCart: "Ihr Warenkorb ist leer. Wählen Sie Gerichte aus der Karte.",
      subtotal: "Zwischensumme",
      addToCart: "Hinzufügen",
      qty: "Menge",
      newBadge: "Neu",
      bestsellerBadge: "Bestseller",
      vegetarian: "Vegetarisch",
      vegan: "Vegan",
      spicy: "Scharf",
      giftUnlocked: "Bonus freigeschaltet",
      giftHint: "Mehr bestellen, um ein Gratis-Geschenk zu erhalten.",
      fulfillment: "Abholung oder Lieferung",
      pickupTime: "Abholzeit",
      deliveryTime: "Lieferzeit",
      paymentMethod: "Zahlung bei Lieferung",
      cash: "Bar",
      card: "Karte (Terminal)",
      comment: "Anmerkung für die Küche",
      commentPlaceholder: "Allergien, Besteck, Wünsche…",
      placeOrder: "Bestellung senden",
      scrollToCheckout: "Zur Bestellung",
      openCart: "Warenkorb",
      addedToCart: "Zum Warenkorb hinzugefügt",
      itemsInCart: "Artikel",
      emailOptional: "E-Mail (optional)",
      smsVerifyTitle: "Handy-Verifizierung",
      smsVerifyHintSubmit:
        "Tippen Sie zuerst auf „Bestellung senden“ — wir schicken Ihnen dann einen SMS-Code (Abholung und Lieferung).",
      codeSentInfo: "Wir haben einen Code gesendet. Geben Sie ihn unten ein und tippen Sie auf Bestätigen.",
      sendCode: "Code senden",
      resendCode: "Code erneut senden",
      enterCode: "SMS-Code",
      confirmCode: "Bestätigen",
      codeSending: "Wird gesendet…",
      codeVerifying: "Wird geprüft…",
      verifiedPhone: "Telefon bestätigt",
      errInvalidPhone: "Bitte geben Sie eine gültige Mobilnummer ein.",
      errSendCode: "SMS konnte nicht gesendet werden. Bitte später erneut versuchen.",
      errVerifyCode: "Code ungültig oder abgelaufen. Bitte erneut versuchen.",
      errRateLimit: "Zu viele Anfragen. Bitte später erneut versuchen.",
      errWaitResend: "Bitte warten Sie eine Minute, bevor Sie einen neuen Code anfordern.",
      errPhoneNotVerified: "Bitte bestätigen Sie Ihre Nummer per SMS, bevor Sie bestellen.",
      errPhoneMismatch: "Die bestätigte Nummer stimmt nicht mit dem Formular überein.",
      errServerConfig: "Bestellen ist vorübergehend nicht möglich.",
      paymentHeading: "Bezahlung",
      paymentPickupCash: "Die Bezahlung erfolgt bei Abholung in bar.",
      paymentPickupCardNote: "Vor Ort können Sie zusätzlich mit Karte (Bankomat/Terminal) zahlen.",
      paymentDeliveryCash: "Lieferung wird bar beim Fahrer bezahlt. Keine Online-Zahlung.",
      orderErrorGeneric: "Bestellung konnte nicht gesendet werden. Bitte erneut versuchen.",
      lunchStarterHint: "Im Mittagsmenü enthalten — bitte eine Option wählen.",
      soldOut: "Ausverkauft",
      deliveryMinOrder: "Mindestbestellwert für Lieferung: 15,00 €",
      pickupSameDayOnly: "Abholung ist nur am selben Tag möglich.",
      sushiExtras: "Sushi Extras",
      wasabi: "Wasabi",
      ginger: "Ingwer",
      cutlery: "Besteck",
      chopsticks: "Stäbchen",
      woodenCutlery: "Holzbesteck",
      cutleryCount: "Anzahl"
    }
  }
};
