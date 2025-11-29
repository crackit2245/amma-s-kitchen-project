import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Clock, Truck, Package, Home, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  items: any;
  total_amount: number;
  delivery_address: string;
  city: string;
  pincode: string;
  phone: string;
  customer_name: string;
  status: 'placed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_method: string;
  created_at: string;
  estimated_delivery_time: string | null;
}

const statusMessages: Record<string, string> = {
  placed: 'Your order has been placed!',
  preparing: 'Your order is being prepared!',
  out_for_delivery: 'Your order is out for delivery!',
  delivered: 'Your order has been delivered!',
  cancelled: 'Your order has been cancelled.',
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const previousStatusRef = useRef<string | null>(null);

  const playNotificationSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  }, []);

  const showStatusNotification = useCallback((newStatus: string) => {
    playNotificationSound();
    toast({
      title: (
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span>Order Status Updated</span>
        </div>
      ) as any,
      description: statusMessages[newStatus] || `Status changed to ${newStatus.replace('_', ' ')}`,
      duration: 5000,
    });
  }, [playNotificationSound, toast]);

  useEffect(() => {
    fetchOrder();

    // Subscribe to realtime updates for this order
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order updated:', payload);
          const updatedData = payload.new as any;
          const newStatus = updatedData.status;
          
          // Check if status changed and show notification
          if (previousStatusRef.current && previousStatusRef.current !== newStatus) {
            showStatusNotification(newStatus);
          }
          previousStatusRef.current = newStatus;
          
          setOrder(prev => prev ? {
            ...prev,
            ...updatedData,
            items: typeof updatedData.items === 'string' ? JSON.parse(updatedData.items) : updatedData.items
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, showStatusNotification]);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching order:', error);
    } else if (data) {
      // Parse items if stored as JSON string
      const parsedOrder = {
        ...data,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items
      };
      setOrder(parsedOrder as any);
      // Set initial status reference
      previousStatusRef.current = data.status;
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      placed: 'bg-blue-500',
      preparing: 'bg-yellow-500',
      out_for_delivery: 'bg-orange-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const statusSteps = [
    { status: 'placed', label: 'Order Placed', icon: CheckCircle2 },
    { status: 'preparing', label: 'Preparing', icon: Package },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: Home },
  ];

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl">Order not found</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Track Your Order</h1>

        {/* Order Status Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center relative mb-8">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
                <div 
                  className={`h-full ${getStatusColor(order.status)} transition-all duration-500`}
                  style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Status Steps */}
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStatusIndex;
                return (
                  <div key={step.status} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? getStatusColor(order.status) : 'bg-muted'
                    } text-white mb-2`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className={`text-sm text-center ${isActive ? 'font-semibold' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {order.estimated_delivery_time && (
                <p className="text-sm text-muted-foreground mt-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Estimated delivery: {format(new Date(order.estimated_delivery_time), 'PPp')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p>{format(new Date(order.created_at), 'PPp')}</p>
            </div>
            <Separator />
            <div>
              <p className="font-semibold mb-2">Items Ordered</p>
              {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">₹{order.total_amount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Details */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Customer Name</p>
              <p>{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p>{order.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery Address</p>
              <p>{order.delivery_address}</p>
              <p>{order.city}, {order.pincode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="uppercase">{order.payment_method}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button onClick={() => navigate('/my-orders')} variant="outline" className="flex-1">
            View All Orders
          </Button>
          <Button onClick={() => navigate('/')} className="flex-1">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
