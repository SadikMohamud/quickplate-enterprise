import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, PlusIcon, MinusIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { FaUtensils, FaCoffee, FaPizzaSlice, FaBurger } from 'react-icons/fa';

export default function OrderPage({ cart, setCart, orderStatus, setOrderStatus, router }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [currentOrderStatus, setCurrentOrderStatus] = useState(null);

  useEffect(() => {
    fetchOrderData();
    // Simulate real-time order status updates
    const interval = setInterval(() => {
      if (orderStatus) {
        setCurrentOrderStatus(orderStatus);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderStatus]);

  const fetchOrderData = async () => {
    const tableId = router.query.tableId;
    
    // Get tenant from subdomain
    const subdomain = window.location.hostname.split('.')[0];
    
    // Fetch tenant info
    const {  tenantData } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (tenantData) {
      // Fetch menu items
      const {  menuData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .eq('is_active', true);

      setMenuItems(menuData || []);

      // Fetch table info
      const {  tableData } = await supabase
        .from('tables')
        .select('*')
        .eq('id', tableId)
        .eq('tenant_id', tenantData.id)
        .single();

      setTable(tableData);
    }
    
    setLoading(false);
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const removeFromCartCompletely = (itemId) => {
    setCart(prev => prev.filter(cartItem => cartItem.id !== itemId));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    const tableId = router.query.tableId;
    
    const { error } = await supabase
      .from('orders')
      .insert({
        tenant_id: 'tenant-id', // Get from context
        table_id: tableId,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: getTotal()
      });

    if (!error) {
      setCart([]);
      setOrderStatus('received');
      setShowCart(false);
    }
  };

  const categories = ['All', 'Main', 'Appetizer', 'Dessert', 'Drink'];
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const categoryIcons = {
    'Main': <FaBurger className="h-5 w-5" />,
    'Appetizer': <FaUtensils className="h-5 w-5" />,
    'Dessert': <FaPizzaSlice className="h-5 w-5" />,
    'Drink': <FaCoffee className="h-5 w-5" />,
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-4">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Order Now</h1>
            <div className="flex items-center space-x-2">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                Table {table?.table_number}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-16 z-20 bg-white border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryIcons[category]}
                <span className="ml-2">{category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              <div className="relative">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
                {item.category && (
                  <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <span className="font-bold text-primary-600">£{item.price}</span>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1 text-center min-w-[3ch]">{cart.find(c => c.id === item.id)?.quantity || 0}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => addToCart(item)}
                    className="ml-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Order Status Notification */}
      <AnimatePresence>
        {currentOrderStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span>
                {currentOrderStatus === 'received' && 'Order received!'}
                {currentOrderStatus === 'preparing' && 'Order is being prepared'}
                {currentOrderStatus === 'ready' && 'Order is ready for service'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Button */}
      <button 
        onClick={() => setShowCart(true)}
        className="fixed bottom-24 right-4 md:bottom-4 md:right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg z-40 flex items-center gap-2 hover:bg-primary-700 transition-colors"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        <span className="hidden md:inline">Cart</span>
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Your Order</h2>
                  <button 
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border-b">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600">£{item.price} x {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)}
                              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => removeFromCartCompletely(item.id)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-4 border-t">
                      <div className="flex justify-between text-lg font-bold mb-6">
                        <span>Total:</span>
                        <span>£{getTotal().toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={placeOrder}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                      >
                        Place Order
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}