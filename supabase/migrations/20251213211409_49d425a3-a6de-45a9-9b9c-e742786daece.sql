-- Create table for shared moisture meter reading links
CREATE TABLE public.shared_moisture_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reading_id UUID NOT NULL REFERENCES public.moisture_meter_readings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_moisture_links ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own shared moisture links" 
ON public.shared_moisture_links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shared moisture links" 
ON public.shared_moisture_links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared moisture links" 
ON public.shared_moisture_links 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared moisture links" 
ON public.shared_moisture_links 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow public access to active shared links (for guests to view)
CREATE POLICY "Anyone can view active shared moisture links by token" 
ON public.shared_moisture_links 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shared_moisture_links_updated_at
BEFORE UPDATE ON public.shared_moisture_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_shared_moisture_links_share_token ON public.shared_moisture_links(share_token);
CREATE INDEX idx_shared_moisture_links_user_id ON public.shared_moisture_links(user_id);
CREATE INDEX idx_shared_moisture_links_reading_id ON public.shared_moisture_links(reading_id);