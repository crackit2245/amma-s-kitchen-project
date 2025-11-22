-- Create delivery areas table
CREATE TABLE public.delivery_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode TEXT NOT NULL UNIQUE,
  area_name TEXT NOT NULL,
  city TEXT NOT NULL,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  estimated_delivery_minutes INTEGER NOT NULL DEFAULT 45,
  is_serviceable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read delivery areas (public info)
CREATE POLICY "Anyone can view delivery areas"
ON public.delivery_areas
FOR SELECT
USING (true);

-- Only admins can manage delivery areas
CREATE POLICY "Admins can insert delivery areas"
ON public.delivery_areas
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update delivery areas"
ON public.delivery_areas
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete delivery areas"
ON public.delivery_areas
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_delivery_areas_updated_at
BEFORE UPDATE ON public.delivery_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample delivery areas
INSERT INTO public.delivery_areas (pincode, area_name, city, delivery_fee, estimated_delivery_minutes, is_serviceable) VALUES
('500001', 'Abids', 'Hyderabad', 30, 30, true),
('500002', 'Kachiguda', 'Hyderabad', 30, 35, true),
('500003', 'Malakpet', 'Hyderabad', 40, 40, true),
('500004', 'Sultan Bazaar', 'Hyderabad', 30, 30, true),
('500016', 'Gachibowli', 'Hyderabad', 50, 45, true),
('500032', 'Jubilee Hills', 'Hyderabad', 40, 40, true),
('500033', 'Somajiguda', 'Hyderabad', 35, 35, true),
('500034', 'Ameerpet', 'Hyderabad', 35, 35, true),
('500035', 'Kukatpally', 'Hyderabad', 50, 50, true),
('500081', 'Madhapur', 'Hyderabad', 45, 45, true),
('999999', 'Non-serviceable Area', 'Unknown', 0, 0, false);