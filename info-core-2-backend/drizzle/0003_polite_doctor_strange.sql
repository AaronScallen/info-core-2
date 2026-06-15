CREATE TYPE "public"."shift" AS ENUM('A-Shift', 'B-Shift', 'C-Shift');--> statement-breakpoint
CREATE TABLE "shift_roster" (
	"roster_id" serial PRIMARY KEY NOT NULL,
	"shift" "shift" NOT NULL,
	"roster_date" date NOT NULL,
	"enumber" integer NOT NULL,
	"badge_number" integer NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"vehicle_assigned" integer,
	"patrol_zone" varchar(50),
	"keys_in_vehicle" boolean DEFAULT false,
	"pass_along_notes" text,
	"supervisor_enumber" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "shift_roster" ADD CONSTRAINT "shift_roster_enumber_employees_enumber_fk" FOREIGN KEY ("enumber") REFERENCES "public"."employees"("enumber") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_roster" ADD CONSTRAINT "shift_roster_vehicle_assigned_police_vehicles_veh_id_fk" FOREIGN KEY ("vehicle_assigned") REFERENCES "public"."police_vehicles"("veh_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_roster" ADD CONSTRAINT "shift_roster_supervisor_enumber_employees_enumber_fk" FOREIGN KEY ("supervisor_enumber") REFERENCES "public"."employees"("enumber") ON DELETE no action ON UPDATE no action;