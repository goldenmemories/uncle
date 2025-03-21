import React from 'react';
import { X } from 'lucide-react';

const TenantForm = ({ editingTenant, setEditingTenant, onSave, onCancel, title }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
    <div className="bg-white rounded-lg p-4 w-full max-w-xl max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button 
          onClick={onCancel} 
          className="text-gray-500 hover:text-gray-700 p-2"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Form fields */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={editingTenant?.name || ''}
            onChange={(e) => setEditingTenant({...editingTenant, name: e.target.value})}
            className="w-full p-3 border rounded text-base"
          />
        </div>

        {/* Add all other form fields here */}
        
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-end sm:space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-3 border rounded text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
        >
          Save
        </button>
      </div>
    </div>
  </div>
);

export default TenantForm;
