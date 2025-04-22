import React, { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/home";
import EhrFormPage from "@/pages/ehr-form";
import EhrListPage from "@/pages/ehr-list";
import ClientFormPage from "@/pages/client-form";
import ClientListPage from "@/pages/client-list";
import DataHistoryPage from "@/pages/data-history";
import LoadingPage from "@/pages/loading";
import NavigationPage from "@/pages/navigation";

// Import Amplify and configuration
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from '../../src/aws-exports';

// Configure Amplify with your AWS resources
Amplify.configure(awsconfig);

// Custom Authentication Component
const AuthComponent = () => {
  const [authState, setAuthState] = useState('signIn'); // 'signIn', 'signUp', 'forgotPassword', 'resetPassword'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  
  // Check if user is already authenticated
  useEffect(() => {
    checkAuthState();
  }, []);
  
  const checkAuthState = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setUser(user);
      setLoading(false);
    } catch (error) {
      setUser(null);
      setLoading(false);
    }
  };
  
  // Sign In handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await Auth.signIn(email, password);
      setUser(user);
    } catch (error) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };
  
  // Sign Up handler
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
        }
      });
      setAuthState('confirmSignUp');
    } catch (error) {
      setError((error instanceof Error ? error.message : 'Failed to sign up'));
    } finally {
      setLoading(false);
    }
  };
  
  // Confirm Sign Up handler
  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await Auth.confirmSignUp(email, code);
      setAuthState('signIn');
    } catch (error) {
      setError((error instanceof Error ? error.message : 'Failed to confirm sign up'));
    } finally {
      setLoading(false);
    }
  };
  
  // Forgot Password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await Auth.forgotPassword(email);
      setAuthState('resetPassword');
    } catch (error) {
      setError((error instanceof Error ? error.message : 'Failed to initiate password reset'));
    } finally {
      setLoading(false);
    }
  };
  
  // Reset Password handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      await Auth.forgotPasswordSubmit(email, code, password);
      setAuthState('signIn');
    } catch (error) {
      setError((error instanceof Error ? error.message : 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };
  
  // Sign Out handler
  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Render auth forms based on state
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          )}
          
          {/* Sign In Form */}
          {authState === 'signIn' && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Sign In</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Or{' '}
                  <button 
                    onClick={() => setAuthState('signUp')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    create a new account
                  </button>
                </p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <button 
                      type="button"
                      onClick={() => setAuthState('forgotPassword')}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </>
          )}
          
          {/* Sign Up Form */}
          {authState === 'signUp' && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Create an account</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Or{' '}
                  <button 
                    onClick={() => setAuthState('signIn')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    sign in to your account
                  </button>
                </p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Confirm Password"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            </>
          )}
          
          {/* Confirm Sign Up Form */}
          {authState === 'confirmSignUp' && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Confirm your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Check your email for the confirmation code
                </p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleConfirmSignUp}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmation-code" className="sr-only">Confirmation Code</label>
                    <input
                      id="confirmation-code"
                      name="code"
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Confirmation Code"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Confirm Sign Up
                  </button>
                </div>
                <div className="text-sm text-center">
                  <button 
                    type="button"
                    onClick={() => setAuthState('signIn')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </>
          )}
          
          {/* Forgot Password Form */}
          {authState === 'forgotPassword' && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Reset your password</h2>
                <p className="mt-2 text-sm text-gray-600">
                  We'll send a code to your email
                </p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
                <div className="rounded-md shadow-sm">
                  <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Send Reset Code
                  </button>
                </div>
                <div className="text-sm text-center">
                  <button 
                    type="button"
                    onClick={() => setAuthState('signIn')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </>
          )}
          
          {/* Reset Password Form */}
          {authState === 'resetPassword' && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Create new password</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter the code sent to your email
                </p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmation-code" className="sr-only">Confirmation Code</label>
                    <input
                      id="confirmation-code"
                      name="code"
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Confirmation Code"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="sr-only">New Password</label>
                    <input
                      id="new-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="New Password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Confirm Password"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Reset Password
                  </button>
                </div>
                <div className="text-sm text-center">
                  <button 
                    type="button"
                    onClick={() => setAuthState('signIn')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Router Component
  const Router = () => {
    return (
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/ehr-form" component={EhrFormPage} />
        <Route path="/ehr-form/:id" component={EhrFormPage} />
        <Route path="/ehr-list" component={EhrListPage} />
        <Route path="/client-form" component={ClientFormPage} />
        <Route path="/client-list" component={ClientListPage} />
        <Route path="/data-history" component={DataHistoryPage} />
        <Route path="/loading" component={LoadingPage} />
        <Route path="/navigation" component={NavigationPage} />
        <Route component={NotFound} />
      </Switch>
    );
  };

  // Return main app if authenticated
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        {/* Pass handleSignOut to Navbar */}
        <Navbar handleSignOut={handleSignOut} />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
};

// Main App Component
function App(): JSX.Element {
  return <AuthComponent />;
}

export default App;