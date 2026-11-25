import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./en.json"
import si from "./si.json"
import no from "./no.json"
import de from "./de.json"
import es from "./es.json"
import cs from "./cs.json"
import ru from "./ru.json"
import bs from "./bs.json"
import el from "./el.json"
import fr from "./fr.json"
import sv from "./sv.json"
import it from "./it.json"
import ta from "./ta.json"

i18next.use(initReactI18next).init({
  // lng: 'en', // if you're using a language detector, do not define the lng option
  fallbackLng: "en",
  debug: process.env.NODE_ENV === 'development',
  resources: {
    en: {
      translation: en,
    },
    si: {
      translation: si,
    },
    no: {
      translation: no,
    },
    de: {
      translation: de,
    },
    es: {
      translation: es,
    },
    cs: {
      translation: cs,
    },
    ru: {
      translation: ru,
    },
    bs: {
      translation: bs,
    },
    el: {
      translation: el,
    },
    fr: {
      translation: fr,
    },
    sv: {
      translation: sv,
    },
    it: {
      translation: it,
    },
    ta: {
      translation: ta,
    },
  },
})
