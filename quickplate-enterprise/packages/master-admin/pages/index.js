import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  BuildingStoreIcon, 
  CreditCardIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function MasterAdmin({ user }) {
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all tenants
      const {  tenantData } = await supabase
        .from('tenants')
        .select(`
          *,
          subscriptions(*),
          plan:plans(name, price_per_table)
        `)
        .order('created_at', { ascending: false });

      setTenants(tenantData || []);

      // Calculate stats
      const totalRevenue = tenantData?.reduce((sum, tenant) => {
        if (tenant.plan && tenant.table_count) {
          return sum + (tenant.plan.price_per_table * tenant.table_count);
        }
        return sum;
      }, 0) || 0;

      setStats({
        totalTenants: tenantData?.length || 0,
        activeTenants: tenantData?.filter(t => t.is_active).length || 0,
        totalRevenue: totalRevenue,
        totalTables: tenantData?.reduce((sum, tenant) => sum + tenant.table_count, 0) || 0
      });
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Master Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <BuildingStoreIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTenants}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">£{stats.totalRevenue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTables}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">All Restaurants</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tables</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <motion.tr
                    key={tenant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.subdomain}.quickplate.com</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.owner_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.plan?.name} (£{tenant.plan?.price_per_table}/table)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.table_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tenant.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tenant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}