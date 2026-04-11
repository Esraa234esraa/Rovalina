/*
  Warnings:

  - You are about to alter the column `paymentResponse` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Unsupported("json")` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "shippingAddressId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'COD',
    "transactionId" TEXT,
    "paymobOrderId" TEXT,
    "paymentResponse" JSONB,
    "subtotal" DECIMAL NOT NULL,
    "shippingFee" DECIMAL NOT NULL,
    "taxAmount" DECIMAL NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "governorate" TEXT,
    "postalCode" TEXT,
    "addressLine" TEXT NOT NULL,
    "notes" TEXT,
    "placedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("addressLine", "city", "createdAt", "currency", "customerEmail", "customerName", "customerPhone", "deliveredAt", "discountAmount", "governorate", "id", "notes", "orderNumber", "paymentMethod", "paymentResponse", "paymobOrderId", "placedAt", "postalCode", "shippingAddressId", "shippingFee", "status", "subtotal", "taxAmount", "total", "transactionId", "updatedAt", "userId") SELECT "addressLine", "city", "createdAt", "currency", "customerEmail", "customerName", "customerPhone", "deliveredAt", "discountAmount", "governorate", "id", "notes", "orderNumber", "paymentMethod", "paymentResponse", "paymobOrderId", "placedAt", "postalCode", "shippingAddressId", "shippingFee", "status", "subtotal", "taxAmount", "total", "transactionId", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_paymobOrderId_idx" ON "Order"("paymobOrderId");
CREATE INDEX "Order_transactionId_idx" ON "Order"("transactionId");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
