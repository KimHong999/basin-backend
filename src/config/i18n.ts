import { I18n } from "i18n";
import path from "path";

const i18n = new I18n({
  locales: ["en", 'ja'],
  directory: path.join(__dirname, "locales"),
  objectNotation: true,
  defaultLocale: "en"
});

export default i18n;
