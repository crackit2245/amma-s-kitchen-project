import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, Soup, Salad, Coffee, Cake } from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    telugu: string;
  };
}

const categoryIcons: Record<string, React.ReactNode> = {
  meals: <UtensilsCrossed className="h-8 w-8" />,
  curries: <Soup className="h-8 w-8" />,
  pickles: <Salad className="h-8 w-8" />,
  tiffins: <Coffee className="h-8 w-8" />,
  sweets: <Cake className="h-8 w-8" />,
};

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link to={`/menu?category=${category.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-card to-secondary">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className="text-primary">{categoryIcons[category.id]}</div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.telugu}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
