// src/contexts/CustomerAuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ 
  children,
  shopId 
}: { 
  children: React.ReactNode;
  shopId: string;
}) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if customer is logged in
    const storedCustomer = localStorage.getItem(`customer_${shopId}`);
    if (storedCustomer) {
      setCustomer(JSON.parse(storedCustomer));
    }
    setLoading(false);
  }, [shopId]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, email, password }),
      });

      if (response.ok) {
        const customerData = await response.json();
        setCustomer(customerData);
        localStorage.setItem(`customer_${shopId}`, JSON.stringify(customerData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, ...data }),
      });

      if (response.ok) {
        const customerData = await response.json();
        setCustomer(customerData);
        localStorage.setItem(`customer_${shopId}`, JSON.stringify(customerData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem(`customer_${shopId}`);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!customer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}