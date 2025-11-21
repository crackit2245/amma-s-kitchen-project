import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { dishes } from '@/data/dishes';
import DishCard from '@/components/DishCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

const Favorites = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: { pathname: '/favorites' } } });
    } else if (user) {
      fetchFavorites();
    }
  }, [user, authLoading, navigate]);

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('dish_id');

    if (error) {
      console.error('Error fetching favorites:', error);
    } else {
      setFavorites(data?.map(f => f.dish_id) || []);
    }
    setLoading(false);
  };

  const favoriteDishes = dishes.filter(dish => favorites.includes(dish.id));

  const handleAddAllToCart = () => {
    favoriteDishes.forEach(dish => {
      addToCart(dish);
    });
    toast({
      title: "Added to Cart! 🛒",
      description: `${favoriteDishes.length} items added to your cart`,
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading favorites...</p>
      </div>
    );
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
