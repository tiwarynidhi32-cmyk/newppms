/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './modules/Login';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './modules/DashboardHome';
import CustomersModule from './modules/CustomersModule';
import JobsModule from './modules/JobsModule';
import InventoryModule from './modules/InventoryModule';
import BillingModule from './modules/BillingModule';
import DeliveryModule from './modules/DeliveryModule';
import ReportsModule from './modules/ReportsModule';
import SettingsModule from './modules/SettingsModule';
import EstimatesModule from './modules/QuotationModule';
import PricingAdminModule from './modules/PricingAdminModule';
import LeadModule from './modules/LeadModule';
import JobDetailsModule from './modules/JobDetailsModule';
import ProductionModule from './modules/ProductionModule';
import JobCardModule from './modules/JobCardModule';
import AccountingModule from './modules/AccountingModule';
import PurchaseModule from './modules/PurchaseModule';
import CRMModule from './modules/CRMModule';
import SupportModule from './modules/SupportModule';
import StaffModule from './modules/StaffModule';
import MachinesModule from './modules/MachinesModule';
import ProjectsModule from './modules/ProjectsModule';
import ContractorsModule from './modules/ContractorsModule';
import SecurityWrapper from './components/SecurityWrapper';

export default function App() {
  return (
    <SecurityWrapper>
      <div className="min-h-screen bg-app-bg no-select">
      <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={
          <DashboardLayout activeTab="dashboard">
            <DashboardHome />
          </DashboardLayout>
        } />

        <Route path="/customers" element={
          <DashboardLayout activeTab="customers">
            <CustomersModule />
          </DashboardLayout>
        } />

        <Route path="/leads" element={
          <DashboardLayout activeTab="leads">
            <LeadModule />
          </DashboardLayout>
        } />

        <Route path="/pricing-admin" element={
          <DashboardLayout activeTab="pricing-admin">
            <PricingAdminModule />
          </DashboardLayout>
        } />

        <Route path="/estimates" element={
          <DashboardLayout activeTab="estimates">
            <EstimatesModule />
          </DashboardLayout>
        } />
        
        <Route path="/job-details" element={
          <DashboardLayout activeTab="job-details">
            <JobDetailsModule />
          </DashboardLayout>
        } />

        <Route path="/job-card" element={
          <DashboardLayout activeTab="job-card">
            <JobCardModule />
          </DashboardLayout>
        } />

        <Route path="/jobs" element={
          <DashboardLayout activeTab="jobs">
            <JobsModule />
          </DashboardLayout>
        } />

        <Route path="/production" element={
          <DashboardLayout activeTab="production">
            <ProductionModule />
          </DashboardLayout>
        } />

        <Route path="/inventory" element={
          <DashboardLayout activeTab="inventory">
            <InventoryModule />
          </DashboardLayout>
        } />

        <Route path="/billing" element={
          <DashboardLayout activeTab="billing">
            <BillingModule />
          </DashboardLayout>
        } />

        <Route path="/accounting" element={
          <DashboardLayout activeTab="accounting">
            <AccountingModule />
          </DashboardLayout>
        } />

        <Route path="/purchase" element={
          <DashboardLayout activeTab="purchase">
            <PurchaseModule />
          </DashboardLayout>
        } />

        <Route path="/crm" element={
          <DashboardLayout activeTab="crm">
            <CRMModule />
          </DashboardLayout>
        } />

        <Route path="/delivery" element={
          <DashboardLayout activeTab="delivery">
            <DeliveryModule />
          </DashboardLayout>
        } />

        <Route path="/reports" element={
          <DashboardLayout activeTab="reports">
            <ReportsModule />
          </DashboardLayout>
        } />

        <Route path="/settings" element={
          <DashboardLayout activeTab="settings">
            <SettingsModule />
          </DashboardLayout>
        } />

        <Route path="/support" element={
          <DashboardLayout activeTab="support">
            <SupportModule />
          </DashboardLayout>
        } />

        <Route path="/staff" element={
          <DashboardLayout activeTab="staff">
            <StaffModule />
          </DashboardLayout>
        } />

        <Route path="/machines" element={
          <DashboardLayout activeTab="machines">
            <MachinesModule />
          </DashboardLayout>
        } />

        <Route path="/projects" element={
          <DashboardLayout activeTab="projects">
            <ProjectsModule />
          </DashboardLayout>
        } />

        <Route path="/contractors" element={
          <DashboardLayout activeTab="contractors">
            <ContractorsModule />
          </DashboardLayout>
        } />

        {/* Home redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      </Router>
    </div>
    </SecurityWrapper>
  );
}
