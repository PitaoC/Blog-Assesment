-- Create the blogs table for the blog application
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow authenticated users to read all blogs
CREATE POLICY "Blogs are viewable by everyone" ON public.blogs
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own blogs
CREATE POLICY "Users can insert their own blogs" ON public.blogs
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own blogs
CREATE POLICY "Users can update their own blogs" ON public.blogs
  FOR UPDATE USING (auth.uid() = author_id);

-- Allow users to delete their own blogs
CREATE POLICY "Users can delete their own blogs" ON public.blogs
  FOR DELETE USING (auth.uid() = author_id);

-- Create an index on author_id for better performance
CREATE INDEX IF NOT EXISTS blogs_author_id_idx ON public.blogs(author_id);

-- Create an index on created_at for ordering
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON public.blogs(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();