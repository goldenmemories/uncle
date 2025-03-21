import { supabase, handleSupabaseError } from '../lib/supabaseClient';

// Tenant operations
export const tenantService = {
  /**
   * Get all tenants with optional filters
   * @param {Object} options - Filter options
   * @returns {Promise} - The tenant data
   */
  async getAllTenants(options = {}) {
    try {
      const { status, sortBy = 'name', sortOrder = 'asc' } = options;
      
      let query = supabase
        .from('tenants')
        .select('*');
      
      // Apply filters if provided
      if (status) {
        query = query.eq('status', status);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting tenants:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },
  
  /**
   * Get tenant by ID
   * @param {string} id - The tenant ID
   * @returns {Promise} - The tenant data
   */
  async getTenantById(id) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error getting tenant ${id}:`, error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },
  
  /**
   * Create a new tenant
   * @param {Object} tenantData - The tenant data
   * @returns {Promise} - The created tenant
   */
  async createTenant(tenantData) {
    try {
      // Ensure required fields are present
      const requiredFields = ['name', 'email', 'room'];
      for (const field of requiredFields) {
        if (!tenantData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      // Format data
      const formattedData = {
        ...tenantData,
        name: tenantData.name.trim(),
        email: tenantData.email.trim().toLowerCase(),
        room: tenantData.room.trim(),
        rent_due: Number(tenantData.rent_due) || 0,
        status: tenantData.status || 'current'
      };
      
      const { data, error } = await supabase
        .from('tenants')
        .insert([formattedData])
        .select();
      
      if (error) {
        throw error;
      }
      
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error creating tenant:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },
  
  /**
   * Update an existing tenant
   * @param {string} id - The tenant ID
   * @param {Object} tenantData - The updated tenant data
   * @returns {Promise} - Success status
   */
  async updateTenant(id, tenantData) {
    try {
      // Format data
      const formattedData = {};
      
      // Only include defined fields to avoid setting null values
      Object.keys(tenantData).forEach(key => {
        if (tenantData[key] !== undefined) {
          if (typeof tenantData[key] === 'string') {
            formattedData[key] = tenantData[key].trim();
          } else {
            formattedData[key] = tenantData[key];
          }
        }
      });
      
      // Handle special fields
      if (formattedData.email) {
        formattedData.email = formattedData.email.toLowerCase();
      }
      
      if (formattedData.rent_due !== undefined) {
        formattedData.rent_due = Number(formattedData.rent_due) || 0;
      }
      
      const { data, error } = await supabase
        .from('tenants')
        .update(formattedData)
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error(`Error updating tenant ${id}:`, error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },
  
  /**
   * Archive a tenant (update status to 'previous')
   * @param {string} id - The tenant ID
   * @returns {Promise} - Success status
   */
  async archiveTenant(id) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({ status: 'previous' })
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return { success: true, data: data?.[0] || null, error: null };
    } catch (error) {
      console.error(`Error archiving tenant ${id}:`, error);
      return { success: false, data: null, error: handleSupabaseError(error) };
    }
  }
};

// Maintenance request operations
export const maintenanceService = {
  /**
   * Get all maintenance requests with optional filters
   * @param {Object} options - Filter options
   * @returns {Promise} - The maintenance request data
   */
  async getAllMaintenanceRequests(options = {}) {
    try {
      const { tenantId, status, sortBy = 'created_at', sortOrder = 'desc' } = options;
      
      let query = supabase
        .from('maintenance_requests')
        .select('*');
      
      // Apply filters if provided
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting maintenance requests:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },
  
  /**
   * Create a new maintenance request
   * @param {Object} requestData - The maintenance request data
   * @returns {Promise} - The created maintenance request
   */
  async createMaintenanceRequest(requestData) {
    try {
      // Ensure required fields are present
      const requiredFields = ['tenant_id', 'issue'];
      for (const field of requiredFields) {
        if (!requestData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      // Format data
      const formattedData = {
        ...requestData,
        issue: requestData.issue.trim(),
        status: requestData.status || 'pending',
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert([formattedData])
        .select();
      
      if (error) {
        throw error;
      }
      
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      return { data: null, error: handleSupabaseError(error) };
    }
  },
  
  /**
   * Update a maintenance request status
   * @param {string} id - The maintenance request ID
   * @param {string} status - The new status
   * @returns {Promise} - Success status
   */
  async updateMaintenanceStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return { success: true, data: data?.[0] || null, error: null };
    } catch (error) {
      console.error(`Error updating maintenance request ${id}:`, error);
      return { success: false, data: null, error: handleSupabaseError(error) };
    }
  }
};

// Get combined data for dashboard
export const getDashboardData = async () => {
  try {
    // Get current tenants
    const { data: currentTenants, error: tenantsError } = await tenantService.getAllTenants({
      status: 'current'
    });
    
    if (tenantsError) {
      throw new Error(tenantsError);
    }
    
    // Get pending maintenance requests
    const { data: pendingMaintenance, error: maintenanceError } = await maintenanceService.getAllMaintenanceRequests({
      status: 'pending'
    });
    
    if (maintenanceError) {
      throw new Error(maintenanceError);
    }
    
    // Calculate dashboard stats
    const currentDate = new Date();
    const upcomingLeaseEnds = currentTenants.filter(tenant => {
      if (!tenant.lease_end) return false;
      
      const leaseEndDate = new Date(tenant.lease_end);
      const daysUntilLeaseEnd = Math.ceil(
        (leaseEndDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      
      return daysUntilLeaseEnd <= 30 && daysUntilLeaseEnd > 0;
    });
    
    const totalRentDue = currentTenants.reduce((acc, tenant) => acc + (tenant.rent_due || 0), 0);
    
    return {
      data: {
        totalTenants: currentTenants.length,
        pendingMaintenance: pendingMaintenance.length,
        upcomingLeaseEnds: upcomingLeaseEnds.length,
        totalRentDue
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return { data: null, error: handleSupabaseError(error) };
  }
};
