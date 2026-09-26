export type ThemeId = "arena" | "candy" | "club";

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  tagline: string;
  blurb: string;
};

export const THEMES: ThemeDefinition[] = [
  {
    id: "club",
    name: "Club Night",
    tagline: "Estilo activo",
    blurb:
      "Morado saturado de marketing PlayUs, cards blancas flotantes y CTA amarillo.",
  },
  {
    id: "arena",
    name: "Arena Soft",
    tagline: "El más fiel a PlayUs",
    blurb:
      "Fondo crema con puntos, morado juguetón, amarillo bubble y cards blancas. Social casual.",
  },
  {
    id: "candy",
    name: "Candy Court",
    tagline: "Misma energía, más chuche",
    blurb:
      "Crema cálida, coral y menta. Misma anatomía de pills y crowns, paleta más frutal.",
  },
];

export const THEME_STORAGE_KEY = "ronda-theme-v3";
