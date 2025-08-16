# Financial Management Package

A comprehensive financial management system for training programs with advanced features including budget planning, cost tracking, invoice generation, payment processing, ROI analysis, SSG funding integration, and financial reporting.

## Features

### 🏦 Budget Planning & Management

- **Multi-year budget planning** with scenario modeling
- **Budget categories** with approval workflows
- **Budget variance analysis** with real-time monitoring
- **Scenario planning** (optimistic, realistic, pessimistic)
- **Budget templates** for common training programs
- **Approval workflows** with multi-level authorization

### 💰 Cost Tracking

- **Granular cost tracking** per participant, course, and resource
- **Cost allocation** with multiple methods (equal split, proportional, activity-based)
- **Cost center management** with hierarchical organization
- **Resource cost tracking** with depreciation calculations
- **Cost driver analysis** for better understanding of cost factors
- **Real-time cost monitoring** with alerts and notifications

### 📄 Invoice Generation

- **Automated invoice generation** with customizable templates
- **Multi-currency support** with real-time exchange rates
- **Tax calculations** (GST, VAT, etc.) with jurisdiction support
- **Discount management** (early bird, bulk, promotional)
- **Payment terms** with installment plans
- **Batch invoicing** for multiple participants
- **PDF generation** with professional templates

### 💳 Payment Processing

- **Multi-gateway support** (Stripe, PayPal, PayNow, NETS)
- **Partial payment handling** with automatic tracking
- **Payment reconciliation** with automated matching
- **Refund management** with full audit trails
- **Digital wallet integration** (DBS PayLah, GrabPay)
- **Corporate account billing** with extended terms

### 📊 ROI Analysis

- **Advanced ROI calculations** with business impact metrics
- **Training effectiveness measurement** with performance correlations
- **Cost-benefit analysis** with comprehensive reporting
- **Productivity impact assessment** with before/after comparisons
- **Revenue attribution** to training programs
- **Long-term ROI tracking** with trend analysis

### 🏛️ SSG Funding Integration

- **Complete SSG scheme integration** (Enhanced, Course Fee Grant, Absentee Payroll)
- **Automated claim submission** with validation
- **Compliance monitoring** with audit trails
- **Funding eligibility verification** with real-time checks
- **Subsidy tracking** with detailed reporting
- **Government grant management** with deadline tracking

### 📈 Financial Reporting

- **Real-time dashboards** with drill-down capabilities
- **Customizable reports** with export options
- **Financial KPI tracking** with benchmarking
- **Cash flow analysis** with forecasting
- **Profit & loss statements** with detailed breakdowns
- **Budget vs. actual comparisons** with variance analysis

### 🔮 Forecasting & Analytics

- **Predictive analytics** for budget planning
- **Machine learning-powered forecasting** with trend analysis
- **Resource allocation optimization** with constraint management
- **Demand forecasting** for training programs
- **Financial risk assessment** with mitigation strategies
- **Scenario modeling** with Monte Carlo simulations

### 🔒 Compliance & Audit

- **Complete audit trails** for all financial transactions
- **Approval workflows** with digital signatures
- **Compliance reporting** for regulatory requirements
- **Data retention policies** with automated archiving
- **Security controls** with role-based access
- **External auditor support** with data export capabilities

## Installation

```bash
npm install @tmslms/financial-management
```

## Quick Start

```typescript
import {
  BudgetPlanningService,
  CostTrackingService,
  InvoiceGenerationService,
  Currency,
  BudgetType,
  CostCategory,
} from '@tmslms/financial-management';

// Initialize services
const budgetService = new BudgetPlanningService();
const costService = new CostTrackingService();
const invoiceService = new InvoiceGenerationService();

// Create a training budget
const budget = await budgetService.createBudget({
  name: 'Q1 2024 Training Budget',
  type: BudgetType.QUARTERLY,
  organizationId: 'org-123',
  fiscalYear: 2024,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-03-31'),
  totalAllocated: {
    amount: new Decimal(50000),
    currency: Currency.SGD,
  },
  categories: [
    {
      category: CostCategory.COURSE_FEES,
      name: 'Course Fees',
      allocated: { amount: new Decimal(30000), currency: Currency.SGD },
    },
    {
      category: CostCategory.INSTRUCTOR_FEES,
      name: 'Instructor Fees',
      allocated: { amount: new Decimal(15000), currency: Currency.SGD },
    },
  ],
  createdBy: 'user-123',
});

// Track course costs
const courseCost = await costService.trackCourseCost('course-456', {
  description: 'Digital Marketing Training',
  category: CostCategory.COURSE_FEES,
  type: CostType.DIRECT,
  amount: { amount: new Decimal(5000), currency: Currency.SGD },
  perParticipantCost: { amount: new Decimal(500), currency: Currency.SGD },
  incurredDate: new Date(),
  createdBy: 'user-123',
});

// Generate invoice
const invoice = await invoiceService.createCourseInvoice({
  courseId: 'course-456',
  courseName: 'Digital Marketing Masterclass',
  participantId: 'participant-789',
  organizationId: 'org-123',
  customerInfo: {
    name: 'John Doe',
    email: 'john.doe@company.com',
  },
  billingAddress: {
    line1: '123 Business Street',
    city: 'Singapore',
    postalCode: '123456',
    country: 'Singapore',
  },
  courseFee: { amount: new Decimal(500), currency: Currency.SGD },
  paymentTerms: { dueDays: 30, acceptedMethods: [PaymentMethod.BANK_TRANSFER] },
  createdBy: 'user-123',
});
```

