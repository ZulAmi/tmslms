import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import {
  Invoice,
  InvoiceType,
  InvoiceStatus,
  InvoiceLineItem,
  LineItemType,
  InvoiceDiscount,
  InvoiceTax,
  CustomerInfo,
  Address,
  PaymentTerms,
  PaymentRecord,
  InvoiceDocument,
  InvoiceNote,
  Money,
  Currency,
  UUID,
  createUUID,
  FundingSource,
  DiscountType,
  TaxType,
  FinancialCalculation,
  CostCategory,
  PaymentGateway,
  PaymentStatus,
} from '../types';

/**
 * Comprehensive Invoice Generation Service
 * Automated invoicing with integration to accounting systems
 */
export class InvoiceGenerationService extends EventEmitter {
  private invoices: Map<UUID, Invoice> = new Map();
  private templates: Map<string, InvoiceTemplate> = new Map();
  private sequences: Map<string, InvoiceSequence> = new Map();
  private integrations: Map<string, AccountingIntegration> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
    this.initializeSequences();
  }

  // ============================================================================
  // INVOICE CREATION AND MANAGEMENT
  // ============================================================================

  /**
   * Create a new invoice with comprehensive details
   */
  async createInvoice(invoiceData: {
    type: InvoiceType;
    organizationId: UUID;
    customerId: UUID;
    customerInfo: CustomerInfo;
    billingAddress: Address;
    shippingAddress?: Address;
    lineItems: Partial<InvoiceLineItem>[];
    discounts?: Partial<InvoiceDiscount>[];
    taxes?: Partial<InvoiceTax>[];
    terms: PaymentTerms;
    dueDate?: Date;
    notes?: string[];
    tags?: string[];
    templateId?: string;
    autoSend?: boolean;
    metadata?: Record<string, any>;
    createdBy: UUID;
  }): Promise<Invoice> {
    const id = createUUID(uuidv4());
    const now = new Date();

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(
      invoiceData.organizationId,
      invoiceData.type
    );

    // Process line items
    const lineItems = await this.processLineItems(invoiceData.lineItems);

    // Calculate subtotal
    const subtotal = this.calculateSubtotal(lineItems);

    // Process discounts
    const discounts = this.processDiscounts(
      invoiceData.discounts || [],
      lineItems
    );

    // Process taxes
    const taxes = this.processTaxes(
      invoiceData.taxes || [],
      lineItems,
      discounts
    );

    // Calculate total
    const total = this.calculateTotal(subtotal, discounts, taxes);

    // Calculate due date if not provided
    const dueDate =
      invoiceData.dueDate || this.calculateDueDate(invoiceData.terms, now);

    const invoice: Invoice = {
      id,
      invoiceNumber,
      type: invoiceData.type,
      status: InvoiceStatus.DRAFT,
      organizationId: invoiceData.organizationId,
      customerId: invoiceData.customerId,
      customerInfo: invoiceData.customerInfo,
      billingAddress: invoiceData.billingAddress,
      shippingAddress: invoiceData.shippingAddress,
      lineItems,
      subtotal,
      discounts,
      taxes,
      total,
      terms: invoiceData.terms,
      dueDate,
      paymentHistory: [],
      remainingBalance: total,
      documents: [],
      notes: this.processNotes(invoiceData.notes || []),
      tags: invoiceData.tags || [],
      metadata: invoiceData.metadata || {},
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy: invoiceData.createdBy,
    };

    this.invoices.set(id, invoice);

    // Generate PDF document
    await this.generateInvoicePDF(invoice, invoiceData.templateId);

    // Auto-send if requested
    if (invoiceData.autoSend) {
      await this.sendInvoice(id, {
        method: 'email',
        recipient: invoiceData.customerInfo.email,
      });
    }

    this.emit('invoiceCreated', { invoice });

    return invoice;
  }

  /**
   * Create invoice from course enrollment
   */
  async createCourseInvoice(courseData: {
    courseId: UUID;
    courseName: string;
    participantId: UUID;
    organizationId: UUID;
    customerInfo: CustomerInfo;
    billingAddress: Address;
    courseFee: Money;
    registrationFee?: Money;
    materialFee?: Money;
    discounts?: Array<{
      type: DiscountType;
      name: string;
      amount?: Money;
      percentage?: number;
    }>;
    fundingSource?: FundingSource;
    ssgClaimable?: boolean;
    paymentTerms: PaymentTerms;
    autoSend?: boolean;
    createdBy: UUID;
  }): Promise<Invoice> {
    const lineItems: Partial<InvoiceLineItem>[] = [];

    // Course fee line item
    lineItems.push({
      type: LineItemType.COURSE_FEE,
      description: `Training Course: ${courseData.courseName}`,
      courseId: courseData.courseId,
      participantId: courseData.participantId,
      quantity: 1,
      unitPrice: courseData.courseFee,
      totalPrice: courseData.courseFee,
      fundingSource: courseData.fundingSource,
      ssgClaimable: courseData.ssgClaimable || false,
      metadata: {
        courseId: courseData.courseId,
        participantId: courseData.participantId,
      },
    });

    // Registration fee if applicable
    if (courseData.registrationFee) {
      lineItems.push({
        type: LineItemType.REGISTRATION_FEE,
        description: 'Registration Fee',
        quantity: 1,
        unitPrice: courseData.registrationFee,
        totalPrice: courseData.registrationFee,
        ssgClaimable: false,
      });
    }

    // Material fee if applicable
    if (courseData.materialFee) {
      lineItems.push({
        type: LineItemType.MATERIAL_FEE,
        description: 'Training Materials',
        quantity: 1,
        unitPrice: courseData.materialFee,
        totalPrice: courseData.materialFee,
        ssgClaimable: courseData.ssgClaimable || false,
      });
    }

    // Convert discounts to invoice discounts
    const discounts = courseData.discounts?.map((discount) => ({
      type: discount.type,
      name: discount.name,
      amount: discount.amount,
      percentage: discount.percentage,
      appliedTo: [], // Will be calculated during processing
    }));

    return this.createInvoice({
      type: InvoiceType.STANDARD,
      organizationId: courseData.organizationId,
      customerId: courseData.participantId,
      customerInfo: courseData.customerInfo,
      billingAddress: courseData.billingAddress,
      lineItems,
      discounts,
      terms: courseData.paymentTerms,
      tags: ['course-invoice', courseData.courseId.toString()],
      autoSend: courseData.autoSend,
      metadata: {
        courseId: courseData.courseId,
        participantId: courseData.participantId,
        fundingSource: courseData.fundingSource,
      },
      createdBy: courseData.createdBy,
    });
  }

  /**
   * Create batch invoices for multiple participants
   */
  async createBatchInvoices(batchData: {
    organizationId: UUID;
    courseId: UUID;
    courseName: string;
    courseFee: Money;
    participants: Array<{
      participantId: UUID;
      customerInfo: CustomerInfo;
      billingAddress: Address;
      customizations?: {
        discounts?: Array<{
          type: DiscountType;
          name: string;
          amount?: Money;
          percentage?: number;
        }>;
        additionalFees?: Array<{ description: string; amount: Money }>;
        fundingSource?: FundingSource;
      };
    }>;
    paymentTerms: PaymentTerms;
    autoSend?: boolean;
    createdBy: UUID;
  }): Promise<Invoice[]> {
    const invoices: Invoice[] = [];

    for (const participant of batchData.participants) {
      try {
        const invoice = await this.createCourseInvoice({
          courseId: batchData.courseId,
          courseName: batchData.courseName,
          participantId: participant.participantId,
          organizationId: batchData.organizationId,
          customerInfo: participant.customerInfo,
          billingAddress: participant.billingAddress,
          courseFee: batchData.courseFee,
          discounts: participant.customizations?.discounts,
          fundingSource: participant.customizations?.fundingSource,
          paymentTerms: batchData.paymentTerms,
          autoSend: batchData.autoSend,
          createdBy: batchData.createdBy,
        });

        // Add additional fees if specified
        if (participant.customizations?.additionalFees) {
          for (const fee of participant.customizations.additionalFees) {
            await this.addLineItem(invoice.id, {
              type: LineItemType.OTHER,
              description: fee.description,
              quantity: 1,
              unitPrice: fee.amount,
              totalPrice: fee.amount,
              ssgClaimable: false,
            });
          }
        }

        invoices.push(invoice);
      } catch (error) {
        this.emit('batchInvoiceError', {
          participantId: participant.participantId,
          error,
        });
      }
    }

    this.emit('batchInvoicesCreated', {
      courseId: batchData.courseId,
      total: batchData.participants.length,
      successful: invoices.length,
      failed: batchData.participants.length - invoices.length,
    });

    return invoices;
  }

  // ============================================================================
  // INVOICE MODIFICATIONS
  // ============================================================================

  /**
   * Add line item to existing invoice
   */
  async addLineItem(
    invoiceId: UUID,
    lineItemData: Partial<InvoiceLineItem>
  ): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error('Can only modify draft invoices');
    }

    const lineItem = await this.processLineItem(lineItemData);
    invoice.lineItems.push(lineItem);

    // Recalculate totals
    await this.recalculateInvoiceTotals(invoice);

    this.emit('lineItemAdded', { invoiceId, lineItem });

    return invoice;
  }

  /**
   * Remove line item from invoice
   */
  async removeLineItem(invoiceId: UUID, lineItemId: UUID): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error('Can only modify draft invoices');
    }

    const itemIndex = invoice.lineItems.findIndex(
      (item) => item.id === lineItemId
    );
    if (itemIndex === -1) {
      throw new Error('Line item not found');
    }

    const removedItem = invoice.lineItems.splice(itemIndex, 1)[0];

    // Recalculate totals
    await this.recalculateInvoiceTotals(invoice);

    this.emit('lineItemRemoved', { invoiceId, lineItemId, removedItem });

    return invoice;
  }

  /**
   * Apply discount to invoice
   */
  async applyDiscount(
    invoiceId: UUID,
    discountData: {
      type: DiscountType;
      name: string;
      amount?: Money;
      percentage?: number;
      appliedTo?: UUID[]; // Line item IDs
      code?: string;
      reason?: string;
    }
  ): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const discount: InvoiceDiscount = {
      id: createUUID(uuidv4()),
      type: discountData.type,
      name: discountData.name,
      amount: discountData.amount,
      percentage: discountData.percentage,
      appliedTo:
        discountData.appliedTo || invoice.lineItems.map((item) => item.id),
      code: discountData.code,
      reason: discountData.reason,
      calculatedAmount: this.createMoney(0, invoice.total.currency),
      createdAt: new Date(),
    };

    invoice.discounts.push(discount);

    // Recalculate totals
    await this.recalculateInvoiceTotals(invoice);

    this.emit('discountApplied', { invoiceId, discount });

    return invoice;
  }

  // ============================================================================
  // INVOICE STATUS MANAGEMENT
  // ============================================================================

  /**
   * Send invoice to customer
   */
  async sendInvoice(
    invoiceId: UUID,
    sendOptions: {
      method: 'email' | 'postal' | 'portal';
      recipient: string;
      subject?: string;
      message?: string;
      attachments?: string[];
      scheduleFor?: Date;
    }
  ): Promise<{
    success: boolean;
    sentAt?: Date;
    deliveryId?: string;
    error?: string;
  }> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.DRAFT) {
      // Finalize invoice before sending
      await this.finalizeInvoice(invoiceId);
    }

    try {
      let result: any;

      switch (sendOptions.method) {
        case 'email':
          result = await this.sendInvoiceByEmail(invoice, sendOptions);
          break;
        case 'postal':
          result = await this.sendInvoiceByPost(invoice, sendOptions);
          break;
        case 'portal':
          result = await this.sendInvoiceToPortal(invoice, sendOptions);
          break;
        default:
          throw new Error('Invalid delivery method');
      }

      if (result.success) {
        invoice.status = InvoiceStatus.SENT;
        invoice.sentAt = new Date();
        invoice.updatedAt = new Date();

        this.emit('invoiceSent', {
          invoiceId,
          method: sendOptions.method,
          recipient: sendOptions.recipient,
          deliveryId: result.deliveryId,
        });
      }

      return result;
    } catch (error) {
      this.emit('invoiceSendError', { invoiceId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mark invoice as viewed
   */
  async markAsViewed(invoiceId: UUID, viewedBy?: UUID): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.SENT) {
      invoice.status = InvoiceStatus.VIEWED;
      invoice.viewedAt = new Date();
      invoice.updatedAt = new Date();

      this.emit('invoiceViewed', { invoiceId, viewedBy });
    }

    return invoice;
  }

  /**
   * Process payment for invoice
   */
  async processPayment(
    invoiceId: UUID,
    paymentData: {
      amount: Money;
      method: string;
      reference: string;
      gateway?: string;
      transactionId?: string;
      processedBy: UUID;
      notes?: string;
    }
  ): Promise<{
    invoice: Invoice;
    paymentRecord: PaymentRecord;
    newStatus: InvoiceStatus;
  }> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (paymentData.amount.amount.gt(invoice.remainingBalance.amount)) {
      throw new Error('Payment amount exceeds remaining balance');
    }

    // Create payment record
    const paymentRecord: PaymentRecord = {
      id: createUUID(uuidv4()),
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      gateway: paymentData.gateway as PaymentGateway,
      transactionId: paymentData.transactionId,
      status: PaymentStatus.COMPLETED,
      processedAt: new Date(),
      processedBy: paymentData.processedBy,
      notes: paymentData.notes,
      metadata: {},
    };

    // Add to payment history
    invoice.paymentHistory.push(paymentRecord);

    // Update remaining balance
    invoice.remainingBalance = this.subtractMoney(
      invoice.remainingBalance,
      paymentData.amount
    );

    // Determine new status
    let newStatus: InvoiceStatus;
    if (invoice.remainingBalance.amount.equals(0)) {
      newStatus = InvoiceStatus.PAID;
    } else {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    invoice.status = newStatus;
    invoice.updatedAt = new Date();

    this.emit('paymentProcessed', {
      invoiceId,
      paymentRecord,
      newStatus,
      remainingBalance: invoice.remainingBalance,
    });

    return { invoice, paymentRecord, newStatus };
  }

  // ============================================================================
  // PDF GENERATION
  // ============================================================================

  /**
   * Generate PDF document for invoice (simplified implementation)
   */
  async generateInvoicePDF(
    invoice: Invoice,
    templateId?: string
  ): Promise<Buffer> {
    const template = templateId
      ? this.templates.get(templateId)
      : this.templates.get('default');

    if (!template) {
      throw new Error('Invoice template not found');
    }

    // Generate HTML content for PDF conversion
    const htmlContent = this.generateHTMLContent(invoice, template);

    // In a real implementation, this would use a PDF library like Puppeteer or PDFKit
    // For now, return the HTML as a buffer
    return Buffer.from(htmlContent, 'utf8');
  }

  /**
   * Generate HTML content for PDF
   */
  private generateHTMLContent(
    invoice: Invoice,
    template: InvoiceTemplate
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          .customer-info { margin-bottom: 30px; }
          .line-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .line-items th, .line-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .line-items th { background-color: #f2f2f2; }
          .totals { text-align: right; margin-top: 20px; }
          .payment-terms { margin-top: 30px; }
          .notes { margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
        </div>
        
        <div class="invoice-details">
          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${invoice.issuedAt.toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
        </div>
        
        <div class="customer-info">
          <h3>Bill To:</h3>
          <p>${invoice.customerInfo.name}</p>
          ${invoice.customerInfo.companyName ? `<p>${invoice.customerInfo.companyName}</p>` : ''}
          <p>${invoice.billingAddress.line1}</p>
          ${invoice.billingAddress.line2 ? `<p>${invoice.billingAddress.line2}</p>` : ''}
          <p>${invoice.billingAddress.city}, ${invoice.billingAddress.state} ${invoice.billingAddress.postalCode}</p>
          <p>${invoice.billingAddress.country}</p>
        </div>
        
        <table class="line-items">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.lineItems
              .map(
                (item) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.currency} ${item.unitPrice.amount.toFixed(2)}</td>
                <td>${item.totalPrice.currency} ${item.totalPrice.amount.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p><strong>Subtotal:</strong> ${invoice.subtotal.currency} ${invoice.subtotal.amount.toFixed(2)}</p>
          
          ${invoice.discounts
            .map(
              (discount) => `
            <p><strong>${discount.name}:</strong> -${discount.calculatedAmount.currency} ${discount.calculatedAmount.amount.toFixed(2)}</p>
          `
            )
            .join('')}
          
          ${invoice.taxes
            .map(
              (tax) => `
            <p><strong>${tax.name}:</strong> ${tax.calculatedAmount.currency} ${tax.calculatedAmount.amount.toFixed(2)}</p>
          `
            )
            .join('')}
          
          <p style="font-size: 1.2em;"><strong>Total:</strong> ${invoice.total.currency} ${invoice.total.amount.toFixed(2)}</p>
        </div>
        
        ${
          invoice.terms
            ? `
        <div class="payment-terms">
          <h3>Payment Terms:</h3>
          <p>Payment Due: ${invoice.terms.dueDays} days</p>
          ${
            invoice.terms.earlyPaymentDiscount
              ? `
            <p>Early Payment Discount: ${invoice.terms.earlyPaymentDiscount.percentage}% if paid within ${invoice.terms.earlyPaymentDiscount.days} days</p>
          `
              : ''
          }
        </div>
        `
            : ''
        }
        
        ${
          invoice.notes.length > 0
            ? `
        <div class="notes">
          <h3>Notes:</h3>
          ${invoice.notes.map((note) => `<p>${note.content}</p>`).join('')}
        </div>
        `
            : ''
        }
      </body>
      </html>
    `;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async processLineItems(
    lineItemsData: Partial<InvoiceLineItem>[]
  ): Promise<InvoiceLineItem[]> {
    return Promise.all(
      lineItemsData.map((itemData) => this.processLineItem(itemData))
    );
  }

  private async processLineItem(
    itemData: Partial<InvoiceLineItem>
  ): Promise<InvoiceLineItem> {
    const id = createUUID(uuidv4());

    // Calculate amounts
    const unitPrice = itemData.unitPrice!;
    const quantity = itemData.quantity || 1;
    const totalPrice =
      itemData.totalPrice ||
      this.createMoney(unitPrice.amount.mul(quantity), unitPrice.currency);

    // Calculate tax
    const taxRate = itemData.taxRate || this.getDefaultTaxRate(itemData.type!);
    const taxAmount = this.createMoney(
      totalPrice.amount.mul(taxRate / 100),
      totalPrice.currency
    );

    // Calculate discount
    const discountRate = itemData.discountRate || 0;
    const discountAmount = this.createMoney(
      totalPrice.amount.mul(discountRate / 100),
      totalPrice.currency
    );

    // Calculate net amount
    const netAmount = this.subtractMoney(
      this.addMoney(totalPrice, taxAmount),
      discountAmount
    );

    return {
      id,
      type: itemData.type!,
      description: itemData.description!,
      courseId: itemData.courseId,
      participantId: itemData.participantId,
      quantity,
      unitPrice,
      totalPrice,
      taxRate,
      taxAmount,
      discountRate,
      discountAmount,
      netAmount,
      fundingSource: itemData.fundingSource,
      ssgClaimable: itemData.ssgClaimable || false,
      metadata: itemData.metadata || {},
    };
  }

  private processDiscounts(
    discountsData: Partial<InvoiceDiscount>[],
    lineItems: InvoiceLineItem[]
  ): InvoiceDiscount[] {
    return discountsData.map((discountData) => {
      const id = createUUID(uuidv4());

      // Calculate discount amount
      let calculatedAmount = this.createMoney(
        0,
        lineItems[0]?.totalPrice.currency || Currency.SGD
      );

      if (discountData.amount) {
        calculatedAmount = discountData.amount;
      } else if (discountData.percentage) {
        const applicableItems = discountData.appliedTo
          ? lineItems.filter((item) =>
              discountData.appliedTo!.includes(item.id)
            )
          : lineItems;

        const applicableTotal = applicableItems.reduce(
          (sum, item) => this.addMoney(sum, item.totalPrice),
          this.createMoney(0, lineItems[0]?.totalPrice.currency || Currency.SGD)
        );

        calculatedAmount = this.createMoney(
          applicableTotal.amount.mul(discountData.percentage / 100),
          applicableTotal.currency
        );
      }

      return {
        id,
        type: discountData.type!,
        name: discountData.name!,
        amount: discountData.amount,
        percentage: discountData.percentage,
        appliedTo: discountData.appliedTo || lineItems.map((item) => item.id),
        code: discountData.code,
        reason: discountData.reason,
        calculatedAmount,
        createdAt: new Date(),
      };
    });
  }

  private processTaxes(
    taxesData: Partial<InvoiceTax>[],
    lineItems: InvoiceLineItem[],
    discounts: InvoiceDiscount[]
  ): InvoiceTax[] {
    // Default GST for Singapore
    if (taxesData.length === 0) {
      const subtotal = this.calculateSubtotal(lineItems);
      const totalDiscounts = discounts.reduce(
        (sum, discount) => this.addMoney(sum, discount.calculatedAmount),
        this.createMoney(0, subtotal.currency)
      );
      const taxableAmount = this.subtractMoney(subtotal, totalDiscounts);

      const gstAmount = this.createMoney(
        taxableAmount.amount.mul(0.07), // 7% GST
        taxableAmount.currency
      );

      return [
        {
          id: createUUID(uuidv4()),
          type: TaxType.GST,
          name: 'Goods and Services Tax',
          rate: 7,
          amount: gstAmount,
          calculatedAmount: gstAmount,
          appliedTo: lineItems.map((item) => item.id),
          taxAuthority: 'IRAS',
          createdAt: new Date(),
        },
      ];
    }

    return taxesData.map((taxData) => {
      const id = createUUID(uuidv4());

      const applicableItems = taxData.appliedTo
        ? lineItems.filter((item) => taxData.appliedTo!.includes(item.id))
        : lineItems;

      const applicableTotal = applicableItems.reduce(
        (sum, item) => this.addMoney(sum, item.totalPrice),
        this.createMoney(0, lineItems[0]?.totalPrice.currency || Currency.SGD)
      );

      const calculatedAmount = this.createMoney(
        applicableTotal.amount.mul((taxData.rate || 0) / 100),
        applicableTotal.currency
      );

      return {
        id,
        type: taxData.type || TaxType.GST,
        name: taxData.name!,
        rate: taxData.rate!,
        amount: taxData.amount || calculatedAmount,
        calculatedAmount,
        appliedTo: taxData.appliedTo || lineItems.map((item) => item.id),
        taxAuthority: 'IRAS',
        createdAt: new Date(),
      };
    });
  }

  private processNotes(notesData: string[]): InvoiceNote[] {
    return notesData.map((content) => ({
      id: createUUID(uuidv4()),
      content,
      note: content,
      isInternal: false,
      createdAt: new Date(),
      createdBy: createUUID('system'), // Would be passed in real implementation
    }));
  }

  private calculateSubtotal(lineItems: InvoiceLineItem[]): Money {
    if (lineItems.length === 0) {
      return this.createMoney(0, Currency.SGD);
    }

    return lineItems.reduce(
      (sum, item) => this.addMoney(sum, item.totalPrice),
      this.createMoney(0, lineItems[0].totalPrice.currency)
    );
  }

  private calculateTotal(
    subtotal: Money,
    discounts: InvoiceDiscount[],
    taxes: InvoiceTax[]
  ): Money {
    let total = subtotal;

    // Subtract discounts
    discounts.forEach((discount) => {
      total = this.subtractMoney(total, discount.calculatedAmount);
    });

    // Add taxes
    taxes.forEach((tax) => {
      total = this.addMoney(total, tax.calculatedAmount);
    });

    return total;
  }

  private async recalculateInvoiceTotals(invoice: Invoice): Promise<void> {
    // Recalculate subtotal
    invoice.subtotal = this.calculateSubtotal(invoice.lineItems);

    // Recalculate discount amounts
    invoice.discounts.forEach((discount) => {
      if (discount.percentage) {
        const applicableItems = invoice.lineItems.filter((item) =>
          discount.appliedTo.includes(item.id)
        );
        const applicableTotal = applicableItems.reduce(
          (sum, item) => this.addMoney(sum, item.totalPrice),
          this.createMoney(0, invoice.subtotal.currency)
        );
        discount.calculatedAmount = this.createMoney(
          applicableTotal.amount.mul(discount.percentage / 100),
          applicableTotal.currency
        );
      }
    });

    // Recalculate tax amounts
    invoice.taxes.forEach((tax) => {
      const applicableItems = invoice.lineItems.filter((item) =>
        tax.appliedTo.includes(item.id)
      );
      const applicableTotal = applicableItems.reduce(
        (sum, item) => this.addMoney(sum, item.totalPrice),
        this.createMoney(0, invoice.subtotal.currency)
      );
      tax.calculatedAmount = this.createMoney(
        applicableTotal.amount.mul(tax.rate / 100),
        applicableTotal.currency
      );
    });

    // Recalculate total
    invoice.total = this.calculateTotal(
      invoice.subtotal,
      invoice.discounts,
      invoice.taxes
    );

    // Update remaining balance if no payments have been made
    if (invoice.paymentHistory.length === 0) {
      invoice.remainingBalance = invoice.total;
    } else {
      const totalPaid = invoice.paymentHistory.reduce(
        (sum, payment) => this.addMoney(sum, payment.amount),
        this.createMoney(0, invoice.total.currency)
      );
      invoice.remainingBalance = this.subtractMoney(invoice.total, totalPaid);
    }

    invoice.updatedAt = new Date();
  }

  private async generateInvoiceNumber(
    organizationId: UUID,
    type: InvoiceType
  ): Promise<string> {
    const sequence =
      this.sequences.get(`${organizationId}-${type}`) ||
      this.sequences.get('default');

    if (!sequence) {
      throw new Error('Invoice sequence not found');
    }

    const number = sequence.nextNumber
      .toString()
      .padStart(sequence.padding, '0');
    sequence.nextNumber += 1;

    return `${sequence.prefix}-${number}`;
  }

  private calculateDueDate(terms: PaymentTerms, issueDate: Date): Date {
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + terms.dueDays);
    return dueDate;
  }

  private getDefaultTaxRate(itemType: LineItemType): number {
    // Singapore GST rates
    const taxRates: Record<LineItemType, number> = {
      [LineItemType.COURSE_FEE]: 7,
      [LineItemType.REGISTRATION_FEE]: 7,
      [LineItemType.MATERIAL_FEE]: 7,
      [LineItemType.EXAMINATION_FEE]: 0,
      [LineItemType.CERTIFICATION_FEE]: 0,
      [LineItemType.LATE_FEE]: 7,
      [LineItemType.CANCELLATION_FEE]: 7,
      [LineItemType.REFUND]: 0,
      [LineItemType.DISCOUNT]: 0,
      [LineItemType.OTHER]: 7,
    };

    return taxRates[itemType] || 7;
  }

  private async finalizeInvoice(invoiceId: UUID): Promise<void> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Validate invoice data
    if (invoice.lineItems.length === 0) {
      throw new Error('Invoice must have at least one line item');
    }

    // Update status
    invoice.status = InvoiceStatus.SENT;
    invoice.updatedAt = new Date();
  }

  private async sendInvoiceByEmail(
    invoice: Invoice,
    options: any
  ): Promise<{ success: boolean; deliveryId?: string }> {
    // Integration with email service (SendGrid, AWS SES, etc.)
    // This is a simplified implementation
    console.log(
      `Sending invoice ${invoice.invoiceNumber} to ${options.recipient}`
    );

    return {
      success: true,
      deliveryId: uuidv4(),
    };
  }

  private async sendInvoiceByPost(
    invoice: Invoice,
    options: any
  ): Promise<{ success: boolean; deliveryId?: string }> {
    // Integration with postal service
    console.log(`Sending invoice ${invoice.invoiceNumber} by post`);

    return {
      success: true,
      deliveryId: uuidv4(),
    };
  }

  private async sendInvoiceToPortal(
    invoice: Invoice,
    options: any
  ): Promise<{ success: boolean; deliveryId?: string }> {
    // Make available in customer portal
    console.log(`Making invoice ${invoice.invoiceNumber} available in portal`);

    return {
      success: true,
      deliveryId: uuidv4(),
    };
  }

  private createMoney(amount: number | Decimal, currency: Currency): Money {
    return {
      amount: typeof amount === 'number' ? new Decimal(amount) : amount,
      currency,
    };
  }

  private addMoney(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return {
      amount: a.amount.add(b.amount),
      currency: a.currency,
    };
  }

  private subtractMoney(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return {
      amount: a.amount.sub(b.amount),
      currency: a.currency,
    };
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplate: InvoiceTemplate = {
      id: 'default',
      name: 'Default Invoice Template',
      layout: 'standard',
      headerContent: 'INVOICE',
      footerContent: 'Thank you for your business!',
      logoUrl: '',
      colorScheme: 'blue',
      fontFamily: 'Arial',
    };

    this.templates.set('default', defaultTemplate);
  }

  private initializeSequences(): void {
    const defaultSequence: InvoiceSequence = {
      id: 'default',
      prefix: 'INV',
      nextNumber: 1,
      padding: 6,
    };

    this.sequences.set('default', defaultSequence);
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  async getInvoice(invoiceId: UUID): Promise<Invoice | null> {
    return this.invoices.get(invoiceId) || null;
  }

  async getInvoices(filters?: {
    organizationId?: UUID;
    customerId?: UUID;
    status?: InvoiceStatus;
    type?: InvoiceType;
    dateRange?: { start: Date; end: Date };
  }): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());

    if (filters?.organizationId) {
      invoices = invoices.filter(
        (i) => i.organizationId === filters.organizationId
      );
    }
    if (filters?.customerId) {
      invoices = invoices.filter((i) => i.customerId === filters.customerId);
    }
    if (filters?.status) {
      invoices = invoices.filter((i) => i.status === filters.status);
    }
    if (filters?.type) {
      invoices = invoices.filter((i) => i.type === filters.type);
    }
    if (filters?.dateRange) {
      invoices = invoices.filter(
        (i) =>
          i.issuedAt >= filters.dateRange!.start &&
          i.issuedAt <= filters.dateRange!.end
      );
    }

    return invoices;
  }

  async updateInvoiceStatus(
    invoiceId: UUID,
    status: InvoiceStatus,
    reason?: string,
    updatedBy?: UUID
  ): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.status = status;
    invoice.updatedAt = new Date();

    this.emit('invoiceStatusUpdated', { invoiceId, status, reason });

    return invoice;
  }

  async deleteInvoice(invoiceId: UUID): Promise<boolean> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return false;
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error('Can only delete draft invoices');
    }

    this.invoices.delete(invoiceId);
    this.emit('invoiceDeleted', { invoiceId });

    return true;
  }
}

// ============================================================================
// INTERFACES
// ============================================================================

interface InvoiceTemplate {
  id: string;
  name: string;
  layout: string;
  headerContent: string;
  footerContent: string;
  logoUrl: string;
  colorScheme: string;
  fontFamily: string;
}

interface InvoiceSequence {
  id: string;
  prefix: string;
  nextNumber: number;
  padding: number;
}

interface AccountingIntegration {
  id: string;
  name: string;
  type: 'quickbooks' | 'xero' | 'sage' | 'myob';
  config: Record<string, any>;
  isActive: boolean;
}
