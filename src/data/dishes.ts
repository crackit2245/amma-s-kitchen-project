export interface Dish {
  id: string;
  name: string;
  telugu: string;
  description: string;
  price: number;
  category: 'meals' | 'curries' | 'pickles' | 'tiffins' | 'sweets';
  region: 'andhra' | 'telangana' | 'both';
  type: 'veg' | 'nonveg';
  image: string;
  popular?: boolean;
  ingredients: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
  };
}

export const categories = [
  { id: 'meals', name: 'Meals', telugu: 'భోజనాలు' },
  { id: 'curries', name: 'Curries', telugu: 'కూరలు' },
  { id: 'pickles', name: 'Pickles', telugu: 'ఊరగాయలు' },
  { id: 'tiffins', name: 'Tiffins', telugu: 'టిఫిన్లు' },
  { id: 'sweets', name: 'Sweets', telugu: 'తీపి పదార్థాలు' },
];

export const dishes: Dish[] = [
  {
    id: '1',
    name: 'Special Hyderabadi Biryani',
    telugu: 'స్పెషల్ హైదరాబాద్ బిర్యానీ',
    description: 'Aromatic basmati rice cooked with tender meat and secret spices, layered with love',
    price: 250,
    category: 'meals',
    region: 'both',
    type: 'nonveg',
    image: '/src/assets/biryani.jpg',
    popular: true,
    ingredients: ['Basmati Rice', 'Chicken/Mutton', 'Yogurt', 'Spices', 'Herbs', 'Ghee'],
    nutrition: { calories: 550, protein: '25g', carbs: '60g' },
  },
  {
    id: '2',
    name: 'Crispy Masala Dosa',
    telugu: 'మసాలా దోస',
    description: 'Golden crispy dosa with perfectly spiced potato filling, served with sambar & chutneys',
    price: 80,
    category: 'tiffins',
    region: 'both',
    type: 'veg',
    image: '/src/assets/dosa.jpg',
    popular: true,
    ingredients: ['Rice Batter', 'Urad Dal', 'Potato', 'Onion', 'Spices', 'Curry Leaves'],
    nutrition: { calories: 250, protein: '8g', carbs: '45g' },
  },
  {
    id: '3',
    name: 'Andhra Chicken Curry',
    telugu: 'ఆంధ్ర కోడి కూర',
    description: 'Spicy and tangy Andhra style chicken curry with authentic home-ground masala',
    price: 180,
    category: 'curries',
    region: 'andhra',
    type: 'nonveg',
    image: '/src/assets/chicken-curry.jpg',
    popular: true,
    ingredients: ['Chicken', 'Onion', 'Tomato', 'Red Chili', 'Coriander', 'Garlic', 'Ginger'],
    nutrition: { calories: 320, protein: '30g', carbs: '15g' },
  },
  {
    id: '4',
    name: 'Avakaya Mango Pickle',
    telugu: 'ఆవకాయ',
    description: 'Traditional Andhra style mango pickle with perfect spice balance - just like Amma made',
    price: 150,
    category: 'pickles',
    region: 'andhra',
    type: 'veg',
    image: '/src/assets/pickles.jpg',
    popular: false,
    ingredients: ['Raw Mango', 'Red Chili Powder', 'Mustard', 'Fenugreek', 'Salt', 'Oil'],
    nutrition: { calories: 50, protein: '1g', carbs: '8g' },
  },
  {
    id: '5',
    name: 'Bellam Ariselu',
    telugu: 'బెల్లం అరిసెలు',
    description: 'Sweet rice flour jaggery patties, a traditional festive delicacy made with pure ghee',
    price: 120,
    category: 'sweets',
    region: 'both',
    type: 'veg',
    image: '/src/assets/sweets.jpg',
    popular: false,
    ingredients: ['Rice Flour', 'Jaggery', 'Ghee', 'Cardamom', 'Sesame Seeds'],
    nutrition: { calories: 280, protein: '4g', carbs: '50g' },
  },
  {
    id: '6',
    name: 'Gongura Mutton',
    telugu: 'గోంగూర మటన్',
    description: 'Telangana signature dish - tender mutton cooked with tangy gongura leaves',
    price: 280,
    category: 'curries',
    region: 'telangana',
    type: 'nonveg',
    image: '/src/assets/chicken-curry.jpg',
    popular: true,
    ingredients: ['Mutton', 'Gongura Leaves', 'Onion', 'Garlic', 'Spices', 'Oil'],
    nutrition: { calories: 420, protein: '35g', carbs: '12g' },
  },
  {
    id: '7',
    name: 'Idli Sambar',
    telugu: 'ఇడ్లీ సాంబార్',
    description: 'Soft steamed rice cakes with flavorful vegetable sambar and coconut chutney',
    price: 60,
    category: 'tiffins',
    region: 'both',
    type: 'veg',
    image: '/src/assets/dosa.jpg',
    popular: true,
    ingredients: ['Rice', 'Urad Dal', 'Lentils', 'Vegetables', 'Tamarind', 'Spices'],
    nutrition: { calories: 180, protein: '6g', carbs: '35g' },
  },
  {
    id: '8',
    name: 'Pulihora (Tamarind Rice)',
    telugu: 'పులిహోర',
    description: 'Tangy and flavorful tamarind rice with peanuts and aromatic tempering',
    price: 100,
    category: 'meals',
    region: 'both',
    type: 'veg',
    image: '/src/assets/biryani.jpg',
    popular: false,
    ingredients: ['Rice', 'Tamarind', 'Peanuts', 'Curry Leaves', 'Mustard', 'Turmeric'],
    nutrition: { calories: 350, protein: '8g', carbs: '55g' },
  },
];
