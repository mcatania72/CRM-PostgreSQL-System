import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">CRM</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            CRM PostgreSQL System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enterprise-ready Customer Relationship Management
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;