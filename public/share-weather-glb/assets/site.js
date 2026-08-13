(() => {
  "use strict";

  const aliases = {
    en: "en", "en-us": "en", "en-gb": "en", english: "en",
    ja: "ja", jp: "ja", "ja-jp": "ja", japanese: "ja",
    ko: "ko", kr: "ko", "ko-kr": "ko", korean: "ko"
  };
  const localeTags = { en: "en", ja: "ja-JP", ko: "ko-KR" };
  const params = new URLSearchParams(window.location.search);
  const requested = (params.get("lang") || params.get("locale") || "en").trim().toLowerCase();
  let activeLanguage = aliases[requested] || aliases[requested.split("_")[0]] || "en";

  function valueAtPath(source, path) {
    return path.split(".").reduce((value, key) => value && value[key], source);
  }

  function translated(key) {
    const page = window.PAGE_I18N || {};
    return valueAtPath(page[activeLanguage], key) ?? valueAtPath(page.en, key) ?? "";
  }

  function localizedUrl(url, language) {
    const resolved = new URL(url, window.location.href);
    resolved.searchParams.set("lang", language);
    return resolved.href;
  }

  function render() {
    document.documentElement.lang = localeTags[activeLanguage];
    document.title = translated("meta.title");
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = translated("meta.description");

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = translated(element.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", translated(element.dataset.i18nPlaceholder));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", translated(element.dataset.i18nAriaLabel));
    });

    document.querySelectorAll("[data-lang]").forEach((button) => {
      const selected = button.dataset.lang === activeLanguage;
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute("title", translated(`language.${button.dataset.lang}`));
      button.setAttribute("aria-label", translated(`language.${button.dataset.lang}`));
    });

    document.querySelectorAll("a[data-keep-lang]").forEach((link) => {
      link.href = localizedUrl(link.getAttribute("href"), activeLanguage);
    });

    document.querySelectorAll("link[data-language-alternate]").forEach((link) => {
      link.href = localizedUrl(window.location.pathname, link.hreflang === "x-default" ? "en" : link.hreflang);
    });
  }

  function selectLanguage(language) {
    if (!aliases[language]) return;
    activeLanguage = aliases[language];
    const next = new URL(window.location.href);
    next.searchParams.delete("locale");
    next.searchParams.set("lang", activeLanguage);
    window.history.replaceState({}, "", next);
    render();
    document.dispatchEvent(new CustomEvent("shareweather:languagechange", { detail: { language: activeLanguage } }));
  }

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => selectLanguage(button.dataset.lang));
  });

  window.ShareWeatherLocale = { get language() { return activeLanguage; }, select: selectLanguage };
  render();
})();
