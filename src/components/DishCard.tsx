import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dish } from '@/data/dishes';
import { ShoppingCart, Heart, Leaf, Drumstick } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface DishCardProps {
  dish: Dish;
}

const DishCard = ({ dish }: DishCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavorite();
    } else {
      setIsFavorite(false);
    }
  }, [user, dish.id]);

  const checkFavorite = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('dish_id', dish.id)
      .eq('user_id', user.id)
      .maybeSingle();
    setIsFavorite(!!data);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('dish_id', dish.id);
      setIsFavorite(false);
      toast({
        title: "Removed from favorites",
        description: `${dish.name} removed from your favorites`,
      });
    } else {
      await supabase
        .from('favorites')
        .insert([{ user_id: user.id, dish_id: dish.id }]);
      setIsFavorite(true);
      toast({
        title: "Added to favorites! ❤️",
        description: `${dish.name} added to your favorites`,
      });
    }
    setLoading(false);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link to={`/dish/${dish.id}`}>
        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 hover:bg-background"
            onClick={toggleFavorite}
            disabled={loading}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          {dish.popular && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
              Popular
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <Link to={`/dish/${dish.id}`}>
              <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors line-clamp-1">
                {dish.name}
              </h3>
              <p className="text-sm text-muted-foreground">{dish.telugu}</p>
            </Link>
          </div>
          <Badge variant={dish.type === 'veg' ? 'secondary' : 'destructive'} className="shrink-0">
            {dish.type === 'veg' ? (
              <Leaf className="h-3 w-3" />
            ) : (
              <Drumstick className="h-3 w-3" />
            )}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{dish.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{dish.price}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => addToCart(dish)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DishCard;
