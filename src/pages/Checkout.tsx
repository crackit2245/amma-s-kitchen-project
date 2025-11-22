import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { addMinutes } from 'date-fns';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeliveryArea {
  pincode: string;
  area_name: string;
  city: string;
  delivery_fee: number;
  estimated_delivery_minutes: number;
  is_serviceable: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea | null>(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();
    setProfile(data);
    
    // Check pincode if profile has one
    if (data?.pincode) {
      checkPincode(data.pincode);
    }
  };

  const checkPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      setPincodeError(null);
      setDeliveryArea(null);
      return;
    }

    setPincodeChecking(true);
    setPincodeError(null);

    const { data, error } = await supabase
      .from('delivery_areas')
      .select('*')
      .eq('pincode', pincode)
      .maybeSingle();

    setPincodeChecking(false);

    if (error || !data) {
      setPincodeError('Sorry, we don\'t deliver to this pincode yet.');
      setDeliveryArea(null);
      return;
    }

    if (!data.is_serviceable) {
      setPincodeError('Sorry, delivery is currently unavailable in this area.');
      setDeliveryArea(null);
      return;
    }

    setDeliveryArea(data as DeliveryArea);
    setPincodeError(null);
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value;
    if (pincode.length === 6) {
      checkPincode(pincode);
    } else {
      setDeliveryArea(null);
      setPincodeError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    if (!deliveryArea) {
      toast({
        title: 'Invalid Pincode',
        description: 'Please enter a valid serviceable pincode.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const deliveryFee = deliveryArea.delivery_fee;
    const packagingFee = 20;
    
    const orderData = {
      user_id: user.id,
      items: JSON.stringify(cart) as any,
      total_amount: getTotalPrice() + deliveryFee + packagingFee,
      delivery_address: formData.get('address') as string,
      city: formData.get('city') as string,
      pincode: formData.get('pincode') as string,
      phone: formData.get('phone') as string,
      customer_name: formData.get('name') as string,
      payment_method: paymentMethod,
      status: 'placed',
      estimated_delivery_time: addMinutes(new Date(), deliveryArea.estimated_delivery_minutes).toISOString(),
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast({
        title: 'Order Failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Order Placed Successfully! 🎉',
      description: 'Your delicious food will arrive soon with lots of love!',
    });
    clearCart();
    navigate(`/orders/${order.id}`);
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Delivery Details */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user && (
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <p className="text-sm mb-2">Have an account? <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>Login</Button> to checkout faster!</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    required 
                    placeholder="Enter your name"
                    defaultValue={profile?.name || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="tel" 
                    required 
                    placeholder="98765 43210"
                    defaultValue={profile?.phone || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="your@email.com"
                    defaultValue={user?.email || ''}
                    disabled={!!user}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    required
                    placeholder="House no, Street, Landmark"
                    rows={3}
                    defaultValue={profile?.default_address || ''}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input 
                      id="city" 
                      name="city"
                      required 
                      placeholder="Hyderabad"
                      defaultValue={profile?.city || ''}
                      value={deliveryArea?.city || profile?.city || ''}
                      readOnly={!!deliveryArea}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <div className="relative">
                      <Input 
                        id="pincode" 
                        name="pincode"
                        required 
                        placeholder="500001"
                        defaultValue={profile?.pincode || ''}
                        onChange={handlePincodeChange}
                        maxLength={6}
                        pattern="[0-9]{6}"
                      />
                      {pincodeChecking && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Pincode Validation Feedback */}
                {pincodeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{pincodeError}</AlertDescription>
                  </Alert>
                )}
                
                {deliveryArea && !pincodeError && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      Great! We deliver to {deliveryArea.area_name}, {deliveryArea.city}
                      <br />
                      <span className="text-sm">
                        Estimated delivery: {deliveryArea.estimated_delivery_minutes} minutes
                      </span>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Payment & Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="cursor-pointer flex-1">
                        Cash on Delivery
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted opacity-50">
                      <RadioGroupItem value="upi" id="upi" disabled />
                      <Label htmlFor="upi" className="cursor-pointer flex-1">
                        UPI (Coming Soon)
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className={deliveryArea?.delivery_fee === 0 ? "text-primary" : ""}>
                      {deliveryArea ? (deliveryArea.delivery_fee === 0 ? 'FREE' : `₹${deliveryArea.delivery_fee}`) : '₹0'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Packaging</span>
                    <span>₹20</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ₹{getTotalPrice() + (deliveryArea?.delivery_fee || 0) + 20}
                    </span>
                  </div>
                  {deliveryArea && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Estimated delivery: {deliveryArea.estimated_delivery_minutes} minutes
                    </p>
                  )}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full mt-4 bg-primary hover:bg-primary/90"
                    disabled={loading || !deliveryArea || !!pincodeError}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>
                  {!deliveryArea && !pincodeChecking && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Enter a valid pincode to proceed
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
