import {
  Bed, Bath, Car, Building2, MapPin, Calendar, Fuel, Gauge, Settings,
  School, Church, Hospital, ShoppingBag, UtensilsCrossed, Building,
  Train, Dumbbell, Waves, TreePine, Shield, Wifi, Tv, Wind, Flame,
  Home, Factory, Briefcase, Store, Warehouse, Key, Lock, Camera,
  Radio, Music, Gamepad2, Coffee, Utensils, Droplets, Sun, Moon,
  Snowflake, Fan, Lightbulb, Plug, Battery, Zap, Navigation, ParkingCircle,
  Users, Baby, Dog, Cat, PawPrint, Heart as HeartIcon, Star, Award,
  CheckCircle2, XCircle, AlertCircle, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureItem {
  key: string;
  label: string;
  value: any;
  icon: React.ComponentType<{ className?: string }>;
  category?: 'property' | 'vehicle' | 'general';
}

interface PremiumFeatureDisplayProps {
  categoryDetails: Record<string, any>;
  categorySlug?: string;
  className?: string;
}

// Icon mappings for different features
const getFeatureIcon = (key: string, value: any, categorySlug?: string): React.ComponentType<{ className?: string }> | null => {
  const keyLower = key.toLowerCase();
  
  // Property-specific icons
  if (categorySlug === 'property') {
    if (keyLower.includes('bedroom')) return Bed;
    if (keyLower.includes('bathroom')) return Bath;
    if (keyLower.includes('parking')) return ParkingCircle;
    if (keyLower.includes('furnished') || keyLower.includes('furnishing')) return Home;
    if (keyLower.includes('floor')) return Building2;
    if (keyLower.includes('size') || keyLower.includes('sqm')) return MapPin;
    if (keyLower.includes('year')) return Calendar;
    if (keyLower.includes('amenities')) {
      if (Array.isArray(value)) {
        const amenities = value.map((v: string) => v.toLowerCase());
        if (amenities.some((a: string) => a.includes('pool'))) return Waves;
        if (amenities.some((a: string) => a.includes('gym'))) return Dumbbell;
        if (amenities.some((a: string) => a.includes('security'))) return Shield;
        if (amenities.some((a: string) => a.includes('wifi') || a.includes('internet'))) return Wifi;
        if (amenities.some((a: string) => a.includes('tv') || a.includes('cable'))) return Tv;
        if (amenities.some((a: string) => a.includes('ac') || a.includes('air'))) return Wind;
        if (amenities.some((a: string) => a.includes('fireplace'))) return Flame;
        if (amenities.some((a: string) => a.includes('garden'))) return TreePine;
      }
      return Home;
    }
    if (keyLower.includes('nearby') || keyLower.includes('facilities')) {
      if (Array.isArray(value)) {
        const facilities = value.map((v: string) => v.toLowerCase());
        if (facilities.some((f: string) => f.includes('school'))) return School;
        if (facilities.some((f: string) => f.includes('church'))) return Church;
        if (facilities.some((f: string) => f.includes('hospital'))) return Hospital;
        if (facilities.some((f: string) => f.includes('mall') || f.includes('shopping'))) return ShoppingBag;
        if (facilities.some((f: string) => f.includes('restaurant'))) return UtensilsCrossed;
        if (facilities.some((f: string) => f.includes('bank'))) return Building;
        if (facilities.some((f: string) => f.includes('transport') || f.includes('bus'))) return Train;
        if (facilities.some((f: string) => f.includes('gym'))) return Dumbbell;
        if (facilities.some((f: string) => f.includes('beach'))) return Waves;
      }
      return MapPin;
    }
    if (keyLower.includes('property_type')) {
      const type = String(value).toLowerCase();
      if (type.includes('apartment') || type.includes('flat')) return Building2;
      if (type.includes('house')) return Home;
      if (type.includes('office')) return Briefcase;
      if (type.includes('shop') || type.includes('retail')) return Store;
      if (type.includes('warehouse')) return Warehouse;
      if (type.includes('commercial')) return Factory;
      if (type.includes('room')) return Key;
      return Home;
    }
    if (keyLower.includes('listing_type')) {
      const type = String(value).toLowerCase();
      if (type.includes('rent')) return Key;
      if (type.includes('sale')) return Home;
      return Home;
    }
  }

  // Vehicle-specific icons
  if (categorySlug === 'vehicles') {
    if (keyLower.includes('make') || keyLower.includes('model')) return Car;
    if (keyLower.includes('year')) return Calendar;
    if (keyLower.includes('mileage') || keyLower.includes('km')) return Gauge;
    if (keyLower.includes('fuel') || keyLower.includes('engine')) return Fuel;
    if (keyLower.includes('transmission')) return Settings;
    if (keyLower.includes('color')) return Car;
    if (keyLower.includes('body') || keyLower.includes('type')) return Car;
    if (keyLower.includes('condition')) return Award;
    if (keyLower.includes('drivetrain') || keyLower.includes('drive')) return Car;
    if (keyLower.includes('features') || keyLower.includes('key_features')) {
      if (Array.isArray(value)) {
        const features = value.map((v: string) => v.toLowerCase());
        if (features.some((f: string) => f.includes('ac') || f.includes('air'))) return Wind;
        if (features.some((f: string) => f.includes('navigation') || f.includes('gps'))) return Navigation;
        if (features.some((f: string) => f.includes('camera') || f.includes('backup'))) return Camera;
        if (features.some((f: string) => f.includes('bluetooth') || f.includes('audio'))) return Radio;
        if (features.some((f: string) => f.includes('sunroof'))) return Sun;
        if (features.some((f: string) => f.includes('leather'))) return Award;
      }
      return Star;
    }
  }

  // General icons
  if (keyLower.includes('condition')) return Award;
  if (keyLower.includes('brand')) return Star;
  if (keyLower.includes('color') || keyLower.includes('colour')) return Droplets;
  if (keyLower.includes('size')) return MapPin;
  if (keyLower.includes('weight')) return Gauge;
  if (keyLower.includes('warranty')) return Shield;
  if (keyLower.includes('delivery')) return Car;
  if (keyLower.includes('payment')) return CreditCard;

  return null;
};

const formatFeatureLabel = (key: string): string => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Sqm/g, "Sq m")
    .replace(/Km/g, "km");
};

