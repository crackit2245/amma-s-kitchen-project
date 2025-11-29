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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Package, TrendingUp, DollarSign, Users, MapPin, Plus, Trash2, Edit, Eye, UtensilsCrossed, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  status: string;
  total_amount: number;
  items: any;
  delivery_address: string;
  phone: string;
  city: string;
  pincode: string;
}

interface MenuItem {
  id: string;
  name: string;
  telugu: string | null;
  description: string | null;
  price: number;
  category: string;
  region: string;
  type: string;
  image_url: string | null;
  ingredients: string[];
  nutrition: { calories: number; protein: string; carbs: string } | null;
  is_available: boolean;
  is_popular: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

interface DeliveryArea {
  id: string;
  area_name: string;
  city: string;
  pincode: string;
  delivery_fee: number;
  estimated_delivery_minutes: number;
  is_serviceable: boolean;
}

const statusColors: Record<string, string> = {
  placed: 'bg-blue-500',
  confirmed: 'bg-purple-500',
  preparing: 'bg-yellow-500',
  out_for_delivery: 'bg-orange-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444'];

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
  });
  
  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    telugu: '',
    description: '',
    price: 0,
    category: 'meals',
    region: 'both',
    type: 'veg',
    image_url: '',
    ingredients: '',
    is_available: true,
    is_popular: false,
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
      fetchMenuItems();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch orders', variant: 'destructive' });
    } else {
      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));
      setOrders(parsedOrders);
    }
    setLoading(false);
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch menu items', variant: 'destructive' });
    } else {
      const items = (data || []).map(item => ({
        ...item,
        ingredients: Array.isArray(item.ingredients) ? (item.ingredients as string[]) : [],
        nutrition: item.nutrition as MenuItem['nutrition'],
      }));
      setMenuItems(items);
    }
  };

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
      return;
    }

    // Get order stats for each user
    const { data: orderStats } = await supabase
      .from('orders')
      .select('user_id, total_amount');

    const userStats: Record<string, { count: number; total: number }> = {};
    (orderStats || []).forEach(order => {
      if (!userStats[order.user_id]) {
        userStats[order.user_id] = { count: 0, total: 0 };
      }
      userStats[order.user_id].count++;
      userStats[order.user_id].total += order.total_amount;
    });

    const usersWithStats = (profiles || []).map(profile => ({
      ...profile,
      order_count: userStats[profile.id]?.count || 0,
      total_spent: userStats[profile.id]?.total || 0,
    }));

    setUsers(usersWithStats);
  };

  const fetchStats = async () => {
    const { data: orderData } = await supabase.from('orders').select('status, total_amount');
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    if (orderData) {
      const totalOrders = orderData.length;
      const totalRevenue = orderData.reduce((sum, order) => sum + order.total_amount, 0);
      const pendingOrders = orderData.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
      const completedOrders = orderData.filter(o => o.status === 'delivered').length;

      setStats({ totalOrders, totalRevenue, pendingOrders, completedOrders, totalUsers: userCount || 0 });
    }
  };

  const fetchDeliveryAreas = async () => {
    const { data, error } = await supabase
      .from('delivery_areas')
      .select('*')
      .order('city', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch delivery areas', variant: 'destructive' });
    } else {
      setDeliveryAreas(data || []);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const updateData: any = { status: newStatus };
    if (newStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update order status', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Order status updated' });
      fetchOrders();
      fetchStats();
    }
  };

  const addMenuItem = async () => {
    if (!newMenuItem.name || newMenuItem.price <= 0) {
      toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    const ingredientsArray = newMenuItem.ingredients.split(',').map(i => i.trim()).filter(Boolean);

    const { error } = await supabase.from('menu_items').insert([{
      name: newMenuItem.name,
      telugu: newMenuItem.telugu || null,
      description: newMenuItem.description || null,
      price: newMenuItem.price,
      category: newMenuItem.category,
      region: newMenuItem.region,
      type: newMenuItem.type,
      image_url: newMenuItem.image_url || null,
      ingredients: ingredientsArray,
      is_available: newMenuItem.is_available,
      is_popular: newMenuItem.is_popular,
    }]);

    if (error) {
      toast({ title: 'Error', description: 'Failed to add menu item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Menu item added' });
      setIsMenuDialogOpen(false);
      resetMenuForm();
      fetchMenuItems();
    }
  };

  const updateMenuItem = async () => {
    if (!editingMenuItem) return;

    const ingredientsArray = newMenuItem.ingredients.split(',').map(i => i.trim()).filter(Boolean);

    const { error } = await supabase.from('menu_items').update({
      name: newMenuItem.name,
      telugu: newMenuItem.telugu || null,
      description: newMenuItem.description || null,
      price: newMenuItem.price,
      category: newMenuItem.category,
      region: newMenuItem.region,
      type: newMenuItem.type,
      image_url: newMenuItem.image_url || null,
      ingredients: ingredientsArray,
      is_available: newMenuItem.is_available,
      is_popular: newMenuItem.is_popular,
    }).eq('id', editingMenuItem.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update menu item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Menu item updated' });
      setIsMenuDialogOpen(false);
      setEditingMenuItem(null);
      resetMenuForm();
      fetchMenuItems();
    }
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete menu item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Menu item deleted' });
      fetchMenuItems();
    }
  };

  const toggleMenuItemAvailability = async (id: string, isAvailable: boolean) => {
    const { error } = await supabase.from('menu_items').update({ is_available: isAvailable }).eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update availability', variant: 'destructive' });
    } else {
      fetchMenuItems();
    }
  };

  const resetMenuForm = () => {
    setNewMenuItem({
      name: '', telugu: '', description: '', price: 0, category: 'meals',
      region: 'both', type: 'veg', image_url: '', ingredients: '',
      is_available: true, is_popular: false,
    });
  };

  const openEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setNewMenuItem({
      name: item.name,
      telugu: item.telugu || '',
      description: item.description || '',
      price: item.price,
      category: item.category,
      region: item.region,
      type: item.type,
      image_url: item.image_url || '',
      ingredients: item.ingredients.join(', '),
      is_available: item.is_available,
      is_popular: item.is_popular,
    });
    setIsMenuDialogOpen(true);
  };

  const addDeliveryArea = async () => {
    if (!newArea.area_name || !newArea.city || !newArea.pincode) {
      toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('delivery_areas').insert([newArea]);

    if (error) {
      toast({ title: 'Error', description: 'Failed to add delivery area', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Delivery area added' });
      setNewArea({ area_name: '', city: '', pincode: '', delivery_fee: 0, estimated_delivery_minutes: 45 });
      fetchDeliveryAreas();
    }
  };

  const deleteDeliveryArea = async (id: string) => {
    const { error } = await supabase.from('delivery_areas').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete delivery area', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Delivery area deleted' });
      fetchDeliveryAreas();
    }
  };

  // Filtered data
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMenuItems = menuItems.filter(item => {
    return menuCategoryFilter === 'all' || item.category === menuCategoryFilter;
  });

  // Analytics data
  const ordersByStatus = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(status => ({
    name: status.replace('_', ' '),
    value: orders.filter(o => o.status === status).length,
  }));

  const revenueByDay = orders.reduce((acc: any[], order) => {
    const date = format(new Date(order.created_at), 'MMM dd');
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.revenue += order.total_amount;
      existing.orders++;
    } else {
      acc.push({ date, revenue: order.total_amount, orders: 1 });
    }
    return acc;
  }, []).slice(-7);

  const popularItems = menuItems
    .filter(item => item.is_popular)
    .map(item => ({ name: item.name, price: item.price }));

  if (authLoading) {
    return <div className="container mx-auto px-4 py-8"><div className="text-center">Loading...</div></div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalOrders}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{stats.totalRevenue}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.pendingOrders}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.completedOrders}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div></CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Areas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>View and manage all customer orders</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="md:w-[200px]"
                  />
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="placed">Placed</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No orders found</div>
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>{order.phone}</TableCell>
                          <TableCell>{Array.isArray(order.items) ? order.items.length : 0} items</TableCell>
                          <TableCell className="font-semibold">₹{order.total_amount}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status]}>{order.status.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Order Details</DialogTitle>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-muted-foreground">Customer:</span> {selectedOrder.customer_name}</div>
                                        <div><span className="text-muted-foreground">Phone:</span> {selectedOrder.phone}</div>
                                        <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {selectedOrder.delivery_address}, {selectedOrder.city} - {selectedOrder.pincode}</div>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Items:</h4>
                                        {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                                          <div key={idx} className="flex justify-between text-sm py-1 border-b">
                                            <span>{item.name} x {item.quantity}</span>
                                            <span>₹{item.price * item.quantity}</span>
                                          </div>
                                        ))}
                                        <div className="flex justify-between font-bold mt-2">
                                          <span>Total</span>
                                          <span>₹{selectedOrder.total_amount}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                                <SelectTrigger className="w-[140px]">
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

        {/* Menu Items Tab */}
        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5" />
                    Menu Management
                  </CardTitle>
                  <CardDescription>Add, edit, and manage menu items</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={menuCategoryFilter} onValueChange={setMenuCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="meals">Meals</SelectItem>
                      <SelectItem value="curries">Curries</SelectItem>
                      <SelectItem value="tiffins">Tiffins</SelectItem>
                      <SelectItem value="pickles">Pickles</SelectItem>
                      <SelectItem value="sweets">Sweets</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={isMenuDialogOpen} onOpenChange={(open) => {
                    setIsMenuDialogOpen(open);
                    if (!open) { setEditingMenuItem(null); resetMenuForm(); }
                  }}>
                    <DialogTrigger asChild>
                      <Button><Plus className="w-4 h-4 mr-2" />Add Item</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={newMenuItem.name} onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Telugu Name</Label>
                            <Input value={newMenuItem.telugu} onChange={(e) => setNewMenuItem({ ...newMenuItem, telugu: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={newMenuItem.description} onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Price *</Label>
                            <Input type="number" value={newMenuItem.price} onChange={(e) => setNewMenuItem({ ...newMenuItem, price: parseInt(e.target.value) || 0 })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={newMenuItem.category} onValueChange={(v) => setNewMenuItem({ ...newMenuItem, category: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="meals">Meals</SelectItem>
                                <SelectItem value="curries">Curries</SelectItem>
                                <SelectItem value="tiffins">Tiffins</SelectItem>
                                <SelectItem value="pickles">Pickles</SelectItem>
                                <SelectItem value="sweets">Sweets</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={newMenuItem.type} onValueChange={(v) => setNewMenuItem({ ...newMenuItem, type: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="veg">Veg</SelectItem>
                                <SelectItem value="nonveg">Non-Veg</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Region</Label>
                          <Select value={newMenuItem.region} onValueChange={(v) => setNewMenuItem({ ...newMenuItem, region: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="andhra">Andhra</SelectItem>
                              <SelectItem value="telangana">Telangana</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Image URL</Label>
                          <Input value={newMenuItem.image_url} onChange={(e) => setNewMenuItem({ ...newMenuItem, image_url: e.target.value })} placeholder="/src/assets/dish.jpg" />
                        </div>
                        <div className="space-y-2">
                          <Label>Ingredients (comma-separated)</Label>
                          <Input value={newMenuItem.ingredients} onChange={(e) => setNewMenuItem({ ...newMenuItem, ingredients: e.target.value })} placeholder="Rice, Chicken, Spices" />
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Switch checked={newMenuItem.is_available} onCheckedChange={(c) => setNewMenuItem({ ...newMenuItem, is_available: c })} />
                            <Label>Available</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={newMenuItem.is_popular} onCheckedChange={(c) => setNewMenuItem({ ...newMenuItem, is_popular: c })} />
                            <Label>Popular</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={editingMenuItem ? updateMenuItem : addMenuItem}>
                          {editingMenuItem ? 'Update' : 'Add'} Item
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No menu items found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Popular</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMenuItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.telugu && <div className="text-sm text-muted-foreground">{item.telugu}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{item.category}</TableCell>
                          <TableCell>
                            <Badge variant={item.type === 'veg' ? 'secondary' : 'destructive'}>{item.type}</Badge>
                          </TableCell>
                          <TableCell>₹{item.price}</TableCell>
                          <TableCell>
                            <Switch checked={item.is_available} onCheckedChange={(c) => toggleMenuItemAvailability(item.id, c)} />
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.is_popular ? 'default' : 'outline'}>{item.is_popular ? 'Yes' : 'No'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditMenuItem(item)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteMenuItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>View all registered users and their order history</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell>{user.city || 'N/A'}</TableCell>
                          <TableCell>{user.order_count}</TableCell>
                          <TableCell className="font-semibold">₹{user.total_spent}</TableCell>
                          <TableCell>{format(new Date(user.created_at), 'MMM dd, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Areas Tab */}
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" />Delivery Areas</CardTitle>
                  <CardDescription>Manage serviceable areas and delivery fees</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button><Plus className="w-4 h-4 mr-2" />Add Area</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Delivery Area</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Area Name</Label>
                        <Input value={newArea.area_name} onChange={(e) => setNewArea({ ...newArea, area_name: e.target.value })} placeholder="e.g., Kondapur" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input value={newArea.city} onChange={(e) => setNewArea({ ...newArea, city: e.target.value })} placeholder="e.g., Hyderabad" />
                        </div>
                        <div className="space-y-2">
                          <Label>Pincode</Label>
                          <Input value={newArea.pincode} onChange={(e) => setNewArea({ ...newArea, pincode: e.target.value })} placeholder="e.g., 500084" maxLength={6} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Delivery Fee (₹)</Label>
                          <Input type="number" value={newArea.delivery_fee} onChange={(e) => setNewArea({ ...newArea, delivery_fee: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Est. Delivery (mins)</Label>
                          <Input type="number" value={newArea.estimated_delivery_minutes} onChange={(e) => setNewArea({ ...newArea, estimated_delivery_minutes: parseInt(e.target.value) || 45 })} />
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
                            <Button variant="ghost" size="sm" onClick={() => deleteDeliveryArea(area.id)}>
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersByStatus.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {ordersByStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Orders per Day */}
            <Card>
              <CardHeader>
                <CardTitle>Orders per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">₹{stats.totalRevenue}</div>
                <p className="text-sm text-muted-foreground">Total Revenue from {stats.totalOrders} orders</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Order Value:</span>
                    <span className="font-semibold">₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed Orders:</span>
                    <span className="font-semibold">{stats.completedOrders}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate:</span>
                    <span className="font-semibold">{stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}