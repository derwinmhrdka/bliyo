CREATE TYPE "AffiliateLinkStatus" AS ENUM ('processing', 'note', 'done', 'rejected');

ALTER TABLE "affiliate_links" ADD COLUMN "status" "AffiliateLinkStatus" NOT NULL DEFAULT 'processing';

CREATE TABLE "link_events" (
    "id" UUID NOT NULL,
    "affiliate_link_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "link_events_affiliate_link_id_idx" ON "link_events"("affiliate_link_id");

ALTER TABLE "link_events" ADD CONSTRAINT "link_events_affiliate_link_id_fkey" FOREIGN KEY ("affiliate_link_id") REFERENCES "affiliate_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "link_events" ("id", "affiliate_link_id", "title", "created_at")
SELECT gen_random_uuid(), "id", 'Link didaftarkan', "created_at" FROM "affiliate_links";
