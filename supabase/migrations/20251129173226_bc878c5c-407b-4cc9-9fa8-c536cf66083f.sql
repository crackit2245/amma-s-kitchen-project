-- Create menu_items table for admin management
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  telugu TEXT,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('meals', 'curries', 'pickles', 'tiffins', 'sweets')),
  region TEXT NOT NULL CHECK (region IN ('andhra', 'telangana', 'both')),
  type TEXT NOT NULL CHECK (type IN ('veg', 'nonveg')),
  image_url TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  nutrition JSONB,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view available menu items
CREATE POLICY "Anyone can view menu items"
ON public.menu_items
FOR SELECT
USING (true);

-- Only admins can insert menu items
CREATE POLICY "Admins can insert menu items"
ON public.menu_items
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update menu items
CREATE POLICY "Admins can update menu items"
ON public.menu_items
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete menu items
CREATE POLICY "Admins can delete menu items"
ON public.menu_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial menu data from existing dishes
INSERT INTO public.menu_items (id, name, telugu, description, price, category, region, type, image_url, ingredients, nutrition, is_popular)
VALUES
  (gen_random_uuid(), 'Special Hyderabadi Biryani', 'స్పెషల్ హైదరాబాద్ బిర్యానీ', 'Aromatic basmati rice cooked with tender meat and secret spices, layered with love', 250, 'meals', 'both', 'nonveg', '/src/assets/biryani.jpg', '["Basmati Rice", "Chicken/Mutton", "Yogurt", "Spices", "Herbs", "Ghee"]'::jsonb, '{"calories": 550, "protein": "25g", "carbs": "60g"}'::jsonb, true),
  (gen_random_uuid(), 'Crispy Masala Dosa', 'మసాలా దోస', 'Golden crispy dosa with perfectly spiced potato filling, served with sambar & chutneys', 80, 'tiffins', 'both', 'veg', '/src/assets/dosa.jpg', '["Rice Batter", "Urad Dal", "Potato", "Onion", "Spices", "Curry Leaves"]'::jsonb, '{"calories": 250, "protein": "8g", "carbs": "45g"}'::jsonb, true),
  (gen_random_uuid(), 'Andhra Chicken Curry', 'ఆంధ్ర కోడి కూర', 'Spicy and tangy Andhra style chicken curry with authentic home-ground masala', 180, 'curries', 'andhra', 'nonveg', '/src/assets/chicken-curry.jpg', '["Chicken", "Onion", "Tomato", "Red Chili", "Coriander", "Garlic", "Ginger"]'::jsonb, '{"calories": 320, "protein": "30g", "carbs": "15g"}'::jsonb, true),
  (gen_random_uuid(), 'Avakaya Mango Pickle', 'ఆవకాయ', 'Traditional Andhra style mango pickle with perfect spice balance - just like Amma made', 150, 'pickles', 'andhra', 'veg', '/src/assets/pickles.jpg', '["Raw Mango", "Red Chili Powder", "Mustard", "Fenugreek", "Salt", "Oil"]'::jsonb, '{"calories": 50, "protein": "1g", "carbs": "8g"}'::jsonb, false),
  (gen_random_uuid(), 'Bellam Ariselu', 'బెల్లం అరిసెలు', 'Sweet rice flour jaggery patties, a traditional festive delicacy made with pure ghee', 120, 'sweets', 'both', 'veg', '/src/assets/sweets.jpg', '["Rice Flour", "Jaggery", "Ghee", "Cardamom", "Sesame Seeds"]'::jsonb, '{"calories": 280, "protein": "4g", "carbs": "50g"}'::jsonb, false),
  (gen_random_uuid(), 'Gongura Mutton', 'గోంగూర మటన్', 'Telangana signature dish - tender mutton cooked with tangy gongura leaves', 280, 'curries', 'telangana', 'nonveg', '/src/assets/chicken-curry.jpg', '["Mutton", "Gongura Leaves", "Onion", "Garlic", "Spices", "Oil"]'::jsonb, '{"calories": 420, "protein": "35g", "carbs": "12g"}'::jsonb, true),
  (gen_random_uuid(), 'Idli Sambar', 'ఇడ్లీ సాంబార్', 'Soft steamed rice cakes with flavorful vegetable sambar and coconut chutney', 60, 'tiffins', 'both', 'veg', '/src/assets/dosa.jpg', '["Rice", "Urad Dal", "Lentils", "Vegetables", "Tamarind", "Spices"]'::jsonb, '{"calories": 180, "protein": "6g", "carbs": "35g"}'::jsonb, true),
  (gen_random_uuid(), 'Pulihora (Tamarind Rice)', 'పులిహోర', 'Tangy and flavorful tamarind rice with peanuts and aromatic tempering', 100, 'meals', 'both', 'veg', '/src/assets/biryani.jpg', '["Rice", "Tamarind", "Peanuts", "Curry Leaves", "Mustard", "Turmeric"]'::jsonb, '{"calories": 350, "protein": "8g", "carbs": "55g"}'::jsonb, false);