// ============================================================================
// FINANCIAL MANAGEMENT PACKAGE - MAIN EXPORTS
// ============================================================================

// Export all types
export * from './types';

// Export services
export { BudgetPlanningService } from './services/BudgetPlanningService';
export { CostTrackingService } from './services/CostTrackingService';
export { InvoiceGenerationService } from './services/InvoiceGenerationService';
export { PaymentProcessingService } from './services/PaymentProcessingService';

// Export utilities (to be implemented)
// export { FinancialCalculator } from './utils/FinancialCalculator';
// export { CurrencyConverter } from './utils/CurrencyConverter';
// export { ReportGenerator } from './utils/ReportGenerator';

// Export integrations (to be implemented)
// export { PaymentGatewayIntegration } from './integrations/PaymentGatewayIntegration';
// export { AccountingIntegration } from './integrations/AccountingIntegration';
// export { SSGFundingIntegration } from './integrations/SSGFundingIntegration';

// Export additional services (to be implemented)
// export { PaymentProcessingService } from './services/PaymentProcessingService';
// export { ROIAnalysisService } from './services/ROIAnalysisService';
// export { SSGFundingService } from './services/SSGFundingService';
// export { FinancialReportingService } from './services/FinancialReportingService';
// export { FinancialForecastingService } from './services/FinancialForecastingService';
// export { ComplianceService } from './services/ComplianceService';

// Package version and metadata
export const FINANCIAL_MANAGEMENT_VERSION = '1.0.0';
export const SUPPORTED_CURRENCIES = [
  'SGD',
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'HKD',
  'MYR',
  'THB',
  'INR',
];

// Default configuration
export const DEFAULT_CONFIG = {
  defaultCurrency: 'SGD',
  defaultTaxRate: 7, // Singapore GST
  defaultPaymentTerms: 30, // 30 days
  enableSSGIntegration: true,
  enableMultiCurrency: true,
  enableAdvancedReporting: true,
  enableForecastingML: true,
};
