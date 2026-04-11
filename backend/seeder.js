const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });
connectDB();

const DUMMY_IMAGES = {
  'Electrical Appliances': [
    'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=800',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=800',
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800',
    'https://images.unsplash.com/photo-1585659722983-3a6750f2fd82?q=80&w=800',
  ],
  'Mens Clothing': [
    'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?q=80&w=800',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800',
  ],
  'Womens Clothing': [
    'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?q=80&w=800',
    'https://images.unsplash.com/photo-1583391733958-650fac5dac0c?q=80&w=800',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800',
  ],
  'Staples & Atta': [
    'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800',
    'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800'
  ],
  'Snacks & Biscuits': [
    'https://images.unsplash.com/photo-1585994204558-8549d44c9b9b?w=800',
    'https://images.unsplash.com/photo-1582283994462-ff45b9db062d?w=800'
  ],
  'Beverages': [
    'https://images.unsplash.com/photo-1556740714-a83ea5c8954d?w=800',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800'
  ],
  'Vegetables': [
    'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800',
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800'
  ],
  'Fresh Fruits': [
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800',
    'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800'
  ],
  'Dry Fruits': [
    'https://images.unsplash.com/photo-1593345862890-ceaf59124fb7?w=800',
    'https://images.unsplash.com/photo-1626200419189-39ca17228805?w=800'
  ],
  'Cereals & Pulses': [
    'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800',
    'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=800'
  ],
  'Spices & Masalas': [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
    'https://images.unsplash.com/photo-1599909623512-42173cf52bf6?w=800'
  ],
  'Mobile Phones': [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800',
    'https://images.unsplash.com/photo-1533228100845-08145b01de14?q=80&w=800',
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=800'
  ],
  'Laptops & Computers': [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800',
    'https://images.unsplash.com/photo-1531297172864-45dc60645f30?q=80&w=800',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800'
  ],
  'Beauty & Personal Care': [
    'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?q=80&w=800',
    'https://images.unsplash.com/photo-1615397323289-401569a9b244?q=80&w=800',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800'
  ],
  'Home & Furniture': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800',
    'https://images.unsplash.com/photo-1583847268964-b28ce8f31586?q=80&w=800'
  ],
  'Sports & Fitness': [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800'
  ],
  'Toys & Baby Care': [
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=800',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800',
    'https://images.unsplash.com/photo-1558066551-fb1f38fa09ab?q=80&w=800'
  ],
  'Books & Stationery': [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800'
  ],
  'Automotive': [
    'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?q=80&w=800',
    'https://images.unsplash.com/photo-1552834372-e14b308eabec?q=80&w=800',
    'https://images.unsplash.com/photo-1515569067071-ec3b516ffc7f?q=80&w=800'
  ],
  'Footwear': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800'
  ],
  'Watches & Accessories': [
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800',
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800',
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=800'
  ],
  'Jewellery': [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800',
    'https://images.unsplash.com/photo-1599643478524-fb524b0b14c5?q=80&w=800',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800'
  ]
};

