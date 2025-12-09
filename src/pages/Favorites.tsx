import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DishCard, { DishItem } from '@/components/DishCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const FavoritesSkeleton = () => (
  <div className="min-h-screen py-8">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const Favorites = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [favoriteDishes, setFavoriteDishes] = useState<DishItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    
    // First get favorite dish_ids for the user
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('dish_id');

    if (favoritesError) {
      console.error('Error fetching favorites:', favoritesError);
      setLoading(false);
      return;
    }

    if (!favoritesData || favoritesData.length === 0) {
      setFavoriteDishes([]);
      setLoading(false);
      return;
    }

    const dishIds = favoritesData.map(f => f.dish_id);

    // Fetch menu items that match the favorite dish_ids
    const { data: menuData, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .in('id', dishIds);

    if (menuError) {
      console.error('Error fetching menu items:', menuError);
      setFavoriteDishes([]);
    } else {
      const items: DishItem[] = (menuData || []).map(item => ({
        id: item.id,
        name: item.name,
        telugu: item.telugu,
        description: item.description,
        price: item.price,
        category: item.category,
        region: item.region,
        type: item.type,
        image_url: item.image_url,
        is_popular: item.is_popular,
        is_available: item.is_available,
        ingredients: Array.isArray(item.ingredients) ? (item.ingredients as string[]) : [],
        nutrition: item.nutrition as DishItem['nutrition'],
      }));
      setFavoriteDishes(items);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: { pathname: '/favorites' } } });
      return;
    }
    
    if (user) {
      fetchFavorites();
    }
  }, [user, authLoading, navigate, fetchFavorites]);

  const handleAddAllToCart = () => {
    favoriteDishes.forEach(dish => {
      addToCart(dish);
    });
    toast({
      title: "Added to Cart!",
      description: `${favoriteDishes.length} items added to your cart`,
    });
  };

  if (authLoading || loading) {
    return <FavoritesSkeleton />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">My Favorites</h1>
          {favoriteDishes.length > 0 && (
            <Button onClick={handleAddAllToCart}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add All to Cart
            </Button>
          )}
        </div>

        {favoriteDishes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl mb-4">No favorites yet</p>
              <p className="text-muted-foreground mb-6">Start adding dishes you love!</p>
              <Button onClick={() => navigate('/menu')}>
                Browse Menu
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
