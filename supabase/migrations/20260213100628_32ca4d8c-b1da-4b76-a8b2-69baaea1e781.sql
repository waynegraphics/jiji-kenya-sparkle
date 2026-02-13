
-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  category TEXT,
  author_name TEXT NOT NULL DEFAULT 'APA Bazaar Team',
  author_id UUID NOT NULL,
  faqs JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  read_time TEXT,
  views INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (is_admin(auth.uid()));

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Career openings table
CREATE TABLE public.career_openings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Nairobi, Kenya',
  job_type TEXT NOT NULL DEFAULT 'Full-time',
  salary_range TEXT,
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  application_deadline TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.career_openings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active career openings" ON public.career_openings
  FOR SELECT USING (status = 'active' OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage career openings" ON public.career_openings
  FOR ALL USING (is_admin(auth.uid()));

CREATE TRIGGER update_career_openings_updated_at
  BEFORE UPDATE ON public.career_openings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Career applications table
CREATE TABLE public.career_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opening_id UUID NOT NULL REFERENCES public.career_openings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit applications" ON public.career_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage applications" ON public.career_applications
  FOR ALL USING (is_admin(auth.uid()));

CREATE TRIGGER update_career_applications_updated_at
  BEFORE UPDATE ON public.career_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload resumes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Admins can view resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes' AND is_admin(auth.uid()));
