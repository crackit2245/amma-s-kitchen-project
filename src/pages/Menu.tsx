import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DishCard from '@/components/DishCard';
import { dishes, categories } from '@/data/dishes';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const filteredDishes = dishes.filter((dish) => {
    const categoryMatch = selectedCategory === 'all' || dish.category === selectedCategory;
    const regionMatch = selectedRegion === 'all' || dish.region === selectedRegion || dish.region === 'both';
    const typeMatch = selectedType === 'all' || dish.type === selectedType;
    return categoryMatch && regionMatch && typeMatch;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Our Menu</h1>
          <p className="text-xl text-muted-foreground">మా మెనూ - Traditional Telugu Delicacies</p>
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
        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No dishes found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
