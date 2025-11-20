import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, ChefHat, Clock } from 'lucide-react';
import CategoryCard from '@/components/CategoryCard';
import DishCard from '@/components/DishCard';
import { categories, dishes } from '@/data/dishes';
import heroImage from '@/assets/hero-cooking.jpg';

const Home = () => {
  const popularDishes = dishes.filter((dish) => dish.popular);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroImage})`,
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
            అమ్మ ఇంటి వంటలు
          </h1>
          <p className="text-2xl md:text-3xl mb-6 font-medium">ఇంటి రుచి… ప్రతి ముద్దలో ప్రేమ</p>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Home taste... Love in every bite
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/menu">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Order Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="#story">
              <Button
                size="lg"
                variant="outline"
                className="bg-background/90 hover:bg-background text-foreground"
              >
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3 text-foreground">Our Menu</h2>
            <p className="text-muted-foreground">Explore traditional Telugu delicacies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3 text-foreground">Most Loved Dishes</h2>
            <p className="text-muted-foreground">Customer favorites made with love</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/menu">
              <Button variant="outline" size="lg">
                View Full Menu <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-3 text-foreground">Our Story</h2>
              <p className="text-xl text-primary font-medium">Made with Love, Served with Care</p>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed mb-6">
                "Amma Inti Vantalu" was born from the simple truth that nothing in the world tastes
                like a mother's cooking. Every dish we make carries that same love, warmth, and
                homely comfort.
              </p>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                From fresh ingredients to slow cooking, we bring back the forgotten flavors of our
                own Telugu homes. Each curry is seasoned with care, each biryani layered with
                tradition, and each pickle prepared with patience.
              </p>
              <p className="text-lg text-foreground leading-relaxed">
                For students, working professionals, families, and anyone missing home — our kitchen
                is your home away from home.
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Made with Love</h3>
                <p className="text-muted-foreground">Every dish prepared with mother's care</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Authentic Recipes</h3>
                <p className="text-muted-foreground">Traditional Telugu home cooking</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Fresh Daily</h3>
                <p className="text-muted-foreground">Prepared fresh every single day</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Craving Home Food?</h2>
          <p className="text-xl mb-8">Order now and taste the love in every bite</p>
          <Link to="/menu">
            <Button
              size="lg"
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
            >
              Order Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
