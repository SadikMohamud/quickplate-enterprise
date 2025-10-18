import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  TableCellsIcon, 
  ShoppingBagIcon, 
  CogIcon,
  UserGroupIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export default function RestaurantDashboard({ user }) {
  const [tenant, setTenant] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user) {
      fetchRestaurantData();
    }
  }, [user]);

  const fetchRestaurantData = async () => {
    try {
      // Get subdomain from URL
      const subdomain = window.location.hostname.split('.')[0];
      
      const {  tenantData } = await supabase
        .from('tenants')
        .select(`
          *,
          plan:plans(name, price_per_table, features)
        `)
        .eq('subdomain', subdomain)
        .single();

      if (tenantData) {
        setTenant(tenantData);
        
        // Fetch subscription
        const {  subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('tenant_id', tenantData.id)
          .single();
        
        setSubscription(subData);
        
        // Fetch tables
        const {  tableData } = await supabase
          .from('tables')
          .select('*')
          .eq('tenant_id', tenantData.id);
        
        setTables(tableData || []);
        
        // Fetch orders
        const {  orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('tenant_id', tenantData.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        setOrders(orderData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'tables', name: 'Tables', icon: TableCellsIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'menu', name: 'Menu', icon: ShoppingBagIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">QuickPlate</h1>
              <span className="ml-4 text-sm text-gray-500">{tenant?.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Plan: </span>
                <span className="font-medium text-primary-600">{tenant?.plan?.name}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Tables: </span>
                <span className="font-medium">{tables.length}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Navigation */}
        <div className="md:hidden mb-6">
          <div className="flex overflow-x-auto space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="hidden md:block lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm p-4">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Tables</p>
                        <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <div className="flex items-center">
                      <div className="bg-secondary-100 p-3 rounded-lg">
                        <ShoppingBagIcon className="h-6 w-6 text-secondary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'received').length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <CreditCardIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">£245.50</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg. Order Time</p>
                        <p className="text-2xl font-bold text-gray-900">12m</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">Table {order.table_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£{order.total}</p>
                          <p className={`text-sm px-2 py-1 rounded-full inline-block ${
                            order.status === 'received' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tables' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Table Management</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tables.map((table) => (
                    <div key={table.id} className="border rounded-lg p-4 text-center">
                      <h4 className="font-medium">Table {table.table_number}</h4>
                      <div className="bg-gray-200 border-2 border-dashed rounded w-full h-32 my-2 mx-auto" />
                      <button className="text-sm text-primary-600 hover:underline">
                        Download QR Code
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Management</h3>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">Table {order.table_id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'received' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Total: £{order.total}</p>
                        <p className="text-sm text-gray-600">Items: {order.items.length}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}