const formatFeatureValue = (key: string, value: any): string => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    if (value.length <= 3) return value.join(", ");
    return `${value.slice(0, 3).join(", ")} +${value.length - 3} more`;
  }
  if (typeof value === "number") {
    if (key.toLowerCase().includes("price") || key.toLowerCase().includes("fee") || key.toLowerCase().includes("charge")) {
      return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(value);
    }
    if (key.toLowerCase().includes("sqm") || key.toLowerCase().includes("size")) {
      return `${value.toLocaleString()} sq m`;
    }
    if (key.toLowerCase().includes("km") || key.toLowerCase().includes("mileage")) {
      return `${value.toLocaleString()} km`;
    }
    return value.toLocaleString();
  }
  return String(value);
};

export const PremiumFeatureDisplay = ({ categoryDetails, categorySlug, className }: PremiumFeatureDisplayProps) => {
  if (!categoryDetails || Object.keys(categoryDetails).length === 0) return null;

  // Filter out empty/null values and system fields
  const details = { ...categoryDetails };
  delete details.id;
  delete details.created_at;
  delete details.updated_at;

  const features: FeatureItem[] = Object.entries(details)
    .filter(([key, v]) => {
      // Filter out make_id and model_id if we have make_name and model_name
      if (key === 'make_id' && details.make_name) return false;
      if (key === 'model_id' && details.model_name) return false;
      return v != null && v !== "" && v !== false && (Array.isArray(v) ? v.length > 0 : true);
    })
    .map(([key, value]) => {
      const icon = getFeatureIcon(key, value, categorySlug);
      return {
        key,
        label: formatFeatureLabel(key),
        value,
        icon: icon || CheckCircle2,
        category: (categorySlug === 'property' ? 'property' : categorySlug === 'vehicles' ? 'vehicle' : 'general') as 'property' | 'vehicle' | 'general'
      };
    })
    .filter(f => f); // Remove any null entries

  if (features.length === 0) return null;

  // Group features by type for better organization
  const propertyFeatures = features.filter(f => 
    ['bedrooms', 'bathrooms', 'parking_spaces', 'size_sqm', 'plot_size_sqm', 
     'floor_number', 'total_floors', 'year_built', 'property_type', 'listing_type',
     'furnishing_type', 'is_furnished'].includes(f.key)
  );

  const amenities = features.find(f => f.key === 'amenities');
  const nearbyFacilities = features.find(f => f.key === 'nearby_facilities');
  const otherFeatures = features.filter(f => 
    !['bedrooms', 'bathrooms', 'parking_spaces', 'size_sqm', 'plot_size_sqm',
      'floor_number', 'total_floors', 'year_built', 'property_type', 'listing_type',
      'furnishing_type', 'is_furnished', 'amenities', 'nearby_facilities'].includes(f.key)
  );

  const vehicleFeatures = features.filter(f =>
    ['make_name', 'model_name', 'make', 'model', 'year_of_manufacture', 'year', 'mileage', 'fuel_type', 'transmission', 'body_type',
     'condition', 'exterior_color', 'color', 'drivetrain'].includes(f.key)
  );

  const vehicleKeyFeatures = features.find(f => f.key === 'key_features');

  return (
    <div className={cn("space-y-6", className)}>
      {/* Property: Key Stats */}
      {categorySlug === 'property' && propertyFeatures.length > 0 && (
        <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 shadow-lg border border-border/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Property Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.key}
                  className="flex flex-col items-center p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all group"
                >
                  <div className="p-3 rounded-full bg-primary/10 text-primary mb-2 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted-foreground text-center mb-1">{feature.label}</span>
                  <span className="text-sm font-bold text-foreground text-center">{formatFeatureValue(feature.key, feature.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Property: Amenities */}
      {categorySlug === 'property' && amenities && Array.isArray(amenities.value) && amenities.value.length > 0 && (
        <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 shadow-lg border border-border/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Amenities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {amenities.value.map((amenity: string, idx: number) => {
              const amenityLower = amenity.toLowerCase();
              let Icon = Home;
              if (amenityLower.includes('pool')) Icon = Waves;
              else if (amenityLower.includes('gym')) Icon = Dumbbell;
              else if (amenityLower.includes('security') || amenityLower.includes('cctv')) Icon = Shield;
              else if (amenityLower.includes('parking')) Icon = ParkingCircle;
              else if (amenityLower.includes('wifi') || amenityLower.includes('internet')) Icon = Wifi;
              else if (amenityLower.includes('tv') || amenityLower.includes('cable')) Icon = Tv;
              else if (amenityLower.includes('ac') || amenityLower.includes('air')) Icon = Wind;
              else if (amenityLower.includes('fireplace')) Icon = Flame;
              else if (amenityLower.includes('garden') || amenityLower.includes('balcony')) Icon = TreePine;
              else if (amenityLower.includes('elevator')) Icon = Building2;
              else if (amenityLower.includes('generator')) Icon = Zap;
              else if (amenityLower.includes('borehole')) Icon = Droplets;
              else if (amenityLower.includes('playground')) Icon = Baby;
              else if (amenityLower.includes('clubhouse')) Icon = Users;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Property: Nearby Facilities */}
      {categorySlug === 'property' && nearbyFacilities && Array.isArray(nearbyFacilities.value) && nearbyFacilities.value.length > 0 && (
        <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 shadow-lg border border-border/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Nearby Facilities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {nearbyFacilities.value.map((facility: string, idx: number) => {
              const facilityLower = facility.toLowerCase();
              let Icon = MapPin;
              if (facilityLower.includes('school')) Icon = School;
              else if (facilityLower.includes('church')) Icon = Church;
              else if (facilityLower.includes('hospital') || facilityLower.includes('clinic')) Icon = Hospital;
              else if (facilityLower.includes('mall') || facilityLower.includes('shopping')) Icon = ShoppingBag;
              else if (facilityLower.includes('restaurant') || facilityLower.includes('cafe')) Icon = UtensilsCrossed;
              else if (facilityLower.includes('bank') || facilityLower.includes('atm')) Icon = CreditCard;
              else if (facilityLower.includes('transport') || facilityLower.includes('bus') || facilityLower.includes('train')) Icon = Train;
              else if (facilityLower.includes('gym')) Icon = Dumbbell;
              else if (facilityLower.includes('beach')) Icon = Waves;
              else if (facilityLower.includes('park')) Icon = TreePine;
              else if (facilityLower.includes('mosque')) Icon = Church;
              else if (facilityLower.includes('police')) Icon = Shield;
              else if (facilityLower.includes('fire')) Icon = Flame;
              else if (facilityLower.includes('supermarket')) Icon = ShoppingBag;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary/20 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{facility}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vehicle: Key Stats */}
      {categorySlug === 'vehicles' && vehicleFeatures.length > 0 && (
        <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 shadow-lg border border-border/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Vehicle Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vehicleFeatures.map((feature) => {
              // Skip make_id and model_id if we have make_name and model_name
              if (feature.key === 'make_id' || feature.key === 'model_id') return null;
              
              const Icon = feature.icon;
              // Map make_name/model_name to better labels
              const displayLabel = feature.key === 'make_name' ? 'Make' : 
                                   feature.key === 'model_name' ? 'Model' : 
                                   feature.key === 'year_of_manufacture' ? 'Year' :
                                   feature.label;
              return (
                <div
                  key={feature.key}
                  className="flex flex-col items-center p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all group"
                >
                  <div className="p-3 rounded-full bg-primary/10 text-primary mb-2 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted-foreground text-center mb-1">{displayLabel}</span>
                  <span className="text-sm font-bold text-foreground text-center">{formatFeatureValue(feature.key, feature.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vehicle: Key Features */}
      {categorySlug === 'vehicles' && vehicleKeyFeatures && Array.isArray(vehicleKeyFeatures.value) && vehicleKeyFeatures.value.length > 0 && (
        <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 shadow-lg border border-border/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Key Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {vehicleKeyFeatures.value.map((feature: string, idx: number) => {
              const featureLower = feature.toLowerCase();
              let Icon = Star;
              if (featureLower.includes('ac') || featureLower.includes('air')) Icon = Wind;
              else if (featureLower.includes('navigation') || featureLower.includes('gps')) Icon = Navigation;
              else if (featureLower.includes('camera') || featureLower.includes('backup')) Icon = Camera;
              else if (featureLower.includes('bluetooth') || featureLower.includes('audio')) Icon = Radio;
              else if (featureLower.includes('sunroof')) Icon = Sun;
              else if (featureLower.includes('leather')) Icon = Award;
              else if (featureLower.includes('steering')) Icon = Settings;
              else if (featureLower.includes('window')) Icon = Car;
              else if (featureLower.includes('lock')) Icon = Lock;
              else if (featureLower.includes('airbag')) Icon = Shield;
              else if (featureLower.includes('abs')) Icon = Shield;
              else if (featureLower.includes('cruise')) Icon = Gauge;
              else if (featureLower.includes('sensor') || featureLower.includes('parking')) Icon = ParkingCircle;
              else if (featureLower.includes('wheel') || featureLower.includes('alloy')) Icon = Car;
              else if (featureLower.includes('fog')) Icon = Lightbulb;
              else if (featureLower.includes('keyless') || featureLower.includes('push')) Icon = Key;
              else if (featureLower.includes('heated')) Icon = Flame;
              else if (featureLower.includes('carplay') || featureLower.includes('android')) Icon = Radio;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{feature}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Features (for other categories or remaining features) */}
      {otherFeatures.length > 0 && (
        <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 shadow-lg border border-border/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.key}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all group"
                >
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">{feature.label}</span>
                    <span className="text-sm font-semibold text-foreground">{formatFeatureValue(feature.key, feature.value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