const CATEGORIES = [
  {
    name: "Mobile Phones",
    types: ["Smartphone 5G", "Smartphone 4G", "Gaming Phone", "Camera Phone", "Feature Phone", "Foldable Phone"],
    brands: ["Apple", "Samsung", "Xiaomi", "OnePlus", "Vivo", "Oppo", "Realme", "Micromax", "Lava", "Karbonn", "Motorola", "Nokia", "Poco", "Infinix", "Tecno"],
    priceRange: [1000, 150000]
  },
  {
    name: "Electrical Appliances",
    types: ["Washing Machine", "Fridge", "Smart TV", "Mixer Grinder", "Light Bulb", "Iron Box", "Room Heater", "Induction Stove", "Ceiling Fan", "Split AC"],
    brands: ["Sony", "LG", "Samsung", "Haier", "Whirlpool", "Bosch", "Philips", "Bajaj", "Havells", "Crompton"],
    priceRange: [1500, 85000]
  },
  {
    name: "Laptops & Computers",
    types: ["Gaming Laptop", "Ultrabook", "Business Laptop", "Desktop PC", "Monitor", "Wireless Mouse", "Mechanical Keyboard", "External HDD"],
    brands: ["HP", "Dell", "Lenovo", "Asus", "Acer", "Apple", "MSI", "Logitech", "Seagate", "WD"],
    priceRange: [500, 250000]
  },
  {
    name: "Mens Clothing",
    types: ["Trousers", "Formal Shirt", "Casual Shirt", "Blazer", "Kurta", "Jeans", "T-Shirt", "Jacket", "Sweater"],
    brands: ["Raymond", "Peter England", "Manyavar", "Allen Solly", "Van Heusen", "Levis", "Puma", "Nike", "Adidas", "Wrogn", "Flying Machine"],
    priceRange: [500, 5000]
  },
  {
    name: "Womens Clothing",
    types: ["Lehenga", "Kurti", "Skirt", "Saree", "Western Dress", "Top", "Palazzo", "Gown", "Dupatta", "Jeans"],
    brands: ["Biba", "W", "Aurelia", "FabIndia", "Global Desi", "Zara", "H&M", "Mango", "Libas", "Soch"],
    priceRange: [600, 15000]
  },
  {
    name: "Footwear",
    types: ["Running Shoes", "Sneakers", "Formal Shoes", "Sandals", "Slippers", "Boots", "Heels", "Flats"],
    brands: ["Nike", "Adidas", "Puma", "Reebok", "Bata", "Woodland", "Red Tape", "Sparx", "Crocs", "Skechers"],
    priceRange: [300, 12000]
  },
  {
    name: "Watches & Accessories",
    types: ["Smartwatch", "Analog Watch", "Digital Watch", "Sunglasses", "Wallet", "Belt", "Backpack"],
    brands: ["Titan", "Fastrack", "Casio", "Fossil", "Boat", "Fire-Boltt", "Noise", "Ray-Ban", "Wildcraft", "American Tourister"],
    priceRange: [500, 25000]
  },
  {
    name: "Beauty & Personal Care",
    types: ["Face Wash", "Moisturizer", "Shampoo", "Hair Oil", "Lipstick", "Perfume", "Trimmer", "Hair Dryer"],
    brands: ["Lakme", "L'Oreal", "Mamaearth", "WOW", "Nivea", "Dove", "Philips", "Gillette", "Maybelline", "Plum"],
    priceRange: [150, 4000]
  },
  {
    name: "Staples & Atta",
    types: ["Chakki Fresh Atta", "Basmati Rice", "Toor Dal", "Moong Dal", "Sona Masoori Rice", "Refined Sunflower Oil", "Mustard Oil", "Sugar", "Crystal Salt"],
    brands: ["Aashirvaad", "Fortune", "Tata Sampann", "India Gate", "Kohinoor", "Pillsbury", "Dhara", "Gemini", "Madhur"],
    priceRange: [50, 1500]
  },
  {
    name: "Snacks & Biscuits",
    types: ["Potato Chips", "Namkeen Mix", "Bhujia", "Digestive Biscuits", "Cream Biscuits", "Rusk", "Wafer Rolls"],
    brands: ["Haldiram's", "Parle", "Britannia", "Lay's", "Kurkure", "Sunfeast", "Bikano", "Balaji", "Bingo"],
    priceRange: [20, 400]
  },
  {
    name: "Beverages",
    types: ["Assam Tea", "Green Tea", "Filter Coffee", "Instant Coffee", "Cold Drink", "Mango Juice", "Electrolyte Drink"],
    brands: ["Red Label", "Taj Mahal", "Nescafe", "Bru", "Coca Cola", "Thums Up", "Tropicana", "Real", "Paper Boat"],
    priceRange: [40, 800]
  },
  {
    name: "Vegetables",
    types: ["Onion", "Potato", "Tomato", "Cauliflower", "Lady Finger", "Spinach", "Carrot", "Cabbage"],
    brands: ["Fresh Farms", "Reliance Fresh", "Nature's Basket", "Local Mandi"],
    priceRange: [20, 200]
  },
  {
    name: "Fresh Fruits",
    types: ["Apple", "Banana", "Mango", "Grapes", "Orange", "Pomegranate", "Papaya", "Watermelon"],
    brands: ["Fresh Farms", "Zespri", "Washington", "Kashmir Apples"],
    priceRange: [50, 600]
  },
  {
    name: "Dry Fruits",
    types: ["Almonds", "Cashews", "Pistachios", "Walnuts", "Raisins", "Dates", "Fig", "Mixed Nuts"],
    brands: ["Happilo", "Nutraj", "Tulsi", "Lion", "Farmley"],
    priceRange: [200, 3000]
  },
  {
    name: "Cereals & Pulses",
    types: ["Oats", "Muesli", "Corn Flakes", "Chana Dal", "Urad Dal", "Rajma", "Kabuli Chana"],
    brands: ["Kellogg's", "Quaker", "Bagrry's", "Tata Sampann", "24 Mantra Organic"],
    priceRange: [60, 800]
  },
  {
    name: "Spices & Masalas",
    types: ["Turmeric Powder", "Chilli Powder", "Coriander Powder", "Garam Masala", "Chicken Masala", "Biryani Masala", "Cumin Seeds"],
    brands: ["Everest", "MDH", "Catch", "MTR", "Eastern", "Aashirvaad"],
    priceRange: [30, 500]
  },
  {
    name: "Home & Furniture",
    types: ["Bedsheet", "Curtains", "Sofa Set", "Dining Table", "Study Desk", "Office Chair", "Wall Clock", "Vase"],
    brands: ["Bombay Dyeing", "Spaces", "Godrej Interio", "IKEA", "Wakefit", "Pepperfry", "Home Centre", "Nilkamal", "Cello"],
    priceRange: [300, 55000]
  },
  {
    name: "Sports & Fitness",
    types: ["Cricket Bat", "Football", "Badminton Racket", "Yoga Mat", "Dumbbells", "Resistance Bands", "Treadmill"],
    brands: ["SG", "SS", "Nivia", "Cosco", "Yonex", "Decathlon", "Cultsport", "Strauss", "Lifelong"],
    priceRange: [200, 45000]
  },
  {
    name: "Toys & Baby Care",
    types: ["Action Figure", "Board Game", "Puzzle", "Soft Toy", "Diapers", "Baby Wipes", "Baby Lotion", "Stroller"],
    brands: ["Lego", "Funskool", "Mattel", "Hasbro", "Hot Wheels", "Pampers", "Huggies", "Johnson's", "Sebamed", "LuvLap"],
    priceRange: [100, 8000]
  },
  {
    name: "Books & Stationery",
    types: ["Fiction Novel", "Educational Book", "Notebooks", "Pen Set", "Markers", "Geometry Box", "Calculator"],
    brands: ["Penguin", "HarperCollins", "Arihant", "Classmate", "Reynolds", "Parker", "Faber-Castell", "Cello", "Casio"],
    priceRange: [50, 2500]
  },
  {
    name: "Automotive",
    types: ["Engine Oil", "Car Polish", "Helmet", "Bike Cover", "Car Perfume", "Dash Cam", "Tyre Inflator"],
    brands: ["Castrol", "Motul", "3M", "Turtle Wax", "Studds", "Vega", "Steelbird", "Ambi Pur", "70mai", "Michelin"],
    priceRange: [200, 15000]
  },
  {
    name: "Jewellery",
    types: ["Gold Chain", "Diamond Ring", "Silver Anklet", "Platinum Band", "Pearl Necklace", "Earrings", "Bangles"],
    brands: ["Tanishq", "Kalyan Jewellers", "Malabar Gold", "PC Jeweller", "Joyalukkas", "CaratLane", "BlueStone"],
    priceRange: [2000, 500000]
  }
];

