import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { 
  Calendar, Wrench, DollarSign, Users, Mail, 
  Edit, X, Plus, Archive, Menu, ChevronDown, ChevronUp 
} from 'lucide-react';
import { testConnection } from './lib/supabaseClient';
import { tenantService, maintenanceService, getDashboardData } from './services/databaseService';
import TenantForm from './components/TenantForm';
import EmailModal from './components/EmailModal';
import TenantCard from './components/TenantCard';

const TenantManagementSystem = () => {
  const [tenants, setTenants] = useState([]);
  const [editingTenant, setEditingTenant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    recipients: [],
    subject: '',
    message: '',
    templateType: 'custom'
  });
  const [emailStatus, setEmailStatus] = useState(null);
  const [expandedTenant, setExpandedTenant] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalTenants: 0,
    pendingMaintenance: 0,
    upcomingLeaseEnds: 0,
    totalRentDue: 0
  });

  const newTenantTemplate = {
    name: '',
    email: '',
    room: '',
    rent_due: 0,
    last_payment: '',
    maintenance_requests: [],
    contact: '',
    lease_end: '',
    lease_start: '',
    emergency_contact: '',
    emergency_phone: '',
    status: 'current'
  };

  const emailTemplates = {
    rentReminder: {
      subject: "Rent Payment Reminder",
      message: "Dear {name},\n\nThis is a friendly reminder that your rent payment of ${rent_due} is due soon. Please ensure your payment is submitted on time.\n\nThank you,\nStudent Housing Management"
    },
    maintenanceUpdate: {
      subject: "Maintenance Request Update",
      message: "Dear {name},\n\nWe wanted to update you on your maintenance request regarding '{issue}'. Our team is scheduled to address this issue soon.\n\nThank you for your patience,\nStudent Housing Management"
    },
    leaseRenewal: {
      subject: "Lease Renewal Information",
      message: "Dear {name},\n\nYour current lease for Room {room} is set to expire on {lease_end}. We'd like to discuss your options for renewal.\n\nPlease contact the housing office at your earliest convenience.\n\nRegards,\nStudent Housing Management"
    },
    custom: {
      subject: "",
      message: ""
    }
  };

  // Initial data fetch and connection test
  useEffect(() => {
    const initApp = async () => {
      try {
        // Test database connection first
        const connectionTest = await testConnection();
        if (!connectionTest.success) {
          throw new Error(`Database connection failed: ${connectionTest.message}`);
        }
        
        // Fetch data
        await fetchData();
      } catch (err) {
        console.error('Initialization error:', err);
        setError(`System initialization error: ${err.message}. Please refresh the page or contact support.`);
        setLoading(false);
      }
    };
    
    initApp();
  }, []);

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tenants with proper error handling
      const { data: tenantsData, error: tenantsError } = await tenantService.getAllTenants();
      
      if (tenantsError) {
        throw new Error(`Error fetching tenants: ${tenantsError}`);
      }
      
      // Fetch maintenance requests
      const { data: maintenanceData, error: maintenanceError } = await maintenanceService.getAllMaintenanceRequests();
      
      if (maintenanceError) {
        throw new Error(`Error fetching maintenance requests: ${maintenanceError}`);
      }
      
      // Join tenants with their maintenance requests
      const tenantsWithMaintenance = tenantsData.map(tenant => {
        const tenantMaintenance = maintenanceData.filter(
          req => req.tenant_id === tenant.id
        );
        
        return {
          ...tenant,
          maintenance: tenantMaintenance
        };
      });
      
      setTenants(tenantsWithMaintenance);
      
      // Fetch dashboard data
      const { data: dashboardData, error: dashboardError } = await getDashboardData();
      
      if (dashboardError) {
        console.warn(`Dashboard data error: ${dashboardError}`);
        // Don't throw error here, we'll just use calculated data instead
      } else if (dashboardData) {
        setDashboardStats(dashboardData);
      } else {
        // Calculate dashboard data from tenants if the service call failed
        updateDashboardStats(tenantsWithMaintenance);
      }
      
      console.log('Data loaded successfully:', tenantsWithMaintenance.length, 'tenants');
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dashboard stats from tenant data
  const updateDashboardStats = (tenantData) => {
    const currentTenants = tenantData.filter(tenant => tenant.status === 'current');
    
    const stats = {
      totalTenants: currentTenants.length,
      pendingMaintenance: currentTenants.reduce(
        (acc, tenant) => acc + tenant.maintenance.filter(m => m.status === 'pending').length, 0
      ),
      upcomingLeaseEnds: currentTenants.filter(tenant => {
        if (!tenant.lease_end) return false;
        
        const daysUntilLeaseEnd = Math.ceil(
          (new Date(tenant.lease_end) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilLeaseEnd <= 30 && daysUntilLeaseEnd > 0;
      }).length,
      totalRentDue: currentTenants.reduce((acc, tenant) => acc + (tenant.rent_due || 0), 0)
    };
    
    setDashboardStats(stats);
  };

  const handleNewTenant = () => {
    setEditingTenant({...newTenantTemplate});
    setShowNewTenantModal(true);
    setShowMenu(false);
  };

  const handleSaveNewTenant = async () => {
    // Validate required fields
    if (!editingTenant.name || !editingTenant.email || !editingTenant.room) {
      setError('Please fill out all required fields (Name, Email, Room)');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the service to create the tenant
      const { data: newTenant, error: createError } = await tenantService.createTenant({
        name: editingTenant.name,
        email: editingTenant.email,
        room: editingTenant.room,
        rent_due: editingTenant.rent_due,
        last_payment: editingTenant.last_payment,
        contact: editingTenant.contact,
        lease_end: editingTenant.lease_end,
        lease_start: editingTenant.lease_start,
        emergency_contact: editingTenant.emergency_contact,
        emergency_phone: editingTenant.emergency_phone,
        status: 'current'
      });
      
      if (createError) {
        throw new Error(createError);
      }
      
      if (!newTenant) {
        throw new Error('No data returned after creating tenant');
      }
      
      // Add the new tenant to state with an empty maintenance array
      const tenantWithMaintenance = { ...newTenant, maintenance: [] };
      setTenants([...tenants, tenantWithMaintenance]);
      
      // Update dashboard stats
      updateDashboardStats([...tenants, tenantWithMaintenance]);
      
      setShowNewTenantModal(false);
      setEditingTenant(null);
      
      console.log('Tenant added successfully:', newTenant.id);
    } catch (error) {
      console.error('Error adding tenant:', error.message);
      setError(`Failed to add tenant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTenant = async () => {
    // Validate required fields
    if (!editingTenant.name || !editingTenant.email || !editingTenant.room) {
      setError('Please fill out all required fields (Name, Email, Room)');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the service to update the tenant
      const { data: updatedTenant, error: updateError } = await tenantService.updateTenant(
        editingTenant.id,
        {
          name: editingTenant.name,
          email: editingTenant.email,
          room: editingTenant.room,
          rent_due: editingTenant.rent_due,
          last_payment: editingTenant.last_payment,
          contact: editingTenant.contact,
          lease_end: editingTenant.lease_end,
          lease_start: editingTenant.lease_start,
          emergency_contact: editingTenant.emergency_contact,
          emergency_phone: editingTenant.emergency_phone
        }
      );
      
      if (updateError) {
        throw new Error(updateError);
      }
      
      // Update the tenant in the local state
      const updatedTenants = tenants.map(tenant => 
        tenant.id === editingTenant.id ? 
          {...tenant, ...editingTenant, maintenance: tenant.maintenance} : 
          tenant
      );
      
      setTenants(updatedTenants);
      
      // Update dashboard stats
      updateDashboardStats(updatedTenants);
      
      setShowEditModal(false);
      setEditingTenant(null);
      
      console.log('Tenant updated successfully:', editingTenant.id);
    } catch (error) {
      console.error('Error updating tenant:', error.message);
      setError(`Failed to update tenant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveTenant = async (tenantId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the service to archive the tenant
      const { success, error: archiveError } = await tenantService.archiveTenant(tenantId);
      
      if (archiveError) {
        throw new Error(archiveError);
      }
      
      if (!success) {
        throw new Error('Operation failed without specific error');
      }
      
      // Update the tenant in the local state
      const updatedTenants = tenants.map(tenant => 
        tenant.id === tenantId ? 
          {...tenant, status: 'previous'} : 
          tenant
      );
      
      setTenants(updatedTenants);
      
      // Update dashboard stats
      updateDashboardStats(updatedTenants);
      
      console.log('Tenant archived successfully:', tenantId);
    } catch (error) {
      console.error('Error archiving tenant:', error.message);
      setError(`Failed to archive tenant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmailModal = (tenantId = null) => {
    const currentTenants = tenants.filter(tenant => tenant.status === 'current');
    const recipients = tenantId 
      ? [tenants.find(tenant => tenant.id === tenantId)] 
      : currentTenants;
    
    setEmailData({
      recipients,
      subject: '',
      message: '',
      templateType: 'custom'
    });
    setShowEmailModal(true);
    setShowMenu(false);
  };

  const handleEmailTemplateChange = (templateType) => {
    const template = emailTemplates[templateType];
    
    let subject = template.subject;
    let message = template.message;
    
    // If we have a single recipient, we can personalize the template
    if (emailData.recipients.length === 1) {
      const tenant = emailData.recipients[0];
      subject = subject.replace(/{name}/g, tenant.name);
      message = message
        .replace(/{name}/g, tenant.name)
        .replace(/{room}/g, tenant.room || '')
        .replace(/{rent_due}/g, tenant.rent_due || 0)
        .replace(/{lease_end}/g, tenant.lease_end || 'N/A');
      
      // Handle maintenance specific template
      if (templateType === 'maintenanceUpdate' && tenant.maintenance && tenant.maintenance.length > 0) {
        message = message.replace(/{issue}/g, tenant.maintenance[0].issue || 'your request');
      }
    }
    
    setEmailData({
      ...emailData,
      templateType,
      subject,
      message
    });
  };

  const handleSendEmail = async () => {
    try {
      setEmailStatus('sending');
      setError(null);
      
      // Validate email data
      if (!emailData.subject.trim()) {
        throw new Error('Email subject is required');
      }
      
      if (!emailData.message.trim()) {
        throw new Error('Email message is required');
      }
      
      if (emailData.recipients.length === 0) {
        throw new Error('At least one recipient is required');
      }
      
      // Send the email using the Netlify function
      const response = await fetch('/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: emailData.recipients.map(tenant => ({
            email: tenant.email,
            name: tenant.name
          })),
          subject: emailData.subject,
          message: emailData.message
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setEmailStatus('sent');
      // Close the modal after 3 seconds
      setTimeout(() => {
        setEmailStatus(null);
        setShowEmailModal(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error.message);
      setEmailStatus(null);
      setError(`Failed to send email: ${error.message}`);
    }
  };

  const toggleExpandTenant = (tenantId) => {
    if (expandedTenant === tenantId) {
      setExpandedTenant(null);
    } else {
      setExpandedTenant(tenantId);
    }
  };

  const currentTenants = tenants.filter(tenant => tenant.status === 'current');
  const previousTenants = tenants.filter(tenant => tenant.status === 'previous');

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          <p className="ml-2">Loading tenant data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert className="mb-4">
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Mobile Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-3xl font-bold">Student Housing</h1>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-gray-600 sm:hidden"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="bg-white w-3/4 h-full p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Menu</h2>
              <button 
                onClick={() => setShowMenu(false)}
                className="p-2"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => handleOpenEmailModal()}
                className="px-4 py-3 bg-blue-500 text-white rounded flex items-center gap-2"
              >
                <Mail className="h-5 w-5" />
                Email All Tenants
              </button>
              <button
                onClick={handleNewTenant}
                className="px-4 py-3 bg-green-500 text-white rounded flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add New Tenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Action Buttons */}
      <div className="hidden sm:flex justify-end space-x-3 mb-6">
        <button
          onClick={() => handleOpenEmailModal()}
          className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2 hover:bg-blue-600"
        >
          <Mail className="h-5 w-5" />
          Email All Tenants
        </button>
        <button
          onClick={handleNewTenant}
          className="px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2 hover:bg-green-600"
        >
          <Plus className="h-5 w-5" />
          Add New Tenant
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4 px-3 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Current Tenants</p>
                <p className="text-lg sm:text-2xl font-bold">{dashboardStats.totalTenants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 px-3 pb-3">
            <div className="flex items-center space-x-2">
              <Wrench className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Maintenance</p>
                <p className="text-lg sm:text-2xl font-bold">{dashboardStats.pendingMaintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 px-3 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Lease Ends</p>
                <p className="text-lg sm:text-2xl font-bold">{dashboardStats.upcomingLeaseEnds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 px-3 pb-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Rent</p>
                <p className="text-lg sm:text-2xl font-bold">${dashboardStats.totalRentDue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Tenants */}
      <Card className="mb-6">
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-lg sm:text-xl">Current Tenants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {currentTenants.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500">
              No current tenants found. Add your first tenant!
            </div>
          ) : (
            <div className="divide-y">
              {currentTenants.map(tenant => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  isExpanded={expandedTenant === tenant.id}
                  onToggleExpand={() => toggleExpandTenant(tenant.id)}
                  onEmail={() => handleOpenEmailModal(tenant.id)}
                  onEdit={() => {
                    setEditingTenant({...tenant});
                    setShowEditModal(true);
                  }}
                  onArchive={() => handleArchiveTenant(tenant.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Tenants */}
      {previousTenants.length > 0 && (
        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-lg sm:text-xl">Previous Tenants</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {previousTenants.map(tenant => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  isExpanded={expandedTenant === tenant.id}
                  onToggleExpand={() => toggleExpandTenant(tenant.id)}
                  isPrevious
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showEditModal && (
        <TenantForm
          editingTenant={editingTenant}
          setEditingTenant={setEditingTenant}
          title="Edit Tenant Information"
          onSave={handleUpdateTenant}
          onCancel={() => {
            setShowEditModal(false);
            setEditingTenant(null);
          }}
        />
      )}

      {showNewTenantModal && (
        <TenantForm
          editingTenant={editingTenant}
          setEditingTenant={setEditingTenant}
          title="Add New Tenant"
          onSave={handleSaveNewTenant}
          onCancel={() => {
            setShowNewTenantModal(false);
            setEditingTenant(null);
          }}
        />
      )}

      {showEmailModal && (
        <EmailModal
          emailData={emailData}
          setEmailData={setEmailData}
          emailStatus={emailStatus}
          handleSendEmail={handleSendEmail}
          handleEmailTemplateChange={handleEmailTemplateChange}
          onClose={() => {
            setShowEmailModal(false);
            setEmailStatus(null);
          }}
        />
      )}
    </div>
  );
};

export default TenantManagementSystem;
