ALTER TABLE "users" ADD COLUMN "first_name" TEXT;
ALTER TABLE "users" ADD COLUMN "last_name" TEXT;
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "address" TEXT;
ALTER TABLE "users" ADD COLUMN "avatar_data" TEXT;
ALTER TABLE "users" ADD COLUMN "referral_code" TEXT;

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
