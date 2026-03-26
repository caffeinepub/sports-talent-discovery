import type { Sport } from "../backend.d";

export const SPORT_OPTIONS = [
  { value: "football", label: "Football" },
  { value: "cricket", label: "Cricket" },
  { value: "basketball", label: "Basketball" },
  { value: "athletics", label: "Athletics" },
  { value: "other", label: "Other" },
];

export function encodeSport(name: string): Sport {
  switch (name) {
    case "football":
      return { __kind__: "football", football: null };
    case "cricket":
      return { __kind__: "cricket", cricket: null };
    case "basketball":
      return { __kind__: "basketball", basketball: null };
    case "athletics":
      return { __kind__: "athletics", athletics: null };
    default:
      return { __kind__: "other", other: name };
  }
}

export function decodeSport(sport: Sport): string {
  if (sport.__kind__ === "other") return sport.other;
  return sport.__kind__.charAt(0).toUpperCase() + sport.__kind__.slice(1);
}

export const SPORT_EMOJI: Record<string, string> = {
  football: "⚽",
  cricket: "🏏",
  basketball: "🏀",
  athletics: "🏃",
  other: "🏅",
};

export function sportEmoji(sport: Sport): string {
  const key = sport.__kind__ === "other" ? "other" : sport.__kind__;
  return SPORT_EMOJI[key] ?? "🏅";
}