## Advanced Usage

### Multi-Year Budget Planning

```typescript
// Create a 3-year strategic budget plan
const multiYearPlan = await budgetService.createMultiYearPlan({
  name: 'Strategic Training Plan 2024-2026',
  organizationId: 'org-123',
  startYear: 2024,
  numberOfYears: 3,
  baseAllocations: {
    [CostCategory.COURSE_FEES]: {
      amount: new Decimal(100000),
      currency: Currency.SGD,
    },
    [CostCategory.INSTRUCTOR_FEES]: {
      amount: new Decimal(60000),
      currency: Currency.SGD,
    },
    [CostCategory.TECHNOLOGY]: {
      amount: new Decimal(40000),
      currency: Currency.SGD,
    },
  },
  growthAssumptions: {
    [CostCategory.COURSE_FEES]: 5, // 5% annual growth
    [CostCategory.INSTRUCTOR_FEES]: 8, // 8% annual growth
    [CostCategory.TECHNOLOGY]: 10, // 10% annual growth
  },
  marketFactors: [
    {
      name: 'inflation',
      impact: 3.0,
      confidence: 85,
      description: 'Expected inflation impact',
    },
  ],
  createdBy: 'user-123',
});
```

### Advanced Cost Analysis

```typescript
// Generate comprehensive cost analysis
const costAnalysis = await costService.generateCostAnalysis({
  organizationId: 'org-123',
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-03-31'),
  },
  groupBy: 'category',
  includeComparisons: true,
  includeTrends: true,
});

console.log(
  `Total Cost: ${costAnalysis.totalCost.currency} ${costAnalysis.totalCost.amount}`
);
console.log(
  `Average Cost: ${costAnalysis.averageCost.currency} ${costAnalysis.averageCost.amount}`
);
console.log(`Top Categories:`, costAnalysis.topCategories);
```

### Budget Scenario Planning

```typescript
// Generate budget scenarios with custom assumptions
const scenarios = await budgetService.generateScenarios(budget.id, {
  includeOptimistic: true,
  includePessimistic: true,
  customAssumptions: {
    inflationRate: 4.0,
    demandGrowth: 20,
    costEfficiency: 15,
  },
  marketFactors: [
    {
      name: 'Digital Transformation',
      impact: 25,
      confidence: 70,
      description: 'Impact of digital transformation on training demand',
    },
  ],
});

scenarios.forEach((scenario) => {
  console.log(`${scenario.name}: ${scenario.confidenceLevel}% confidence`);
  scenario.projections.forEach((projection) => {
    console.log(
      `  ${projection.category}: ${projection.projected.currency} ${projection.projected.amount}`
    );
  });
});
```

### Batch Invoice Generation

```typescript
// Create invoices for multiple participants
const batchInvoices = await invoiceService.createBatchInvoices({
  organizationId: 'org-123',
  courseId: 'course-456',
  courseName: 'Leadership Excellence Program',
  courseFee: { amount: new Decimal(1500), currency: Currency.SGD },
  participants: [
    {
      participantId: 'participant-001',
      customerInfo: { name: 'Alice Smith', email: 'alice@company.com' },
      billingAddress: {
        /* address details */
      },
      customizations: {
        discounts: [
          {
            type: DiscountType.EARLY_BIRD,
            name: 'Early Bird Discount',
            percentage: 10,
          },
        ],
        fundingSource: FundingSource.SSG_ENHANCED,
      },
    },
    // ... more participants
  ],
  paymentTerms: { dueDays: 30, acceptedMethods: [PaymentMethod.BANK_TRANSFER] },
  autoSend: true,
  createdBy: 'user-123',
});
```

## API Reference

### BudgetPlanningService

#### Methods

- `createBudget(budgetData)` - Create a new budget
- `createBudgetFromTemplate(templateName, customizations)` - Create budget from template
- `createMultiYearPlan(planData)` - Create multi-year budget plan
- `generateScenarios(budgetId, options)` - Generate budget scenarios
- `analyzeBudgetVariance(budgetId)` - Analyze budget variance
- `generateBudgetForecast(budgetId, options)` - Generate budget forecast

#### Events

- `budgetCreated` - Emitted when a budget is created
- `scenariosGenerated` - Emitted when scenarios are generated
- `varianceAnalyzed` - Emitted when variance analysis is completed
- `forecastGenerated` - Emitted when forecast is generated

### CostTrackingService

#### Methods

