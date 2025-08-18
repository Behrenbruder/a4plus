-- CreateTable
CREATE TABLE "Lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bundesland" TEXT NOT NULL,
    "haustyp" TEXT NOT NULL,
    "dachform" TEXT NOT NULL,
    "personen" TEXT NOT NULL,
    "eigentuemer" BOOLEAN NOT NULL,
    "plz" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "wantsOffer" BOOLEAN NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
