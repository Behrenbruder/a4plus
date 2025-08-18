#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse, json, os
from datetime import date
import pandas as pd
import holidays  # pip install holidays

def load_h25_table(xlsx_path: str, sheet_name: str = "H25") -> dict:
    """
    Erwartet im Sheet:
      Spalten: Monat | Typ | 0 | 1 | ... | 23
      Typ in {"WT","SA","FT"}, Monat 1..12
    Gibt Lookup (monat, typ) -> Liste[24] zurück.
    """
    df = pd.read_excel(xlsx_path, sheet_name=sheet_name)
    df.columns = [str(c).strip() for c in df.columns]

    # Kolumnen erkennen
    mcol = next((c for c in df.columns if c.lower().startswith("monat")), None)
    tcol = next((c for c in df.columns if c.lower().startswith("typ")), None)
    if not mcol or not tcol:
        raise ValueError("Konnte Spalten 'Monat'/'Typ' nicht finden. Bitte Sheet prüfen.")

    # nur relevante Zeilen
    df = df[df[tcol].astype(str).str.upper().isin(["WT", "SA", "FT"])].copy()

    # Stunden-Spalten ermitteln
    hours_cols = [c for c in df.columns if c.isdigit() and 0 <= int(c) <= 23]
    if len(hours_cols) != 24:
        # Fallback: H0..H23
        hours_cols = []
        for h in range(24):
            cand = [c for c in df.columns if c.strip() == str(h) or c.strip().lower() == f"h{h}"]
            if cand:
                hours_cols.append(cand[0])
        if len(hours_cols) != 24:
            raise ValueError("Konnte die 24 Stunden-Spalten nicht eindeutig erkennen.")

    lut = {}
    for _, row in df.iterrows():
        m = int(row[mcol])
        typ = str(row[tcol]).upper()
        vec = [float(row[c]) for c in hours_cols]
        lut[(m, typ)] = vec
    return lut

def daytype_for(dt: date, bundesland: str) -> str:
    de_holidays = holidays.Germany(prov=bundesland, years=dt.year)
    if dt in de_holidays:
        return "FT"
    if dt.weekday() == 5:
        return "SA"
    if dt.weekday() == 6:
        return "FT"
    return "WT"

def dynamize_placeholder(month: int, vec24: list[float]) -> list[float]:
    # TODO: Hier ggf. die offizielle Dynamisierung aus der BDEW-Anwendungshilfe implementieren.
    return vec24

def build_8760(year: int, bundesland: str, lut: dict) -> list[float]:
    idx = pd.date_range(f"{year}-01-01", f"{year}-12-31 23:00:00", freq="H")
    vals = []
    for ts in idx:
        m = ts.month
        typ = daytype_for(ts.date(), bundesland)
        vec = lut.get((m, typ))
        if vec is None:
            raise KeyError(f"Keine 24h-Kurve für Monat {m}, Typ {typ} gefunden.")
        h = ts.hour
        dyn_vec = dynamize_placeholder(m, vec)
        vals.append(float(dyn_vec[h]))
    return vals

def normalize(arr: list[float]) -> list[float]:
    s = sum(arr)
    if s <= 0:
        raise ValueError("Summe <= 0. Bitte XLSX prüfen.")
    return [x / s for x in arr]

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="BDEW H25 XLSX -> 8760 JSON (normiert).")
    ap.add_argument("--xlsx", required=True, help="Pfad zur SLP.xlsx")
    ap.add_argument("--sheet", default="H25", help="Sheet-Name (Standard: H25)")
    ap.add_argument("--year", type=int, default=2024, help="Zieljahr für Kalender/Feiertage")
    ap.add_argument("--bundesland", default="RP", help="z.B. RP, HE, BY, BE, ...")
    ap.add_argument("--out", default="public/data/bdew_h25_8760.json", help="Ziel-JSON-Pfad")
    args = ap.parse_args()

    lut = load_h25_table(args.xlsx, args.sheet)
    arr = build_8760(args.year, args.bundesland, lut)
    arr_norm = normalize(arr)  # Summe ≈ 1

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(arr_norm, f, ensure_ascii=False)
    print(f"OK: wrote {args.out} (len={len(arr_norm)}, sum={sum(arr_norm):.6f})")
