import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Clock, Phone, Mail, Bell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

const ComingSoon = () => {
  const [email, setEmail] = useState('');

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Thank you!',
      description: "We'll notify you when our restaurant opens!",
    });
    setEmail('');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
            Restaurant Opening Soon!
          </h1>
          <p className="text-2xl text-primary font-medium mb-2">మా రెస్టారెంట్ త్వరలో</p>
          <p className="text-xl text-muted-foreground">
            Experience our homely cooking in person
          </p>
        </div>

        {/* Announcement Card */}
        <Card className="mb-12 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Our First Restaurant in Guntur!
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              We're bringing Amma's kitchen to you with a warm dining experience. Enjoy the same
              love and care in a cozy restaurant setting.
            </p>
            <div className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full text-lg font-semibold">
              Opening: Early 2025
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Location</h3>
                  <p className="text-muted-foreground">
                    Lakshmipuram Main Road
                    <br />
                    Guntur, Andhra Pradesh - 522007
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Planned Hours</h3>
                  <p className="text-muted-foreground">
                    Daily: 11:00 AM - 10:00 PM
                    <br />
                    Breakfast: 8:00 AM - 11:00 AM
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Contact</h3>
                  <p className="text-muted-foreground">
                    +91 98765 43210
                    <br />
                    For franchise inquiries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Email</h3>
                  <p className="text-muted-foreground">
                    restaurant@ammaintivantalu.com
                    <br />
                    For updates & reservations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notify Me */}
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3 text-foreground">Get Notified</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to know when we open. We'll send you an invitation to our grand opening!
            </p>
            <form onSubmit={handleNotify} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Notify Me
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Meanwhile */}
        <div className="text-center mt-12 p-8 bg-secondary rounded-lg">
          <h3 className="text-2xl font-bold mb-3 text-foreground">Meanwhile...</h3>
          <p className="text-lg text-muted-foreground mb-4">
            Continue enjoying our cloud kitchen delivery service
          </p>
          <Button size="lg" variant="default" onClick={() => (window.location.href = '/menu')}>
            Order Online Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
