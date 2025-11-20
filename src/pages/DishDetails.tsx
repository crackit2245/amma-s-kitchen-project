import { useParams, Link, useNavigate } from 'react-router-dom';
import { dishes } from '@/data/dishes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Leaf, Drumstick, Flame } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const DishDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const dish = dishes.find((d) => d.id === id);

  if (!dish) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Dish not found</h2>
          <Link to="/menu">
            <Button>Back to Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(dish);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-foreground">{dish.name}</h1>
                <p className="text-2xl text-muted-foreground">{dish.telugu}</p>
              </div>
              <Badge variant={dish.type === 'veg' ? 'secondary' : 'destructive'} className="text-base p-2">
                {dish.type === 'veg' ? (
                  <Leaf className="h-5 w-5" />
                ) : (
                  <Drumstick className="h-5 w-5" />
                )}
              </Badge>
            </div>

            {dish.popular && (
              <Badge variant="outline" className="mb-4 bg-accent/10 text-accent border-accent">
                Popular Choice
              </Badge>
            )}

            <p className="text-lg text-muted-foreground mb-6">{dish.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary">₹{dish.price}</span>
            </div>

            <div className="flex gap-4 mb-8">
              <Button size="lg" onClick={handleAddToCart} className="flex-1 bg-primary hover:bg-primary/90">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Link to="/menu" className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Ingredients */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 text-foreground">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {dish.ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nutrition */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center text-foreground">
                  <Flame className="h-5 w-5 mr-2 text-accent" />
                  Nutritional Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-lg font-semibold text-foreground">{dish.nutrition.calories}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="text-lg font-semibold text-foreground">{dish.nutrition.protein}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="text-lg font-semibold text-foreground">{dish.nutrition.carbs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishDetails;
