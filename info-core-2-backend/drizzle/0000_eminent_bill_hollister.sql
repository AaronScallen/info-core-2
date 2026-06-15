CREATE TYPE "public"."role" AS ENUM('dispatch', 'officer', 'supervisor', 'command_staff');--> statement-breakpoint
CREATE TABLE "absences" (
	"absence_id" serial PRIMARY KEY NOT NULL,
	"enumber" integer,
	"assignment" varchar(255),
	"covering_emp_id" integer,
	"date_of_entry" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"assignment_id" serial PRIMARY KEY NOT NULL,
	"assn_id" integer NOT NULL,
	"location_name" varchar(255),
	CONSTRAINT "assignments_assn_id_unique" UNIQUE("assn_id")
);
--> statement-breakpoint
CREATE TABLE "bodycams" (
	"bwc_id" integer PRIMARY KEY NOT NULL,
	"device" varchar(100),
	"locator" varchar(100),
	"model" varchar(100),
	"wifi_mac_address" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "cell_phones" (
	"phone_id" serial PRIMARY KEY NOT NULL,
	"id_short" integer,
	"phone_num" varchar(20),
	"make" varchar(50),
	"model" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"enumber" integer PRIMARY KEY NOT NULL,
	"badge" integer,
	"position_number" integer,
	"pid" integer,
	"dob" date,
	"last_name" varchar(100),
	"first_name" varchar(100),
	"assignment_id" integer,
	"bwc_id" integer,
	"veh_id" integer,
	"cellphone_id" integer,
	CONSTRAINT "employees_badge_unique" UNIQUE("badge"),
	CONSTRAINT "employees_position_number_unique" UNIQUE("position_number"),
	CONSTRAINT "employees_pid_unique" UNIQUE("pid")
);
--> statement-breakpoint
CREATE TABLE "police_vehicles" (
	"veh_id" integer PRIMARY KEY NOT NULL,
	"unit_number" integer,
	"color" varchar(50),
	"year" integer,
	"make" varchar(50),
	"model" varchar(50),
	"decals" boolean DEFAULT false,
	"vin" varchar(100),
	"lp_number" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'officer' NOT NULL,
	"employee_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "absences" ADD CONSTRAINT "absences_enumber_employees_enumber_fk" FOREIGN KEY ("enumber") REFERENCES "public"."employees"("enumber") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "absences" ADD CONSTRAINT "absences_covering_emp_id_employees_enumber_fk" FOREIGN KEY ("covering_emp_id") REFERENCES "public"."employees"("enumber") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_assignment_id_assignments_assn_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("assn_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_bwc_id_bodycams_bwc_id_fk" FOREIGN KEY ("bwc_id") REFERENCES "public"."bodycams"("bwc_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_veh_id_police_vehicles_veh_id_fk" FOREIGN KEY ("veh_id") REFERENCES "public"."police_vehicles"("veh_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_cellphone_id_cell_phones_phone_id_fk" FOREIGN KEY ("cellphone_id") REFERENCES "public"."cell_phones"("phone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_employees_enumber_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("enumber") ON DELETE no action ON UPDATE no action;