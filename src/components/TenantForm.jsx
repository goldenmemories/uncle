import React, { useState } from 'react';
import { X } from 'lucide-react';

const TenantForm = ({ 
  editingTenant, 
  setEditingTenant, 
  title, 
  onSave, 
  onCancel 
}) => {
  const [errors, setErrors] = useState({});

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingTenant({
      ...editingTenant,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Check required fields
    if (!editingTenant.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!editingTenant.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editingTenant.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!editingTenant.room?.trim()) {
      newErrors.room = 'Room number is required';
    }
    
    // Add other validations as needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-y-auto pt-10 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Name - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={editingTenant.name || ''}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Full Name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            
            {/* Email - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={editingTenant.email || ''}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Email Address"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            
            {/* Room - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="room"
                value={editingTenant.room || ''}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.room ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Room Number"
              />
              {errors.room && <p className="mt-1 text-xs text-red-500">{errors.room}</p>}
            </div>
            
            {/* Rent Due */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent Due
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  name="rent_due"
                  value={editingTenant.rent_due || ''}
                  onChange={handleChange}
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            {/* Last Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Payment Date
              </label>
              <input
                type="date"
                name="last_payment"
                value={editingTenant.last_payment || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contact"
                value={editingTenant.contact || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Phone Number"
              />
            </div>
            
            {/* Lease Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lease Start Date
              </label>
              <input
                type="date"
                name="lease_start"
                value={editingTenant.lease_start || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Lease End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lease End Date
              </label>
              <input
                type="date"
                name="lease_end"
                value={editingTenant.lease_end || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                name="emergency_contact"
                value={editingTenant.emergency_contact || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Emergency Contact Person"
              />
            </div>
            
            {/* Emergency Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                name="emergency_phone"
                value={editingTenant.emergency_phone || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Emergency Phone Number"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantForm;
