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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Package, TrendingUp, DollarSign, Users, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
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

interface DeliveryArea {
  id: string;
  pincode: string;
  area_name: string;
  city: string;
  delivery_fee: number;
  estimated_delivery_minutes: number;
  is_serviceable: boolean;
}

const statusColors = {
  placed: 'bg-blue-500',
  confirmed: 'bg-purple-500',
  preparing: 'bg-yellow-500',
  out_for_delivery: 'bg-orange-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);
  const [isServiceable, setIsServiceable] = useState(true);

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
      setOrders(data || []);
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

  const handleSaveDeliveryArea = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const areaData = {
      pincode: formData.get('pincode') as string,
      area_name: formData.get('area_name') as string,
      city: formData.get('city') as string,
      delivery_fee: parseInt(formData.get('delivery_fee') as string),
      estimated_delivery_minutes: parseInt(formData.get('estimated_delivery_minutes') as string),
      is_serviceable: isServiceable,
    };

    let error;
    if (editingArea) {
      ({ error } = await supabase
        .from('delivery_areas')
        .update(areaData)
        .eq('id', editingArea.id));
    } else {
      ({ error } = await supabase
        .from('delivery_areas')
        .insert([areaData]));
    }

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Delivery area ${editingArea ? 'updated' : 'added'} successfully`,
      });
      setDialogOpen(false);
      setEditingArea(null);
      setIsServiceable(true);
      fetchDeliveryAreas();
    }
  };

  const handleDeleteDeliveryArea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery area?')) return;

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
              <CardTitle>Order Management</CardTitle>
              <CardDescription>View and manage all customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No orders yet</div>
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
                      {orders.map((order) => (
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Delivery Areas</CardTitle>
                <CardDescription>Manage serviceable pincodes and delivery fees</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingArea(null);
                    setIsServiceable(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Area
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSaveDeliveryArea}>
                    <DialogHeader>
                      <DialogTitle>{editingArea ? 'Edit' : 'Add'} Delivery Area</DialogTitle>
                      <DialogDescription>
                        Configure pincode, delivery fee, and estimated delivery time
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          required
                          maxLength={6}
                          pattern="[0-9]{6}"
                          defaultValue={editingArea?.pincode || ''}
                          placeholder="500001"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="area_name">Area Name *</Label>
                        <Input
                          id="area_name"
                          name="area_name"
                          required
                          defaultValue={editingArea?.area_name || ''}
                          placeholder="Abids"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          required
                          defaultValue={editingArea?.city || ''}
                          placeholder="Hyderabad"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="delivery_fee">Delivery Fee (₹) *</Label>
                        <Input
                          id="delivery_fee"
                          name="delivery_fee"
                          type="number"
                          min="0"
                          required
                          defaultValue={editingArea?.delivery_fee || 0}
                          placeholder="30"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="estimated_delivery_minutes">Estimated Delivery (minutes) *</Label>
                        <Input
                          id="estimated_delivery_minutes"
                          name="estimated_delivery_minutes"
                          type="number"
                          min="1"
                          required
                          defaultValue={editingArea?.estimated_delivery_minutes || 45}
                          placeholder="45"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_serviceable"
                          checked={isServiceable}
                          onCheckedChange={setIsServiceable}
                        />
                        <Label htmlFor="is_serviceable">Serviceable Area</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingArea ? 'Update' : 'Add'} Area</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {deliveryAreas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No delivery areas configured</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pincode</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Delivery Fee</TableHead>
                        <TableHead>Est. Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryAreas.map((area) => (
                        <TableRow key={area.id}>
                          <TableCell className="font-mono">{area.pincode}</TableCell>
                          <TableCell>{area.area_name}</TableCell>
                          <TableCell>{area.city}</TableCell>
                          <TableCell className="font-semibold">
                            {area.delivery_fee === 0 ? 'FREE' : `₹${area.delivery_fee}`}
                          </TableCell>
                          <TableCell>{area.estimated_delivery_minutes} min</TableCell>
                          <TableCell>
                            <Badge variant={area.is_serviceable ? 'default' : 'destructive'}>
                              {area.is_serviceable ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setEditingArea(area);
                                  setIsServiceable(area.is_serviceable);
                                  setDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteDeliveryArea(area.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
