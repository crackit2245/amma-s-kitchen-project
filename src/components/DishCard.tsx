import { Link } from 'react-router-dom';
import { Dish } from '@/data/dishes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Leaf, Drumstick } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface DishCardProps {
  dish: Dish;
}

const DishCard = ({ dish }: DishCardProps) => {
  const { addToCart } = useCart();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link to={`/dish/${dish.id}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
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
          {dish.popular && (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
              Popular
            </Badge>
          )}
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
