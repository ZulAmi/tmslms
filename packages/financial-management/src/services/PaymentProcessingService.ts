import { EventEmitter } from 'events';
import { Decimal } from 'decimal.js';
import {
  PaymentRecord,
  PaymentMethod,
  PaymentStatus,
  PaymentGateway,
  UUID,
  createUUID,
  Currency,
} from '../types';

export interface IPaymentProcessingService {
  processPayment(
    request: PaymentProcessingRequest
  ): Promise<PaymentProcessingResponse>;
  processRefund(
    paymentId: UUID,
    amount: number,
    reason?: string
  ): Promise<PaymentProcessingResponse>;
  getPaymentStatus(paymentId: UUID): Promise<PaymentStatus>;
  getPaymentHistory(customerId: string): Promise<PaymentRecord[]>;
  validatePaymentMethod(method: PaymentMethod): boolean;
  getSupportedGateways(): PaymentGateway[];
}

export interface PaymentProcessingRequest {
  amount: number;
  currency: Currency;
  gateway: PaymentGateway;
  paymentMethod: PaymentMethod;
  customerId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentProcessingResponse {
  success: boolean;
  paymentId: UUID;
  transactionId?: string;
  status: PaymentStatus;
  error?: string;
  timestamp: Date;
}

export class PaymentProcessingService
  extends EventEmitter
  implements IPaymentProcessingService
{
  private payments: Map<UUID, PaymentRecord> = new Map();
  private supportedGateways: PaymentGateway[] = [
    PaymentGateway.STRIPE,
    PaymentGateway.PAYPAL,
    PaymentGateway.RAZORPAY,
    PaymentGateway.ADYEN,
    PaymentGateway.SQUARE,
    PaymentGateway.PAYNOW,
  ];

  constructor(
    private readonly databaseService?: any,
    private readonly notificationService?: any,
    private readonly encryptionService?: any
  ) {
    super();
  }

  async processPayment(
    request: PaymentProcessingRequest
  ): Promise<PaymentProcessingResponse> {
    try {
      // Validate payment request
      if (!this.validatePaymentRequest(request)) {
        return {
          success: false,
          paymentId: createUUID(`pay_failed_${Date.now()}`),
          status: PaymentStatus.FAILED,
          error: 'Invalid payment request',
          timestamp: new Date(),
        };
      }

      // Create payment record
      const paymentRecord: PaymentRecord = {
        id: createUUID(
          `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        ),
        amount: {
          amount: new Decimal(request.amount),
          currency: request.currency,
        },
        method: request.paymentMethod.toString(),
        reference: `ref_${Date.now()}`,
        gateway: request.gateway.toString(),
        paymentMethod: request.paymentMethod,
        status: PaymentStatus.PENDING,
        metadata: request.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simulate payment processing
      const processingResult = await this.simulateGatewayProcessing(request);

      // Update payment record with result
      paymentRecord.status = processingResult.success
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;
      paymentRecord.transactionId = processingResult.transactionId;
      paymentRecord.processedAt = new Date();
      paymentRecord.updatedAt = new Date();

      if (!processingResult.success) {
        paymentRecord.failureReason = processingResult.error;
      }

      // Store payment record
      this.payments.set(paymentRecord.id, paymentRecord);

      // Emit payment processed event
      this.emit('paymentProcessed', {
        payment: paymentRecord,
        success: processingResult.success,
      });

      return {
        success: processingResult.success,
        paymentId: paymentRecord.id,
        transactionId: processingResult.transactionId,
        status: paymentRecord.status,
        error: processingResult.error,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      return {
        success: false,
        paymentId: createUUID(`pay_error_${Date.now()}`),
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async processRefund(
    paymentId: UUID,
    amount: number,
    reason?: string
  ): Promise<PaymentProcessingResponse> {
    try {
      const originalPayment = this.payments.get(paymentId);
      if (!originalPayment) {
        throw new Error('Original payment not found');
      }

      if (originalPayment.status !== PaymentStatus.COMPLETED) {
        throw new Error('Can only refund completed payments');
      }

      // Create refund record
      const refundRecord: PaymentRecord = {
        id: createUUID(
          `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        ),
        amount: {
          amount: new Decimal(-amount),
          currency: originalPayment.amount.currency,
        },
        method: 'refund',
        reference: `refund_${originalPayment.reference}`,
        gateway: originalPayment.gateway,
        paymentMethod: originalPayment.paymentMethod,
        status: PaymentStatus.PENDING,
        metadata: {
          originalPaymentId: paymentId,
          refundReason: reason,
          ...originalPayment.metadata,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simulate refund processing
      const processingResult = await this.simulateRefundProcessing(
        originalPayment,
        amount
      );

      // Update refund record
      refundRecord.status = processingResult.success
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;
      refundRecord.transactionId = processingResult.transactionId;
      refundRecord.processedAt = new Date();
      refundRecord.updatedAt = new Date();

      if (!processingResult.success) {
        refundRecord.failureReason = processingResult.error;
      } else {
        // Update original payment to show refund
        originalPayment.refundedAt = new Date();
        originalPayment.refundAmount = {
          amount: new Decimal(amount),
          currency: originalPayment.amount.currency,
        };
        originalPayment.updatedAt = new Date();
        this.payments.set(paymentId, originalPayment);
      }

      // Store refund record
      this.payments.set(refundRecord.id, refundRecord);

      // Emit refund processed event
      this.emit('refundProcessed', {
        refund: refundRecord,
        originalPayment,
        success: processingResult.success,
      });

      return {
        success: processingResult.success,
        paymentId: refundRecord.id,
        transactionId: processingResult.transactionId,
        status: refundRecord.status,
        error: processingResult.error,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        paymentId: createUUID(`ref_error_${Date.now()}`),
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async getPaymentStatus(paymentId: UUID): Promise<PaymentStatus> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    return payment.status;
  }

  async getPaymentHistory(customerId: string): Promise<PaymentRecord[]> {
    // In real implementation, this would query by customer ID
    // For now, return all payments (simplified)
    return Array.from(this.payments.values())
      .filter((payment) => payment.metadata?.customerId === customerId)
      .sort(
        (a, b) =>
          (b.createdAt || new Date()).getTime() -
          (a.createdAt || new Date()).getTime()
      );
  }

  validatePaymentMethod(method: PaymentMethod): boolean {
    return Object.values(PaymentMethod).includes(method);
  }

  getSupportedGateways(): PaymentGateway[] {
    return [...this.supportedGateways];
  }

  // Private helper methods
  private validatePaymentRequest(request: PaymentProcessingRequest): boolean {
    if (request.amount <= 0) return false;
    if (!request.currency) return false;
    if (!this.supportedGateways.includes(request.gateway)) return false;
    if (!this.validatePaymentMethod(request.paymentMethod)) return false;
    return true;
  }

  private async simulateGatewayProcessing(
    request: PaymentProcessingRequest
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 2000 + 500)
    );

    // Simulate 95% success rate for testing
    const success = Math.random() > 0.05;

    if (success) {
      return {
        success: true,
        transactionId: `txn_${request.gateway}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } else {
      return {
        success: false,
        error: 'Payment declined by issuing bank',
      };
    }
  }

  private async simulateRefundProcessing(
    originalPayment: PaymentRecord,
    amount: number
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 1500 + 300)
    );

    // Simulate 98% success rate for refunds
    const success = Math.random() > 0.02;

    if (success) {
      return {
        success: true,
        transactionId: `ref_${originalPayment.gateway}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } else {
      return {
        success: false,
        error: 'Refund processing failed - please try again later',
      };
    }
  }
}
