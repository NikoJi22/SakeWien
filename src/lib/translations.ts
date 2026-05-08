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
    street: string;
    houseNumber: string;
    staircase: string;
    floor: string;
    door: string;
    postalCode: string;
    city: string;
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
    freeGiftHintOne: string;
    freeGiftHintTwo: string;
    /** Placeholders %T1%, %C1%, %T2%, %C2% for tier thresholds and gift counts. */
    freeGiftTiersHint: string;
    freeGiftSelectLabel: string;
    freeGiftSelectPlaceholder: string;
    freeGiftNotConfigured: string;
    fulfillment: string;
    pickupTime: string;
    pickupDateLabel: string;
    pickupPhoneInfoTitle: string;
    pickupPhoneInfoValue: string;
    /** Customer’s number for pickup orders (required). */
    pickupPhoneCustomerLabel: string;
    pickupPhoneCustomerHint: string;
    pickupSlotHint: string;
    deliveryDateLabel: string;
    deliveryTime: string;
    deliveryTimeEstimate: string;
    deliveryAreaNotice: string;
    openingHoursTitle: string;
    /** Öffnungstage außer Dienstag (hier: Mi–Mo, Di Ruhetag dazwischen) */
    openingHoursWedMon: string;
    openingHoursTuesday: string;
    openingHoursOpenSlot: string;
    openingHoursClosed: string;
    openingHoursFootnote: string;
    ordersClosedMessage: string;
    ordersClosedVacationMessage: string;
    errOrdersClosedCutoff: string;
    errOrdersClosedVacation: string;
    errPickupInvalidDatetime: string;
    errPickupClosedTuesday: string;
    errPickupDateOutOfRange: string;
    errPickupTimeOutOfRange: string;
    errDeliveryInvalidDate: string;
    errDeliveryClosedTuesday: string;
    errDeliveryDateOutOfRange: string;
    errDeliveryOutsideArea: string;
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
    /** Zeile im Warenkorb / Kasse komplett entfernen */
    removeFromCart: string;
    decreaseQty: string;
    increaseQty: string;
    emailRequired: string;
    smsVerifyTitle: string;
    /** Shown before any SMS was sent: code is requested via “Place order” */
    smsVerifyHintSubmit: string;
    /** After SMS was sent successfully */
    codeSentInfo: string;
    smsPhonePlaceholder: string;
    smsCodePlaceholder: string;
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
    /** E-Mail (SMTP) env incomplete */
    errSmtpNotConfigured: string;
    /** SMTP accepted connection but sending failed */
    errSmtpSendFailed: string;
    errPdfFailed: string;
    /** ORDER_PHONE_VERIFY_SECRET missing — only affects delivery */
    errDeliveryPhoneSecretMissing: string;
    /** Twilio Verify env missing */
    errSmsNotConfigured: string;
    errSmsProviderFailed: string;
    errMissingCustomerName: string;
    errInvalidCustomerEmail: string;
    errInvalidCustomerPhone: string;
    errInvalidGiftSelection: string;
    errEmptyCartPayload: string;
    errInvalidJsonBody: string;
    paymentHeading: string;
    paymentPickupCash: string;
    paymentPickupCardNote: string;
    paymentDeliveryCash: string;
    orderErrorGeneric: string;
    /** Known server failure after request reached API */
    errOrderServerError: string;
    /** Network / connection failure (no usable response) */
    errOrderNetwork: string;
    /** Mittagsmenü — explain starter choice */
    lunchStarterHint: string;
    soldOut: string;
    deliveryMinOrder: string;
    deliveryAddressHeading: string;
    errDeliveryAddressIncomplete: string;
    errDeliveryAddressPlz: string;
    sushiExtras: string;
    wasabi: string;
    ginger: string;
    cutlery: string;
    chopsticks: string;
    woodSpoon: string;
    woodFork: string;
    cutleryCount: string;
    /** Shown after successful order next to orderId */
    orderReferenceLabel: string;
    /** After successful POST /api/order */
    orderPlacedSuccess: string;
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
      street: "Street",
      houseNumber: "House number",
      staircase: "Staircase (Stiege)",
      floor: "Floor",
      door: "Door / apt. no.",
      postalCode: "Postal code",
      city: "City",
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
        "SAKE Vienna is an approachable Japanese spot in Neubau—straightforward flavours, a bright, relaxed room, and a team that likes to welcome you at the counter.",
      storyTitle: "Our space",
      storyBody:
        "A light-filled, easy-going interior: pale wood, clean lines, and our SAKE feature wall. We keep the mood unpretentious and the service clear—whether you sit down for a quick lunch, linger over dinner, or pick up your order on the go.",
      qualityTitle: "Ingredients & kitchen",
      qualityBody:
        "We choose fresh fish, seasonal vegetables, and trusted staples with care. Each day we prepare sushi, sashimi, and hot plates with consistency in mind—familiar Japanese comfort, tuned for everyday Vienna.",
      serviceTitle: "Eat in, takeaway & delivery",
      serviceBody:
        "Drop by the restaurant, order dishes to take away, or use our online shop for pickup and delivery in Vienna. The same care goes into every plate, however you choose to enjoy it.",
      locationTitle: "Find us",
      locationBody:
        "Kaiserstraße 81 1070 Vienna. For directions, opening hours, and private events, our team is one message away.",
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
      freeGiftHintOne: "From €35 you can choose 1 free item.",
      freeGiftHintTwo: "From €70 you can choose 2 free items.",
      freeGiftTiersHint: "From €%T1%: up to %C1% free item(s). From €%T2%: up to %C2%. You may pick the same item more than once when multiple gifts apply.",
      freeGiftSelectLabel: "Free item",
      freeGiftSelectPlaceholder: "Please choose",
      freeGiftNotConfigured: "No free items are configured yet.",
      fulfillment: "Pickup or delivery",
      pickupTime: "Pickup time",
      pickupDateLabel: "Pickup date",
      pickupPhoneInfoTitle: "Pickup phone:",
      pickupPhoneInfoValue: "+4315223551",
      pickupPhoneCustomerLabel: "Your phone number (required)",
      pickupPhoneCustomerHint: "We use this number to reach you about your pickup order.",
      pickupSlotHint:
        "Times are Vienna local time. Earliest slot 11:30; last slot 21:30. Tuesdays we are closed — choose another day.",
      deliveryDateLabel: "Preferred delivery day",
      deliveryTime: "Delivery time",
      deliveryTimeEstimate: "Delivery usually takes approx. 45–60 minutes.",
      deliveryAreaNotice: "Delivery only to Vienna districts 6, 7, 8, 15 and 16.",
      openingHoursTitle: "Opening hours",
      openingHoursWedMon: "Wednesday – Monday",
      openingHoursTuesday: "Tuesday",
      openingHoursOpenSlot: "11:00 a.m. – 9:30 p.m.",
      openingHoursClosed: "Closed",
      openingHoursFootnote: "Vienna local time.",
      ordersClosedMessage:
        "We are not accepting new online orders after 9:15 p.m. Vienna time until midnight. Please try again tomorrow.",
      ordersClosedVacationMessage:
        "Online ordering is currently unavailable due to vacation mode. Please check back after the vacation period.",
      errOrdersClosedCutoff:
        "Online ordering is closed for today after 9:15 p.m. Vienna time. Please try again tomorrow from 12:00 a.m.",
      errOrdersClosedVacation:
        "Online ordering is currently unavailable due to vacation mode. Please try again after the vacation period.",
      errPickupInvalidDatetime: "Please choose a valid pickup date and time.",
      errPickupClosedTuesday: "We are closed on Tuesdays — please pick another day for pickup.",
      errPickupDateOutOfRange: "The pickup date is outside the allowed booking window.",
      errPickupTimeOutOfRange: "Pickup must be between 11:30 and 9:30 p.m. on the chosen day.",
      errDeliveryInvalidDate: "Please choose a valid delivery day.",
      errDeliveryClosedTuesday: "We are closed on Tuesdays — please pick another day for delivery.",
      errDeliveryDateOutOfRange: "The delivery day is outside the allowed booking window.",
      errDeliveryOutsideArea: "Delivery is only available to Vienna districts 6, 7, 8, 15 and 16.",
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
      removeFromCart: "Remove",
      decreaseQty: "Decrease quantity",
      increaseQty: "Increase quantity",
      emailRequired: "Email (required)",
      smsVerifyTitle: "Verify your phone",
      smsVerifyHintSubmit: "Enter your phone number, tap “Send code”, then enter the SMS code below and confirm.",
      codeSentInfo: "Code sent. Enter it below and tap Confirm.",
      smsPhonePlaceholder: "06761234567",
      smsCodePlaceholder: "Enter 6-digit code",
      sendCode: "Send code",
      resendCode: "Resend code",
      enterCode: "SMS code",
      confirmCode: "Confirm code",
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
      errSmtpNotConfigured:
        "Order could not be sent: e-mail is not configured on the server (SMTP). Please try again later or call the restaurant.",
      errSmtpSendFailed:
        "Order could not be sent: the confirmation e-mail could not be delivered. Please try again later or call the restaurant.",
      errPdfFailed: "Order could not be sent: the order PDF could not be created. Please try again later or call the restaurant.",
      errDeliveryPhoneSecretMissing:
        "Delivery is temporarily unavailable: phone verification is not configured on the server. Pickup may still work.",
      errSmsNotConfigured:
        "SMS verification is not available: the text-message service is not configured. Please choose pickup or contact the restaurant.",
      errSmsProviderFailed: "The SMS service returned an error. Please try again in a moment.",
      errMissingCustomerName: "Please enter your name.",
      errInvalidCustomerEmail: "Please enter a valid e-mail address.",
      errInvalidCustomerPhone: "Please enter a valid phone number with country code (e.g. +43…).",
      errInvalidGiftSelection: "Your free gift selection is invalid. Please choose again.",
      errEmptyCartPayload: "Your order data was incomplete. Please refresh the page and add items again.",
      errInvalidJsonBody: "Invalid request. Please refresh the page and try again.",
      paymentHeading: "Payment",
      paymentPickupCash: "Payment is made in cash when you pick up your order.",
      paymentPickupCardNote: "At the restaurant you can also pay by card (terminal).",
      paymentDeliveryCash: "Delivery is paid in cash to the driver. No online payment.",
      orderErrorGeneric: "Order could not be sent. Please try again.",
      errOrderServerError:
        "The server could not complete your order. Please try again in a few minutes or call the restaurant.",
      errOrderNetwork:
        "Could not reach the server (network). Check your connection and try again, or call the restaurant.",
      lunchStarterHint: "Included with this lunch menu — pick one.",
      soldOut: "Sold out",
      deliveryMinOrder: "Minimum order for delivery: €15.00",
      deliveryAddressHeading: "Delivery address",
      errDeliveryAddressIncomplete: "Please fill in street, house number, postal code and city.",
      errDeliveryAddressPlz: "Please enter a valid 4-digit postal code.",
      sushiExtras: "Sushi extras",
      wasabi: "Wasabi",
      ginger: "Ginger",
      cutlery: "Cutlery",
      chopsticks: "Chopsticks",
      woodSpoon: "Wooden spoon",
      woodFork: "Wooden fork",
      cutleryCount: "Count",
      orderReferenceLabel: "Order no.",
      orderPlacedSuccess: "Order sent."
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
      street: "Straße",
      houseNumber: "Hausnummer",
      staircase: "Stiege",
      floor: "Stock",
      door: "Tür",
      postalCode: "Postleitzahl",
      city: "Ort",
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
        "SAKE Vienna ist ein unkompliziertes japanisches Lokal in Neubau—klare Aromen, ein helles, entspanntes Ambiente und ein Team, das Sie gern am Tresen begrüßt.",
      storyTitle: "Unser Lokal",
      storyBody:
        "Hell, freundlich, übersichtlich: helles Holz, klare Linien und unsere SAKE-Wand im Raum. Wir halten die Stimmung bodennah und den Service verständlich—ob Mittagessen, längeres Abendessen oder spontan zum Mitnehmen.",
      qualityTitle: "Zutaten & Küche",
      qualityBody:
        "Wir kaufen frischen Fisch, saisonisches Gemüse und bewährte Zutaten mit Bedacht. Täglich entstehen Sushi, Sashimi und warme Gerichte mit dem Anspruch auf Beständigkeit—vertraute japanische Küche für den Alltag in Wien.",
      serviceTitle: "Restaurant, Takeaway & Lieferung",
      serviceBody:
        "Kommen Sie im Lokal vorbei, bestellen Sie zum Mitnehmen oder nutzen Sie den Onlineshop für Abholung und Lieferung in Wien. Die Sorgfalt bleibt dieselbe—egal wie Sie bei uns essen.",
      locationTitle: "Besuchen Sie uns",
      locationBody:
        "Kaiserstraße 81 1070 Wien. Für Anfahrt, Öffnungszeiten und private Anlässe erreichen Sie uns direkt über die Kontaktseite.",
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
      freeGiftHintOne: "Ab 35€ darf 1 Gratisartikel ausgewählt werden.",
      freeGiftHintTwo: "Ab 70€ dürfen 2 Gratisartikel ausgewählt werden.",
      freeGiftTiersHint:
        "Ab %T1%€: bis zu %C1% Gratisartikel. Ab %T2%€: bis zu %C2%. Bei mehreren Gratisartikeln dürfen Sie dieselbe Auswahl mehrfach wählen (z. B. A + A).",
      freeGiftSelectLabel: "Gratisartikel",
      freeGiftSelectPlaceholder: "Bitte auswählen",
      freeGiftNotConfigured: "Aktuell sind keine Gratisartikel konfiguriert.",
      fulfillment: "Abholung oder Lieferung",
      pickupTime: "Abholzeit",
      pickupDateLabel: "Abholdatum",
      pickupPhoneInfoTitle: "Telefon für Abholung:",
      pickupPhoneInfoValue: "+4315223551",
      pickupPhoneCustomerLabel: "Ihre Telefonnummer (Pflichtfeld)",
      pickupPhoneCustomerHint: "Wir nutzen diese Nummer, um Sie bei der Abholung zu erreichen.",
      pickupSlotHint:
        "Angaben in Wiener Ortszeit. Früheste Abholung 11:30 Uhr, letzter Slot 21:30 Uhr. Dienstag geschlossen — bitte anderen Tag wählen.",
      deliveryDateLabel: "Gewünschter Liefertermin",
      deliveryTime: "Lieferzeit",
      deliveryTimeEstimate: "Lieferzeit in der Regel ca. 45–60 Minuten.",
      deliveryAreaNotice: "Lieferung nur in den 6., 7., 8., 15. und 16. Wiener Gemeindebezirk.",
      openingHoursTitle: "Öffnungszeiten",
      openingHoursWedMon: "Mittwoch – Montag",
      openingHoursTuesday: "Dienstag",
      openingHoursOpenSlot: "11:00 – 21:30 Uhr",
      openingHoursClosed: "Geschlossen",
      openingHoursFootnote: "Angaben in Ortszeit Wien.",
      ordersClosedMessage:
        "Ab 21:15 Uhr (Wiener Zeit) ist für heute keine neue Online-Bestellung mehr möglich. Bitte ab Mitternacht erneut versuchen.",
      ordersClosedVacationMessage:
        "Online-Bestellungen sind aktuell wegen Urlaubsmodus deaktiviert. Bitte nach dem Urlaubszeitraum erneut versuchen.",
      errOrdersClosedCutoff:
        "Online-Bestellungen sind heute ab 21:15 Uhr Wiener Zeit nicht mehr möglich. Bitte ab Mitternacht erneut versuchen.",
      errOrdersClosedVacation:
        "Online-Bestellungen sind aktuell wegen Urlaubsmodus deaktiviert. Bitte nach dem Urlaubszeitraum erneut versuchen.",
      errPickupInvalidDatetime: "Bitte gültiges Abholdatum und eine gültige Uhrzeit wählen.",
      errPickupClosedTuesday: "Dienstags haben wir geschlossen — bitte wählen Sie einen anderen Abholtag.",
      errPickupDateOutOfRange: "Das Abholdatum liegt außerhalb des erlaubten Zeitraums.",
      errPickupTimeOutOfRange: "Die Abholzeit muss am gewählten Tag zwischen 11:30 und 21:30 Uhr liegen.",
      errDeliveryInvalidDate: "Bitte wählen Sie einen gültigen Liefertermin.",
      errDeliveryClosedTuesday: "Dienstags haben wir geschlossen — bitte wählen Sie einen anderen Liefertag.",
      errDeliveryDateOutOfRange: "Der Liefertermin liegt außerhalb des erlaubten Zeitraums.",
      errDeliveryOutsideArea: "Lieferung nur in die Bezirke 6, 7, 8, 15 und 16.",
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
      removeFromCart: "Entfernen",
      decreaseQty: "Menge verringern",
      increaseQty: "Menge erhöhen",
      emailRequired: "E-Mail (Pflichtfeld)",
      smsVerifyTitle: "Handy-Verifizierung",
      smsVerifyHintSubmit:
        "Telefonnummer eingeben, auf „Code senden“ tippen, dann den SMS-Code unten eingeben und bestätigen.",
      codeSentInfo: "Code gesendet. Bitte unten eingeben und auf Bestätigen tippen.",
      smsPhonePlaceholder: "06761234567",
      smsCodePlaceholder: "6-stelligen Code eingeben",
      sendCode: "Code senden",
      resendCode: "Code erneut senden",
      enterCode: "SMS-Code",
      confirmCode: "Code bestätigen",
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
      errSmtpNotConfigured:
        "Die Bestellung konnte nicht gesendet werden: E-Mail ist auf dem Server nicht eingerichtet (SMTP). Bitte später erneut versuchen oder das Restaurant anrufen.",
      errSmtpSendFailed:
        "Die Bestellung konnte nicht gesendet werden: Die Bestätigungs-E-Mail konnte nicht zugestellt werden. Bitte später erneut versuchen oder anrufen.",
      errPdfFailed:
        "Die Bestellung konnte nicht gesendet werden: Das Bestell-PDF konnte nicht erzeugt werden. Bitte später erneut versuchen oder anrufen.",
      errDeliveryPhoneSecretMissing:
        "Lieferung vorübergehend nicht möglich: Telefon-Verifizierung ist auf dem Server nicht konfiguriert. Abholung kann weiterhin funktionieren.",
      errSmsNotConfigured:
        "SMS-Verifizierung nicht verfügbar: Der SMS-Dienst ist nicht konfiguriert. Bitte Abholung wählen oder das Restaurant kontaktieren.",
      errSmsProviderFailed: "Der SMS-Dienst hat einen Fehler gemeldet. Bitte in Kürze erneut versuchen.",
      errMissingCustomerName: "Bitte geben Sie Ihren Namen ein.",
      errInvalidCustomerEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      errInvalidCustomerPhone: "Bitte geben Sie eine gültige Telefonnummer mit Ländervorwahl ein (z. B. +43 …).",
      errInvalidGiftSelection: "Die Auswahl der Gratisartikel ist ungültig. Bitte erneut auswählen.",
      errEmptyCartPayload: "Die Bestelldaten waren unvollständig. Bitte Seite neu laden und erneut bestellen.",
      errInvalidJsonBody: "Ungültige Anfrage. Bitte Seite neu laden und erneut versuchen.",
      paymentHeading: "Bezahlung",
      paymentPickupCash: "Die Bezahlung erfolgt bei Abholung in bar.",
      paymentPickupCardNote: "Vor Ort können Sie zusätzlich mit Karte (Bankomat/Terminal) zahlen.",
      paymentDeliveryCash: "Lieferung wird bar beim Fahrer bezahlt. Keine Online-Zahlung.",
      orderErrorGeneric: "Bestellung konnte nicht gesendet werden. Bitte erneut versuchen.",
      errOrderServerError:
        "Der Server konnte die Bestellung nicht abschließen. Bitte in ein paar Minuten erneut versuchen oder das Restaurant anrufen.",
      errOrderNetwork:
        "Keine Verbindung zum Server (Netzwerk). Bitte Verbindung prüfen und erneut versuchen, oder anrufen.",
      lunchStarterHint: "Im Mittagsmenü enthalten — bitte eine Option wählen.",
      soldOut: "Ausverkauft",
      deliveryMinOrder: "Mindestbestellwert für Lieferung: 15,00 €",
      deliveryAddressHeading: "Lieferadresse",
      errDeliveryAddressIncomplete: "Bitte Straße, Hausnummer, Postleitzahl und Ort ausfüllen.",
      errDeliveryAddressPlz: "Bitte eine gültige 4-stellige Postleitzahl eingeben.",
      sushiExtras: "Sushi Extras",
      wasabi: "Wasabi",
      ginger: "Ingwer",
      cutlery: "Besteck",
      chopsticks: "Stäbchen",
      woodSpoon: "Holzlöffel",
      woodFork: "Holzgabel",
      cutleryCount: "Anzahl",
      orderReferenceLabel: "Bestellnr.",
      orderPlacedSuccess: "Bestellung gesendet."
    }
  }
};
