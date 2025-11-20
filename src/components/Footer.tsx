import { Heart, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-3">అమ్మ ఇంటి వంటలు</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Made with Love, Served with Care
            </p>
            <p className="text-sm text-foreground">
              ఇంటి రుచి… ప్రతి ముద్దలో ప్రేమ.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>order@ammaintivantalu.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Guntur, Andhra Pradesh</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Delivery Hours</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Monday - Saturday</p>
              <p className="font-semibold text-foreground">11:00 AM - 9:00 PM</p>
              <p>Sunday</p>
              <p className="font-semibold text-foreground">12:00 PM - 8:00 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="h-4 w-4 text-accent fill-accent" /> for Telugu Homes
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © 2024 Amma Inti Vantalu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
