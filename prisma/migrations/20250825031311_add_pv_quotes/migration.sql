-- CreateTable
CREATE TABLE "PvQuote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supabaseId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "roofType" TEXT,
    "roofTiltDeg" REAL,
    "annualConsumptionKwh" REAL,
    "electricityPriceCtPerKwh" REAL,
    "roofFaces" TEXT,
    "totalKwp" REAL,
    "annualPvKwh" REAL,
    "batteryKwh" REAL,
    "evKmPerYear" INTEGER,
    "evKwhPer100km" REAL,
    "evHomeChargingShare" REAL,
    "evChargerPowerKw" REAL,
    "heatPumpConsumptionKwh" REAL,
    "autarkiePct" REAL,
    "eigenverbrauchPct" REAL,
    "annualSavingsEur" REAL,
    "co2SavingsTons" REAL,
    "paybackTimeYears" REAL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PvQuote_supabaseId_key" ON "PvQuote"("supabaseId");
