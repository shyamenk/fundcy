CREATE TYPE "public"."goal_status" AS ENUM('active', 'completed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'savings', 'investment');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "transaction_type" NOT NULL,
	"color" varchar(7),
	"icon" varchar(50),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goal_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid,
	"transaction_id" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(1000),
	"target_amount" numeric(12, 2) NOT NULL,
	"current_amount" numeric(12, 2) DEFAULT '0',
	"target_date" date,
	"category" varchar(100),
	"status" "goal_status" DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" varchar(255) NOT NULL,
	"category_id" uuid,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "goal_contributions" ADD CONSTRAINT "goal_contributions_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_contributions" ADD CONSTRAINT "goal_contributions_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;