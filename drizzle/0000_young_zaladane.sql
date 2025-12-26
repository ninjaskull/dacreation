CREATE TABLE "activity_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"user_id" varchar,
	"action" text NOT NULL,
	"details" text,
	"outcome" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_status" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"status" text DEFAULT 'offline' NOT NULL,
	"status_message" text,
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	"active_conversations" integer DEFAULT 0 NOT NULL,
	"max_conversations" integer DEFAULT 5 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agent_status_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"assigned_to" varchar,
	"title" text NOT NULL,
	"description" text,
	"scheduled_at" timestamp NOT NULL,
	"duration" integer DEFAULT 30 NOT NULL,
	"type" text DEFAULT 'call' NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"reminder_sent" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"featured_image" text,
	"author" text,
	"category" text,
	"tags" text[],
	"status" text DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"published_at" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "callback_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"event_type" text,
	"message" text,
	"source" text DEFAULT 'floating_cta' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"assigned_to" varchar,
	"notes" text,
	"called_at" timestamp,
	"scheduled_call_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "careers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"department" text NOT NULL,
	"location" text NOT NULL,
	"type" text NOT NULL,
	"experience" text,
	"description" text NOT NULL,
	"requirements" text[],
	"benefits" text[],
	"salary" text,
	"application_email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"sender_id" text NOT NULL,
	"sender_type" text DEFAULT 'visitor' NOT NULL,
	"sender_name" text,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'text' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"company" text,
	"address" text,
	"city" text,
	"country" text,
	"status" text DEFAULT 'new' NOT NULL,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"events_count" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"tags" text[],
	"source" text,
	"referred_by" varchar,
	"last_contact_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"country" text,
	"website" text,
	"tax_id" text,
	"logo" text,
	"logo_white" text,
	"currency" text DEFAULT 'INR' NOT NULL,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"fiscal_year_start" text DEFAULT '04' NOT NULL,
	"whatsapp_number" text,
	"map_embed_code" text,
	"top_bar_address" text,
	"secondary_address" text,
	"social_media" jsonb DEFAULT '[]',
	"number_of_events_held" integer DEFAULT 0,
	"ratings" text DEFAULT '0',
	"weddings_count" integer DEFAULT 0,
	"corporate_count" integer DEFAULT 0,
	"social_count" integer DEFAULT 0,
	"awards_count" integer DEFAULT 0,
	"destinations_count" integer DEFAULT 0,
	"happy_guests_count" integer DEFAULT 0,
	"client_satisfaction" integer DEFAULT 0,
	"show_preferred_by" boolean DEFAULT true NOT NULL,
	"show_trusted_by" boolean DEFAULT true NOT NULL,
	"tagline" text,
	"short_description" text,
	"full_description" text,
	"founded_year" integer,
	"team_members_count" integer,
	"business_hours_weekdays" text,
	"business_hours_sunday" text,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"primary_color" text,
	"primary_color_dark" text,
	"primary_color_light" text,
	"secondary_color" text,
	"accent_color" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" text NOT NULL,
	"visitor_name" text,
	"visitor_phone" text,
	"visitor_email" text,
	"event_type" text,
	"event_date" text,
	"event_location" text,
	"budget_range" text,
	"guest_count" integer,
	"lead_id" varchar,
	"phase" text DEFAULT 'collecting' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"wants_live_agent" boolean DEFAULT false NOT NULL,
	"live_agent_requested_at" timestamp,
	"assigned_to" varchar,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"first_response_time" integer,
	"avg_response_time" integer,
	"total_messages" integer DEFAULT 0 NOT NULL,
	"visitor_rating" integer,
	"visitor_feedback" text,
	"tags" text[],
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar,
	"recipient_email" text NOT NULL,
	"recipient_name" text,
	"subject" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"template_key" text NOT NULL,
	"type" text DEFAULT 'notification' NOT NULL,
	"subject" text NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text,
	"designer_data" text,
	"variables" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_templates_template_key_unique" UNIQUE("template_key")
);
--> statement-breakpoint
CREATE TABLE "email_type_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"transactional_enabled" boolean DEFAULT true NOT NULL,
	"internal_enabled" boolean DEFAULT true NOT NULL,
	"marketing_enabled" boolean DEFAULT false NOT NULL,
	"reminder_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"client_id" varchar,
	"lead_id" varchar,
	"date" timestamp NOT NULL,
	"end_date" timestamp,
	"venue" text,
	"venue_address" text,
	"guest_count" integer,
	"budget" integer,
	"contract_amount" integer,
	"paid_amount" integer DEFAULT 0 NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"status" text DEFAULT 'planning' NOT NULL,
	"notes" text,
	"timeline" jsonb,
	"vendor_ids" text[],
	"assigned_to" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit" text DEFAULT 'unit',
	"unit_price" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0,
	"taxable" boolean DEFAULT true NOT NULL,
	"hsn_code" text,
	"sac_code" text,
	"total" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"payment_method" text DEFAULT 'bank_transfer' NOT NULL,
	"transaction_id" text,
	"notes" text,
	"received_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"layout" text DEFAULT 'modernPremium' NOT NULL,
	"primary_color" text DEFAULT '#3B82F6' NOT NULL,
	"secondary_color" text DEFAULT '#1E40AF' NOT NULL,
	"accent_color" text DEFAULT '#60A5FA' NOT NULL,
	"font_family" text DEFAULT 'Inter' NOT NULL,
	"logo_url" text,
	"company_name" text,
	"company_address" text,
	"company_phone" text,
	"company_email" text,
	"company_website" text,
	"company_gst" text,
	"company_pan" text,
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc" text,
	"bank_branch" text,
	"upi_id" text,
	"header_text" text,
	"footer_text" text,
	"terms_and_conditions" text,
	"notes" text,
	"show_logo" boolean DEFAULT true NOT NULL,
	"show_gst" boolean DEFAULT true NOT NULL,
	"show_bank_details" boolean DEFAULT true NOT NULL,
	"show_upi" boolean DEFAULT true NOT NULL,
	"show_signature" boolean DEFAULT true NOT NULL,
	"signature_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"template_id" varchar,
	"client_id" varchar,
	"event_id" varchar,
	"title" text NOT NULL,
	"description" text,
	"issue_date" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"discount_type" text DEFAULT 'percentage',
	"discount_value" integer DEFAULT 0,
	"discount_amount" integer DEFAULT 0,
	"tax_type" text DEFAULT 'gst',
	"cgst_rate" integer DEFAULT 9,
	"sgst_rate" integer DEFAULT 9,
	"igst_rate" integer DEFAULT 18,
	"cgst_amount" integer DEFAULT 0,
	"sgst_amount" integer DEFAULT 0,
	"igst_amount" integer DEFAULT 0,
	"total_tax" integer DEFAULT 0,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"paid_amount" integer DEFAULT 0 NOT NULL,
	"balance_due" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"notes" text,
	"internal_notes" text,
	"terms_and_conditions" text,
	"client_name" text,
	"client_email" text,
	"client_phone" text,
	"client_address" text,
	"client_gst" text,
	"billing_address" text,
	"shipping_address" text,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"paid_at" timestamp,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "lead_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"user_id" varchar,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"date" timestamp,
	"guest_count" integer,
	"location" text,
	"budget_range" text,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"contact_method" text DEFAULT 'whatsapp' NOT NULL,
	"lead_source" text DEFAULT 'website' NOT NULL,
	"lead_magnet" text,
	"message" text,
	"consent_given" boolean DEFAULT true,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text,
	"assigned_to" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_key" text NOT NULL,
	"title" text,
	"subtitle" text,
	"content" text,
	"hero_image" text,
	"meta_title" text,
	"meta_description" text,
	"sections" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_content_page_key_unique" UNIQUE("page_key")
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"location" text,
	"date" text,
	"client" text,
	"images" text[],
	"featured_image" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_videos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_item_id" varchar NOT NULL,
	"title" text NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"duration" integer,
	"thumbnail" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "press_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"publication" text NOT NULL,
	"published_date" text,
	"excerpt" text,
	"content" text,
	"external_url" text,
	"image" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"client_id" varchar,
	"template_id" varchar,
	"frequency" text DEFAULT 'monthly' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"next_invoice_date" timestamp NOT NULL,
	"day_of_month" integer DEFAULT 1,
	"day_of_week" integer DEFAULT 1,
	"auto_send" boolean DEFAULT false NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"discount_type" text DEFAULT 'percentage',
	"discount_value" integer DEFAULT 0,
	"tax_type" text DEFAULT 'gst',
	"cgst_rate" integer DEFAULT 9,
	"sgst_rate" integer DEFAULT 9,
	"igst_rate" integer DEFAULT 18,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"terms_and_conditions" text,
	"client_name" text,
	"client_email" text,
	"client_phone" text,
	"client_address" text,
	"client_gst" text,
	"generated_count" integer DEFAULT 0 NOT NULL,
	"last_generated_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp (6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smtp_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host" text NOT NULL,
	"port" integer DEFAULT 587 NOT NULL,
	"encryption" text DEFAULT 'tls' NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"sender_name" text NOT NULL,
	"sender_email" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_tested_at" timestamp,
	"last_test_result" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"status" text DEFAULT 'active' NOT NULL,
	"source" text DEFAULT 'footer' NOT NULL,
	"tags" text[],
	"preferences" jsonb,
	"ip_address" text,
	"user_agent" text,
	"confirmation_token" text,
	"confirmed_at" timestamp,
	"unsubscribed_at" timestamp,
	"unsubscribe_reason" text,
	"bounced_at" timestamp,
	"bounce_type" text,
	"complained_at" timestamp,
	"last_email_sent_at" timestamp,
	"emails_sent_count" integer DEFAULT 0 NOT NULL,
	"emails_opened_count" integer DEFAULT 0 NOT NULL,
	"emails_clicked_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"bio" text,
	"image" text,
	"email" text,
	"phone" text,
	"linkedin" text,
	"instagram" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_name" text NOT NULL,
	"client_role" text,
	"event_type" text,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"image" text,
	"video_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"notify_new_leads" boolean DEFAULT true NOT NULL,
	"notify_appointments" boolean DEFAULT true NOT NULL,
	"notify_weekly_reports" boolean DEFAULT false NOT NULL,
	"notify_payments" boolean DEFAULT true NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"role" text DEFAULT 'staff' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vendor_approval_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_registration_id" varchar NOT NULL,
	"action" text NOT NULL,
	"from_status" text,
	"to_status" text,
	"performed_by" varchar,
	"performed_by_name" text,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_registration_id" varchar NOT NULL,
	"vendor_id" varchar,
	"document_type" text NOT NULL,
	"document_name" text NOT NULL,
	"document_number" text,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"issue_date" timestamp,
	"expiry_date" timestamp,
	"issuing_authority" text,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"verified_by" varchar,
	"verified_at" timestamp,
	"verification_notes" text,
	"rejection_reason" text,
	"is_required" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_performance_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" varchar NOT NULL,
	"event_id" varchar,
	"reviewed_by" varchar,
	"quality_rating" integer,
	"punctuality_rating" integer,
	"communication_rating" integer,
	"value_rating" integer,
	"overall_rating" integer,
	"strengths" text,
	"improvements" text,
	"internal_notes" text,
	"would_recommend" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_registrations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_name" text NOT NULL,
	"brand_name" text,
	"entity_type" text NOT NULL,
	"year_established" integer,
	"employee_count" text,
	"annual_turnover" text,
	"pan_number" text,
	"gst_number" text,
	"gst_state" text,
	"msme_number" text,
	"udyam_number" text,
	"cin_number" text,
	"fssai_number" text,
	"contact_person_name" text NOT NULL,
	"contact_person_designation" text,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"contact_whatsapp" text,
	"secondary_contact_name" text,
	"secondary_contact_phone" text,
	"secondary_contact_email" text,
	"escalation_contact_name" text,
	"escalation_contact_phone" text,
	"registered_address" text,
	"registered_city" text,
	"registered_state" text,
	"registered_pincode" text,
	"operational_address" text,
	"operational_city" text,
	"operational_state" text,
	"operational_pincode" text,
	"categories" text[],
	"primary_category" text,
	"service_description" text,
	"specializations" text[],
	"service_areas" text[],
	"service_cities" text[],
	"service_states" text[],
	"pan_india_service" boolean DEFAULT false,
	"international_service" boolean DEFAULT false,
	"international_locations" text[],
	"minimum_guest_capacity" integer,
	"maximum_guest_capacity" integer,
	"events_per_month" integer,
	"staff_strength" integer,
	"equipment_owned" boolean DEFAULT true,
	"equipment_details" text,
	"minimum_budget" integer,
	"average_event_value" integer,
	"pricing_tier" text,
	"payment_terms" text,
	"advance_percentage" integer,
	"accepts_online_payment" boolean DEFAULT true,
	"accepted_payment_modes" text[],
	"bank_name" text,
	"bank_branch" text,
	"account_number" text,
	"ifsc_code" text,
	"account_holder_name" text,
	"upi_id" text,
	"years_in_business" integer,
	"events_completed" integer,
	"major_clients" text[],
	"portfolio_links" text[],
	"website_url" text,
	"instagram_url" text,
	"facebook_url" text,
	"youtube_url" text,
	"has_liability_insurance" boolean DEFAULT false,
	"insurance_coverage" integer,
	"insurance_expiry_date" timestamp,
	"has_fire_safety_certificate" boolean DEFAULT false,
	"has_pollution_certificate" boolean DEFAULT false,
	"has_no_pending_litigation" boolean DEFAULT true,
	"has_never_blacklisted" boolean DEFAULT true,
	"declaration_notes" text,
	"agrees_to_terms" boolean DEFAULT false,
	"agrees_to_nda" boolean DEFAULT false,
	"agrees_to_exclusivity" boolean DEFAULT false,
	"status" text DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"approved_by" varchar,
	"approved_at" timestamp,
	"rejection_reason" text,
	"rejection_notes" text,
	"internal_notes" text,
	"internal_rating" integer,
	"verification_score" integer,
	"risk_level" text,
	"vendor_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_service_offerings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" varchar NOT NULL,
	"service_name" text NOT NULL,
	"service_category" text,
	"description" text,
	"base_price" integer,
	"max_price" integer,
	"price_unit" text,
	"minimum_order" text,
	"delivery_time" text,
	"inclusions" text[],
	"exclusions" text[],
	"terms" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"alternate_phone" text,
	"address" text,
	"city" text,
	"website" text,
	"rating" integer DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"events_completed" integer DEFAULT 0 NOT NULL,
	"price_range" text,
	"description" text,
	"services" text[],
	"portfolio" text[],
	"status" text DEFAULT 'active' NOT NULL,
	"contract_terms" text,
	"payment_terms" text,
	"notes" text,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_status" ADD CONSTRAINT "agent_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "callback_requests" ADD CONSTRAINT "callback_requests_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_referred_by_clients_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_template_id_invoice_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."invoice_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_videos" ADD CONSTRAINT "portfolio_videos_portfolio_item_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_item_id") REFERENCES "public"."portfolio_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_template_id_invoice_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."invoice_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoices" ADD CONSTRAINT "recurring_invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_approval_logs" ADD CONSTRAINT "vendor_approval_logs_vendor_registration_id_vendor_registrations_id_fk" FOREIGN KEY ("vendor_registration_id") REFERENCES "public"."vendor_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_approval_logs" ADD CONSTRAINT "vendor_approval_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_vendor_registration_id_vendor_registrations_id_fk" FOREIGN KEY ("vendor_registration_id") REFERENCES "public"."vendor_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_performance_reviews" ADD CONSTRAINT "vendor_performance_reviews_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_performance_reviews" ADD CONSTRAINT "vendor_performance_reviews_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_performance_reviews" ADD CONSTRAINT "vendor_performance_reviews_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_registrations" ADD CONSTRAINT "vendor_registrations_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_registrations" ADD CONSTRAINT "vendor_registrations_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_registrations" ADD CONSTRAINT "vendor_registrations_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_service_offerings" ADD CONSTRAINT "vendor_service_offerings_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;