- `createCostRecord(costData)` - Create a new cost record
- `trackParticipantCost(participantId, costData)` - Track participant-specific costs
- `trackCourseCost(courseId, costData)` - Track course-specific costs
- `trackResourceCost(resourceId, costData)` - Track resource costs
- `generateCostAnalysis(options)` - Generate comprehensive cost analysis
- `allocateCost(costId, costCenterId, amount, method)` - Allocate costs to cost centers

#### Events

- `costRecordCreated` - Emitted when a cost record is created
- `participantCostTracked` - Emitted when participant cost is tracked
- `courseCostTracked` - Emitted when course cost is tracked
- `resourceCostTracked` - Emitted when resource cost is tracked
- `costAllocated` - Emitted when cost is allocated

### InvoiceGenerationService

#### Methods

- `createInvoice(invoiceData)` - Create a new invoice
- `createCourseInvoice(courseData)` - Create invoice for course enrollment
- `createBatchInvoices(batchData)` - Create multiple invoices
- `sendInvoice(invoiceId, sendOptions)` - Send invoice to customer
- `processPayment(invoiceId, paymentData)` - Process payment for invoice
- `generateInvoicePDF(invoice, templateId)` - Generate PDF document

#### Events

- `invoiceCreated` - Emitted when an invoice is created
- `invoiceSent` - Emitted when an invoice is sent
- `paymentProcessed` - Emitted when payment is processed

## Configuration

### Environment Variables

```bash
# Database Configuration
FINANCIAL_DB_HOST=localhost
FINANCIAL_DB_PORT=5432
FINANCIAL_DB_NAME=tmslms_financial
FINANCIAL_DB_USER=postgres
FINANCIAL_DB_PASSWORD=password

# Payment Gateway Configuration
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# SSG Integration
SSG_API_URL=https://api.ssg-wsg.gov.sg
SSG_CLIENT_ID=...
SSG_CLIENT_SECRET=...

# Email Configuration
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@tmslms.com

# Accounting Integration
QUICKBOOKS_CLIENT_ID=...
QUICKBOOKS_CLIENT_SECRET=...
XERO_CLIENT_ID=...
XERO_CLIENT_SECRET=...
```

### Configuration Object

```typescript
import { DEFAULT_CONFIG } from '@tmslms/financial-management';

const config = {
  ...DEFAULT_CONFIG,
  defaultCurrency: 'SGD',
  defaultTaxRate: 7,
  enableSSGIntegration: true,
  paymentGateways: {
    stripe: {
      enabled: true,
      publicKey: process.env.STRIPE_PUBLIC_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
    },
    paypal: {
      enabled: true,
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      sandbox: true,
    },
  },
  accounting: {
    quickbooks: {
      enabled: true,
      clientId: process.env.QUICKBOOKS_CLIENT_ID,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
    },
  },
};
```

## Integration Examples

### React Component Integration

```typescript
import React, { useState, useEffect } from 'react';
import { BudgetPlanningService, Budget } from '@tmslms/financial-management';

const BudgetDashboard: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const budgetService = new BudgetPlanningService();

  useEffect(() => {
    const loadBudgets = async () => {
      const orgBudgets = await budgetService.getBudgets({
        organizationId: 'org-123',
        status: BudgetStatus.ACTIVE
      });
      setBudgets(orgBudgets);
    };

    loadBudgets();
  }, []);

  return (
    <div className="budget-dashboard">
      <h2>Active Budgets</h2>
      {budgets.map(budget => (
        <div key={budget.id} className="budget-card">
          <h3>{budget.name}</h3>
          <p>Total: {budget.totalAllocated.currency} {budget.totalAllocated.amount.toFixed(2)}</p>
          <p>Spent: {budget.totalSpent.currency} {budget.totalSpent.amount.toFixed(2)}</p>
          <p>Remaining: {budget.totalRemaining.currency} {budget.totalRemaining.amount.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};
```

### Express.js API Integration

```typescript
import express from 'express';
import { InvoiceGenerationService } from '@tmslms/financial-management';

const app = express();
const invoiceService = new InvoiceGenerationService();

app.post('/api/invoices', async (req, res) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/invoices/:id/pdf', async (req, res) => {
  try {
    const invoice = await invoiceService.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const pdfBuffer = await invoiceService.generateInvoicePDF(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@tmslms.com or create an issue in the repository.

## Changelog

### Version 1.0.0

- Initial release with core financial management features
- Budget planning and management
- Cost tracking and allocation
- Invoice generation and processing
- Basic payment processing
- SSG funding integration (Phase 1)
- Financial reporting foundation

### Roadmap

#### Version 1.1.0 (Next)

- [ ] Complete payment processing service
- [ ] Advanced ROI analysis features
- [ ] Enhanced SSG funding integration
- [ ] Real-time financial dashboards
- [ ] Machine learning forecasting
- [ ] Advanced compliance features

#### Version 1.2.0 (Future)

- [ ] Multi-organization support
- [ ] Advanced workflow automation
- [ ] Mobile app integration
- [ ] Blockchain-based audit trails
- [ ] AI-powered financial insights
- [ ] Advanced integration marketplace
