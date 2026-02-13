
-- Email templates table
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  subject text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '',
  description text,
  category text NOT NULL DEFAULT 'system',
  is_active boolean NOT NULL DEFAULT true,
  variables text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates" ON public.email_templates FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view active email templates" ON public.email_templates FOR SELECT USING (is_active = true);

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default templates
INSERT INTO public.email_templates (name, slug, subject, body_html, description, category, variables) VALUES
('Welcome Registration', 'welcome-registration', 'Welcome to APA Bazaar!', '<h1>Welcome {{display_name}}!</h1><p>Your account has been created successfully. Start posting ads today!</p>', 'Sent when a new user registers', 'auth', '{display_name, email}'),
('Email Verification', 'email-verification', 'Verify your email - APA Bazaar', '<h1>Hi {{display_name}}</h1><p>Please verify your email by clicking the link below:</p><p><a href="{{verification_link}}">Verify Email</a></p>', 'Email verification link', 'auth', '{display_name, verification_link}'),
('Password Reset', 'password-reset', 'Reset your password - APA Bazaar', '<h1>Hi {{display_name}}</h1><p>Click below to reset your password:</p><p><a href="{{reset_link}}">Reset Password</a></p>', 'Password reset request', 'auth', '{display_name, reset_link}'),
('New Message Received', 'new-message', 'You have a new message on APA Bazaar', '<h1>Hi {{display_name}}</h1><p>{{sender_name}} sent you a message about "{{listing_title}}".</p><p>Log in to respond.</p>', 'Notify user of new message', 'messaging', '{display_name, sender_name, listing_title}'),
('Listing Approved', 'listing-approved', 'Your ad has been approved!', '<h1>Good news {{display_name}}!</h1><p>Your listing "{{listing_title}}" is now live on APA Bazaar.</p>', 'Listing approved by admin', 'listings', '{display_name, listing_title}'),
('Listing Rejected', 'listing-rejected', 'Your ad needs changes', '<h1>Hi {{display_name}}</h1><p>Your listing "{{listing_title}}" was not approved.</p><p>Reason: {{rejection_reason}}</p>', 'Listing rejected by admin', 'listings', '{display_name, listing_title, rejection_reason}'),
('Verification Approved', 'verification-approved', 'You are now a verified seller!', '<h1>Congratulations {{display_name}}!</h1><p>Your identity has been verified. You now have the verified badge.</p>', 'Seller verification approved', 'verification', '{display_name}'),
('Verification Rejected', 'verification-rejected', 'Verification update', '<h1>Hi {{display_name}}</h1><p>Your verification was not approved.</p><p>Reason: {{rejection_reason}}</p><p>Please re-upload your documents.</p>', 'Seller verification rejected', 'verification', '{display_name, rejection_reason}'),
('Subscription Confirmed', 'subscription-confirmed', 'Subscription activated!', '<h1>Hi {{display_name}}</h1><p>Your {{package_name}} subscription is now active. You can post up to {{max_ads}} ads.</p>', 'Subscription payment confirmed', 'billing', '{display_name, package_name, max_ads}'),
('Subscription Expiring', 'subscription-expiring', 'Your subscription expires soon', '<h1>Hi {{display_name}}</h1><p>Your {{package_name}} subscription expires on {{expiry_date}}. Renew now to keep your ads live.</p>', 'Subscription expiry reminder', 'billing', '{display_name, package_name, expiry_date}'),
('Support Ticket Reply', 'support-reply', 'Response to your support request', '<h1>Hi {{display_name}}</h1><p>We''ve responded to your support ticket: "{{ticket_subject}}".</p><p>{{reply_content}}</p>', 'Admin reply to support ticket', 'support', '{display_name, ticket_subject, reply_content}'),
('Report Resolved', 'report-resolved', 'Your report has been reviewed', '<h1>Hi {{display_name}}</h1><p>We''ve reviewed your report and taken appropriate action. Thank you for keeping APA Bazaar safe.</p>', 'Report reviewed notification', 'moderation', '{display_name}');

-- Communication channels config table (for future SMS/WhatsApp)
CREATE TABLE public.communication_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type text NOT NULL UNIQUE,
  is_enabled boolean NOT NULL DEFAULT false,
  config jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage channels" ON public.communication_channels FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view channels" ON public.communication_channels FOR SELECT USING (true);

INSERT INTO public.communication_channels (channel_type, is_enabled, config) VALUES
('email', true, '{"provider": "supabase", "from_name": "APA Bazaar", "from_email": "noreply@apabazaar.com"}'),
('sms', false, '{"provider": "not_configured", "note": "Configure SMS provider API keys"}'),
('whatsapp', false, '{"provider": "not_configured", "note": "Configure WhatsApp Business API"}');
