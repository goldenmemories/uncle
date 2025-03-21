import React from 'react';
import { X, Send, CheckCircle } from 'lucide-react';

const EmailModal = ({ emailData, setEmailData, emailStatus, handleSendEmail, handleEmailTemplateChange, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
    <div className="bg-white rounded-lg p-4 w-full max-w-xl max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Send Email</h2>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 p-2"
          disabled={emailStatus === 'sending'}
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {emailStatus === 'sending' ? (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p>Sending email...</p>
        </div>
      ) : emailStatus === 'sent' ? (
        <div className="flex flex-col items-center justify-center py-6">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <p>Email sent successfully!</p>
        </div>
      ) : (
        <>
          {/* Email form fields */}
          {/* Recipients, Template, Subject, Message */}
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-end sm:space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-3 border rounded text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!emailData.subject || !emailData.message || emailData.recipients.length === 0}
              className="px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Send className="h-4 w-4" />
              Send Email
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

export default EmailModal;
