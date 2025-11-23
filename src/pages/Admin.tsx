import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Package, TrendingUp, DollarSign, Users, MapPin, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  status: string;
  total_amount: number;
  items: any;
  delivery_address: string;
  phone: string;
}

const statusColors = {
  placed: 'bg-blue-500',
  confirmed: 'bg-purple-500',
  preparing: 'bg-yellow-500',
  out_for_delivery: 'bg-orange-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

interface DeliveryArea {
  id: string;
  area_name: string;
  city: string;
  pincode: string;
  delivery_fee: number;
  estimated_delivery_minutes: number;
  is_serviceable: boolean;
}

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [newArea, setNewArea] = useState({
    area_name: '',
    city: '',
    pincode: '',
    delivery_fee: 0,
    estimated_delivery_minutes: 45,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
      fetchStats();
      fetchDeliveryAreas();
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } else {
      // Parse items if stored as JSON string
      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));
      setOrders(parsedOrders);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount');

    if (!error && data) {
      const totalOrders = data.length;
      const totalRevenue = data.reduce((sum, order) => sum + order.total_amount, 0);
      const pendingOrders = data.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
      const completedOrders = data.filter(o => o.status === 'delivered').length;

      setStats({ totalOrders, totalRevenue, pendingOrders, completedOrders });
    }
  };

  const fetchDeliveryAreas = async () => {
    const { data, error } = await supabase
      .from('delivery_areas')
      .select('*')
      .order('city', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch delivery areas',
        variant: 'destructive',
      });
    } else {
      setDeliveryAreas(data || []);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      fetchOrders();
      fetchStats();
    }
  };

  const addDeliveryArea = async () => {
    if (!newArea.area_name || !newArea.city || !newArea.pincode) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('delivery_areas')
      .insert([newArea]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add delivery area',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Delivery area added successfully',
      });
      setNewArea({
        area_name: '',
        city: '',
        pincode: '',
        delivery_fee: 0,
        estimated_delivery_minutes: 45,
      });
      fetchDeliveryAreas();
    }
  };

  const deleteDeliveryArea = async (id: string) => {
    const { error } = await supabase
      .from('delivery_areas')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete delivery area',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Delivery area deleted successfully',
      });
      fetchDeliveryAreas();
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.phone.includes(searchQuery) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Areas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>View and manage all customer orders</CardDescription>
                </div>
                <Input
                  placeholder="Search by customer, phone, or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="md:w-[300px]"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No orders match your search' : 'No orders yet'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>{order.phone}</TableCell>
                          <TableCell>
                            {Array.isArray(order.items) ? order.items.length : 0} items
                          </TableCell>
                          <TableCell className="font-semibold">₹{order.total_amount}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="placed">Placed</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Areas
                  </CardTitle>
                  <CardDescription>Manage serviceable areas and delivery fees</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Area
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Delivery Area</DialogTitle>
                      <DialogDescription>Add a new serviceable delivery area</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="area_name">Area Name</Label>
                        <Input
                          id="area_name"
                          value={newArea.area_name}
                          onChange={(e) => setNewArea({ ...newArea, area_name: e.target.value })}
                          placeholder="e.g., Kondapur"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newArea.city}
                            onChange={(e) => setNewArea({ ...newArea, city: e.target.value })}
                            placeholder="e.g., Hyderabad"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={newArea.pincode}
                            onChange={(e) => setNewArea({ ...newArea, pincode: e.target.value })}
                            placeholder="e.g., 500084"
                            maxLength={6}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
                          <Input
                            id="delivery_fee"
                            type="number"
                            value={newArea.delivery_fee}
                            onChange={(e) => setNewArea({ ...newArea, delivery_fee: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="delivery_time">Est. Delivery (mins)</Label>
                          <Input
                            id="delivery_time"
                            type="number"
                            value={newArea.estimated_delivery_minutes}
                            onChange={(e) => setNewArea({ ...newArea, estimated_delivery_minutes: parseInt(e.target.value) || 45 })}
                            placeholder="45"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addDeliveryArea}>Add Area</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {deliveryAreas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No delivery areas configured</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Area Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Pincode</TableHead>
                        <TableHead>Delivery Fee</TableHead>
                        <TableHead>Est. Delivery</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryAreas.map((area) => (
                        <TableRow key={area.id}>
                          <TableCell className="font-medium">{area.area_name}</TableCell>
                          <TableCell>{area.city}</TableCell>
                          <TableCell>{area.pincode}</TableCell>
                          <TableCell>₹{area.delivery_fee}</TableCell>
                          <TableCell>{area.estimated_delivery_minutes} mins</TableCell>
                          <TableCell>
                            <Badge variant={area.is_serviceable ? 'default' : 'secondary'}>
                              {area.is_serviceable ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteDeliveryArea(area.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Key metrics and insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Order Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(
                    (status) => {
                      const count = orders.filter((o) => o.status === status).length;
                      return (
                        <Card key={status}>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{count}</div>
                            <p className="text-sm text-muted-foreground capitalize">
                              {status.replace('_', ' ')}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Revenue Summary</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold">₹{stats.totalRevenue}</div>
                    <p className="text-sm text-muted-foreground">Total Revenue from {stats.totalOrders} orders</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Order Value:</span>
                        <span className="font-semibold">
                          ₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completed Orders:</span>
                        <span className="font-semibold">{stats.completedOrders}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
