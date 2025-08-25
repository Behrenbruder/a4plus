import { NextResponse } from "next/server";
import programs from "@/data/foerderungen.json"; // resolveJsonModule muss true sein

type Program = {
  id: string;
  level: "BUND" | "LAND";
  name: string;
  categories: string[];
  target: "PRIVAT" | "GEWERBLICH" | "BEIDES" | "PRIVAT / GEWERBLICH" | "GEWERBLICH / WEG";
  type: "ZUSCHUSS" | "KREDIT" | "STEUER" | "VERGUETUNG" | "VERGÜTUNG" | "STEUERERLEICHTERUNG";
  summary: string;
  amount: string;
  criteria: string;
  validity: string;
  authority: string;
  url: string;
  regions?: { bundesland: string }[];
};

export async function POST(req: Request) {
  try {
    const { bundesland, categories, target } = await req.json();

    const cats: string[] | undefined = Array.isArray(categories) && categories.length ? categories : undefined;

    const matchCats = (p: Program) =>
      !cats || cats.some((c) => p.categories.map((x) => x.toLowerCase()).includes(c.toLowerCase()));

    const matchTarget = (p: Program) =>
      !target || p.target === target || p.target === "BEIDES";

    const bundesweit = (programs as Program[])
      .filter((p) => p.level === "BUND")
      .filter(matchCats)
      .filter(matchTarget)
      .sort((a, b) => a.name.localeCompare(b.name));

    const land = (programs as Program[])
      .filter((p) => p.level === "LAND")
      .filter(matchCats)
      .filter(matchTarget)
      .filter((p) => {
        if (!bundesland) return false;
        const regs = p.regions || [];
        return regs.some((r) => r.bundesland.toLowerCase() === String(bundesland).toLowerCase());
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      ok: true,
      result: { bundesweit, land },
      municipalNote:
        "Kommunale Programme prüfen wir aktuell manuell und melden uns bei Ihnen mit Details.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Serverfehler" }, { status: 500 });
  }
}
