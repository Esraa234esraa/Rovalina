-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "discount" DECIMAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Offer" ("code", "createdAt", "description", "discount", "endDate", "id", "isActive", "startDate", "title", "titleEn", "type", "updatedAt") SELECT "code", "createdAt", "description", "discount", "endDate", "id", "isActive", "startDate", "title", "titleEn", "type", "updatedAt" FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
CREATE UNIQUE INDEX "Offer_code_key" ON "Offer"("code");
CREATE INDEX "Offer_isActive_idx" ON "Offer"("isActive");
CREATE INDEX "Offer_isFeatured_idx" ON "Offer"("isFeatured");
CREATE INDEX "Offer_startDate_idx" ON "Offer"("startDate");
CREATE INDEX "Offer_endDate_idx" ON "Offer"("endDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
