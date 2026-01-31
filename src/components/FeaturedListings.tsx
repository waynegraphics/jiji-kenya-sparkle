import ProductCard from "./ProductCard";

const featuredProducts = [
  {
    id: 1,
    title: "Toyota Corolla 2019 Gray | Cars for sale",
    price: "KSh 1,850,000",
    location: "Nairobi",
    time: "2h ago",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop",
    isFeatured: true,
  },
  {
    id: 2,
    title: "iPhone 14 Pro Max 256GB Deep Purple",
    price: "KSh 145,000",
    location: "Westlands",
    time: "3h ago",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=300&fit=crop",
    isUrgent: true,
  },
  {
    id: 3,
    title: "3 Bedroom Apartment for Rent in Kilimani",
    price: "KSh 85,000/month",
    location: "Kilimani",
    time: "5h ago",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    isFeatured: true,
  },
  {
    id: 4,
    title: "Samsung 55\" Smart TV 4K UHD",
    price: "KSh 48,500",
    location: "Mombasa",
    time: "1d ago",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    title: "Ladies Designer Handbag - Brown Leather",
    price: "KSh 4,500",
    location: "Nairobi CBD",
    time: "4h ago",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    title: "PlayStation 5 Console + 2 Controllers",
    price: "KSh 72,000",
    location: "Karen",
    time: "6h ago",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop",
    isUrgent: true,
  },
  {
    id: 7,
    title: "Office Desk and Chair Set",
    price: "KSh 15,000",
    location: "Thika",
    time: "1d ago",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    title: "German Shepherd Puppies - 3 months",
    price: "KSh 25,000",
    location: "Kiambu",
    time: "8h ago",
    image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop",
    isFeatured: true,
  },
];

const FeaturedListings = () => {
  return (
    <section className="py-8 bg-muted/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Trending Ads
          </h2>
          <button className="text-sm font-semibold text-primary hover:underline">
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;