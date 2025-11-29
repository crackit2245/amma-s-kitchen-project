import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DishCard from '@/components/DishCard';
import { categories } from '@/data/dishes';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MenuItem {
  id: string;
  name: string;
  telugu: string | null;
  description: string | null;
  price: number;
  category: string;
  region: string;
  type: string;
  image_url: string | null;
  ingredients: string[];
  nutrition: { calories: number; protein: string; carbs: string } | null;
  is_available: boolean;
  is_popular: boolean;
}

// Transform database item to dish format for DishCard
const transformToDish = (item: MenuItem) => ({
  id: item.id,
  name: item.name,
  telugu: item.telugu || '',
  description: item.description || '',
  price: item.price,
  category: item.category as 'meals' | 'curries' | 'pickles' | 'tiffins' | 'sweets',
  region: item.region as 'andhra' | 'telangana' | 'both',
  type: item.type as 'veg' | 'nonveg',
  image: item.image_url || '/placeholder.svg',
  popular: item.is_popular,
  ingredients: item.ingredients || [],
  nutrition: item.nutrition || { calories: 0, protein: '0g', carbs: '0g' },
});

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching menu items:', error);
    } else {
      const items = (data || []).map(item => ({
        ...item,
        ingredients: Array.isArray(item.ingredients) ? (item.ingredients as string[]) : [],
        nutrition: item.nutrition as MenuItem['nutrition'],
      }));
      setMenuItems(items);
    }
    setLoading(false);
  };

  const filteredDishes = menuItems.filter((item) => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const regionMatch = selectedRegion === 'all' || item.region === selectedRegion || item.region === 'both';
    const typeMatch = selectedType === 'all' || item.type === selectedType;
    const searchMatch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.telugu && item.telugu.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && regionMatch && typeMatch && searchMatch;
  });

  const sortedDishes = [...filteredDishes].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popular':
      default:
        return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Our Menu</h1>
          <p className="text-xl text-muted-foreground">మా మెనూ - Traditional Telugu Delicacies</p>
        </div>

        {/* Search & Sort */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-6">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Category</h3>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id}>
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Region & Type Filters */}
          <div className="flex flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Region</h3>
              <div className="flex gap-2">
                <Button
                  variant={selectedRegion === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedRegion('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={selectedRegion === 'andhra' ? 'default' : 'outline'}
                  onClick={() => setSelectedRegion('andhra')}
                  size="sm"
                >
                  Andhra
                </Button>
                <Button
                  variant={selectedRegion === 'telangana' ? 'default' : 'outline'}
                  onClick={() => setSelectedRegion('telangana')}
                  size="sm"
                >
                  Telangana
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Food Type</h3>
              <div className="flex gap-2">
                <Button
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={selectedType === 'veg' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('veg')}
                  size="sm"
                >
                  Veg
                </Button>
                <Button
                  variant={selectedType === 'nonveg' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('nonveg')}
                  size="sm"
                >
                  Non-Veg
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dishes Grid */}
        {sortedDishes.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {sortedDishes.length} dish{sortedDishes.length !== 1 ? 'es' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedDishes.map((item) => (
                <DishCard key={item.id} dish={transformToDish(item)} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">No dishes found</p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedRegion('all');
              setSelectedType('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;