
-- AI Settings table (admin-managed)
CREATE TABLE public.ai_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL DEFAULT 'gemini',
  model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  temperature numeric NOT NULL DEFAULT 0.2,
  enable_smart_search boolean NOT NULL DEFAULT true,
  enable_seller_assistant boolean NOT NULL DEFAULT true,
  enable_price_suggestion boolean NOT NULL DEFAULT true,
  enable_seo_optimization boolean NOT NULL DEFAULT true,
  openai_api_key text DEFAULT NULL,
  claude_api_key text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AI settings"
ON public.ai_settings FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view AI settings"
ON public.ai_settings FOR SELECT
USING (true);

-- Insert default settings
INSERT INTO public.ai_settings (provider, model, temperature) VALUES ('gemini', 'google/gemini-3-flash-preview', 0.2);

-- AI Usage Logs table
CREATE TABLE public.ai_usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action_type text NOT NULL, -- 'search', 'generate_listing', 'price_suggestion'
  prompt_summary text,
  tokens_used integer DEFAULT 0,
  provider text NOT NULL DEFAULT 'gemini',
  model text,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all AI logs"
ON public.ai_usage_logs FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own AI logs"
ON public.ai_usage_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert AI logs"
ON public.ai_usage_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage AI logs"
ON public.ai_usage_logs FOR ALL
USING (is_admin(auth.uid()));
