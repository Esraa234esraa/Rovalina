-- AlterTable
ALTER TABLE "Order" ADD COLUMN "transactionId" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymobOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentResponse" JSON;

-- CreateIndex
CREATE INDEX "Order_paymobOrderId_idx" ON "Order"("paymobOrderId");

-- CreateIndex
CREATE INDEX "Order_transactionId_idx" ON "Order"("transactionId");