const generateProducts = (adminUser) => {
  const products = [];
  
  const groceryCats = ['Staples & Atta', 'Snacks & Biscuits', 'Beverages', 'Vegetables', 'Fresh Fruits', 'Dry Fruits', 'Cereals & Pulses', 'Spices & Masalas', 'Beauty & Personal Care'];
  
  CATEGORIES.forEach(category => {
    // Generate 15 for groceries, 35 for others
    const limit = 10;
    for (let i = 0; i < limit; i++) {
      const type = category.types[Math.floor(Math.random() * category.types.length)];
      const brand = category.brands[Math.floor(Math.random() * category.brands.length)];
      
      const getKeywords = (catName) => {
          let kw = 'shopping';
          if (catName.includes('Mobile')) kw = 'smartphone,iphone';
          if (catName.includes('Laptop')) kw = 'laptop,macbook,computer';
          if (catName.includes('Electrical')) kw = 'homeappliance,electronic';
          if (catName.includes('Womens Clothing')) kw = 'fashion,dress,girl';
          if (catName.includes('Mens Clothing')) kw = 'mensfashion,suit,shirt';
          if (catName.includes('Footwear')) kw = 'shoes,sneakers,running';
          if (catName.includes('Watches') || catName.includes('Jewellery')) kw = 'jewelry,smartwatch,watch';
          if (catName.includes('Beauty')) kw = 'cosmetics,makeup,skincare';
          if (catName.includes('Groceries') || catName.includes('Staples')) kw = 'spices,grains,pantry';
          if (catName.includes('Fruits') || catName.includes('Vegetables')) kw = 'freshfruit,vegetables';
          if (catName.includes('Home')) kw = 'homedecor,furniture,sofa';
          if (catName.includes('Toys')) kw = 'toys,baby,lego';
          if (catName.includes('Automotive')) kw = 'caraccessories,helmet,car';
          return encodeURIComponent(kw);
      };

      const kw = getKeywords(category.name);
      const seedVal = Math.floor(Math.random() * 100000);
      const baseImages = [
        `https://loremflickr.com/800/800/${kw}/all?lock=${seedVal}`,
        `https://loremflickr.com/800/800/${kw}/all?lock=${seedVal + 1}`,
        `https://loremflickr.com/800/800/${kw}/all?lock=${seedVal + 2}`
      ];
      
      const price = Math.floor(Math.random() * (category.priceRange[1] - category.priceRange[0])) + category.priceRange[0];
      const rating = (Math.random() * 2 + 3).toFixed(1);
      const discount = Math.floor(Math.random() * 30) + 5; // 5% to 35%
      
      let description = `Premium quality ${type} from ${brand}. `;
      let specs = {};
      
      if (category.name === 'Mobile Phones') {
        description += `Experience the next generation of mobile computing with this flagship-grade device from ${brand}. Features an ultra-smooth display, massive battery life, and unparalleled camera capabilities perfect for the Indian consumer. Capture every moment in stunning detail.`;
        specs = { RAM: `${[4, 6, 8, 12][Math.floor(Math.random()*4)]}GB`, Storage: `${[64, 128, 256, 512][Math.floor(Math.random()*4)]}GB`, Battery: `${Math.floor(Math.random()*2000)+4000}mAh`, Display: 'AMOLED/IPS' };
      } else if (category.name === 'Laptops & Computers') {
        description += `Boost your productivity and gaming with this beast. Powered by the latest processors and graphics, this ${brand} machine delivers uncompromised performance inside a sleek chassis.`;
        specs = { Processor: 'Intel i5/i7 or AMD Ryzen 5/7', RAM: '8GB/16GB', SSD: '512GB/1TB' };
      } else if (category.name === 'Electrical Appliances') {
        description += `Experience cutting-edge technology designed specifically for Indian homes. This appliance offers exceptional energy efficiency, durable build quality, and superior performance. Features advanced safety mechanisms and a long warranty period.`;
        specs = { Voltage: '220-240V', Power: `${Math.floor(Math.random()*2000)+100}W`, Warranty: `${Math.floor(Math.random()*4)+1} Years` };
      } else if (category.name.includes('Clothing') || category.name === 'Footwear') {
        description += `Stay trendy and comfortable with this exquisite piece. Made from ultra-premium materials tailored perfectly for the vibrant Indian climate. Carefully stitched and tested to ensure durability while making you look an absolute stunner.`;
        specs = { Material: 'Premium Blend', Fit: 'Regular/Slim', Style: 'Modern Indian' };
      } else if (category.name === 'Groceries' || category.name === 'Beauty & Personal Care') {
        description += `Sourced directly from the finest manufacturers. High quality, safe, and strictly tested for your family's daily use. Freshness and purity guaranteed.`;
        specs = { Weight: 'Standard', Safety: '100% Tested', Expiry: '12-24 Months' };
      } else {
        description += `Enhance your lifestyle with this top-tier product from ${brand}. Built with precision, focusing on quality and longevity. A must-have addition to your collection.`;
        specs = { Quality: 'Premium', Warranty: '1 Year Manufacturer', Category: category.name };
      }

      products.push({
        name: `${brand} ${type} - Premium Edition`,
        image: baseImages[0], 
        images: baseImages,
        brand,
        category: category.name,
        description,
        specs,
        price,
        discount,
        countInStock: Math.floor(Math.random() * 100) + 10,
        rating: Number(rating),
        numReviews: Math.floor(Math.random() * 500) + 10,
        user: adminUser
      });
    }
  });
  return products;
};

const seedData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    const adminUserDoc = await User.create({ 
      name: 'ShopBasket Admin', 
      email: 'admin@shopbasket.com', 
      password: 'password123', 
      isAdmin: true,
      walletBalance: 10000,
      rewardCoins: 5000
    });
    
    await User.create({ 
      name: 'Indian Customer', 
      email: 'user@shopbasket.com', 
      password: 'password123', 
      isAdmin: false,
      walletBalance: 2500,
      rewardCoins: 450,
      addresses: [{ street: '123 MG Road', city: 'Bengaluru', postalCode: '560001', country: 'India' }]
    });

    const products = generateProducts(adminUserDoc._id);

    await Product.insertMany(products);
    console.log(`Massive Data Import Complete: ${products.length} Products Injected!`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
