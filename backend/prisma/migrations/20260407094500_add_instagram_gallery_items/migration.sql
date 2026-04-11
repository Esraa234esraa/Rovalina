-- CreateTable
CREATE TABLE "InstagramGalleryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "InstagramGalleryItem_sortOrder_idx" ON "InstagramGalleryItem"("sortOrder");

-- CreateIndex
CREATE INDEX "InstagramGalleryItem_isActive_idx" ON "InstagramGalleryItem"("isActive");