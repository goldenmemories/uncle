import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Edit, Archive, ChevronDown, ChevronUp } from 'lucide-react';

const TenantCard = ({ 
  tenant, 
  isExpanded, 
  onToggleExpand, 
  onEmail, 
  onEdit, 
  onArchive,
  isPrevious = false
}) => {
  return (
    <div className="px-4 py-3 sm:px-6 sm:py-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{tenant.name}</h3>
          {isExpanded ? 
            <ChevronUp className="h-4 w-4 text-gray-500" /> : 
            <ChevronDown className="h-4 w-4 text-gray-500" />
          }
        </div>
        
        {!isPrevious && (
          <div className="flex">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEmail();
              }}
              className="p-2 text-gray-500 hover:text-blue-500"
              aria-label="Email tenant"
            >
              <Mail className="h-5 w-5" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-gray-500 hover:text-blue-500"
              aria-label="Edit tenant"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
              className="p-2 text-gray-500 hover:text-red-500"
              aria-label="Archive tenant"
            >
              <Archive className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div>
              <p>Room: {tenant.room}</p>
              <p>Phone: {tenant.contact}</p>
              <p>Email: {tenant.email}</p>
            </div>
            <div>
              <p className="font-semibold">Rent Due: ${tenant.rent_due}</p>
              <p>Last Payment: {tenant.last_payment}</p>
              <p>Lease: {tenant.lease_start} to {tenant.lease_end}</p>
            </div>
          </div>
          
          {!isPrevious && tenant.maintenance && tenant.maintenance.length > 0 && (
            <Alert className="mt-3">
              <AlertDescription>
                Maintenance Request: {tenant.maintenance[0].issue}
                <span className="ml-2 text-yellow-600">
                  ({tenant.maintenance[0].status})
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default TenantCard;
