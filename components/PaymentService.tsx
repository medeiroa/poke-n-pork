import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Separator } from './ui/separator';
import { Alert } from './ui/alert';
import { CreditCard, Shield, Lock, DollarSign, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

interface PaymentServiceProps {
  organizationName: string;
  cause: string;
  onPaymentSuccess?: (donationData: DonationData) => void;
  onPaymentError?: (error: string) => void;
  onClose?: () => void;
}

interface DonationData {
  amount: number;
  organizationName: string;
  cause: string;
  donorEmail: string;
  paymentMethod: string;
  transactionId: string;
  timestamp: string;
}

interface PaymentFormData {
  amount: string;
  donorName: string;
  donorEmail: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingZip: string;
  paymentMethod: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay';
}

export function PaymentService({
  organizationName,
  cause,
  onPaymentSuccess,
  onPaymentError,
  onClose
}: PaymentServiceProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: '',
    donorName: '',
    donorEmail: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingZip: '',
    paymentMethod: 'credit_card'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Predefined donation amounts
  const quickAmounts = [10, 25, 50, 100, 250, 500];

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    // Amount validation
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount < 1) {
      newErrors.amount = 'Please enter a valid donation amount';
    }

    // Donor info validation
    if (!formData.donorName.trim()) {
      newErrors.donorName = 'Please enter your full name';
    }

    if (!formData.donorEmail.trim() || !/\S+@\S+\.\S+/.test(formData.donorEmail)) {
      newErrors.donorEmail = 'Please enter a valid email address';
    }

    // Credit card validation (only if credit card is selected)
    if (formData.paymentMethod === 'credit_card') {
      if (!formData.cardNumber.replace(/\s/g, '') || formData.cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }

      if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please enter expiry date (MM/YY)';
      }

      if (!formData.cvv || formData.cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV';
      }

      if (!formData.billingZip || formData.billingZip.length < 5) {
        newErrors.billingZip = 'Please enter a valid ZIP code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Handle form field changes
  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    } else if (field === 'billingZip') {
      formattedValue = value.replace(/\D/g, '').substring(0, 10);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Simulate payment processing
  const processPayment = async (): Promise<boolean> => {
    setProcessingStep('Validating payment information...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    setProcessingStep('Contacting payment processor...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    setProcessingStep('Processing transaction...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    setProcessingStep('Confirming donation...');
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate 95% success rate
    return Math.random() > 0.05;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Preparing payment...');

    try {
      const success = await processPayment();

      if (success) {
        // Create donation data
        const donationData: DonationData = {
          amount: parseFloat(formData.amount),
          organizationName,
          cause,
          donorEmail: formData.donorEmail,
          paymentMethod: formData.paymentMethod,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
        };

        // Save to localStorage for demo purposes
        const savedDonations = JSON.parse(localStorage.getItem('poke-n-pork-donations') || '[]');
        savedDonations.push(donationData);
        localStorage.setItem('poke-n-pork-donations', JSON.stringify(savedDonations));

        setShowSuccess(true);
        setProcessingStep('');

        if (onPaymentSuccess) {
          onPaymentSuccess(donationData);
        }

        // Auto-close after success message
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 3000);

      } else {
        throw new Error('Payment was declined. Please check your payment information and try again.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
      
      setErrors({ amount: errorMessage });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Success screen
  if (showSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto relative">
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 w-8 h-8 p-0 hover:bg-gray-100 z-10"
        >
          <X className="w-4 h-4 text-gray-500" />
        </Button>

        <div className="p-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Donation Successful!
            </h3>
            <p className="text-sm text-green-600 mb-4">
              Thank you for your ${parseFloat(formData.amount).toLocaleString()} donation to {organizationName}.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              A confirmation email has been sent to {formData.donorEmail}
            </p>
            <Button 
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Continue
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto relative">
      {/* Close button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 w-8 h-8 p-0 hover:bg-gray-100 z-10"
      >
        <X className="w-4 h-4 text-gray-500" />
      </Button>

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Donate to {organizationName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Supporting: {cause}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Selection */}
          <div>
            <Label htmlFor="amount">Donation Amount</Label>
            <div className="grid grid-cols-3 gap-2 mt-2 mb-3">
              {quickAmounts.map(amount => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange('amount', amount.toString())}
                  className={formData.amount === amount.toString() ? 'bg-green-100 border-green-500' : ''}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                placeholder="Enter custom amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                min="1"
                step="1"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-600 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Donor Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Donor Information</h4>
            
            <div>
              <Label htmlFor="donorName">Full Name</Label>
              <Input
                id="donorName"
                value={formData.donorName}
                onChange={(e) => handleInputChange('donorName', e.target.value)}
                className={errors.donorName ? 'border-red-500' : ''}
                placeholder="Enter your full name"
              />
              {errors.donorName && (
                <p className="text-xs text-red-600 mt-1">{errors.donorName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="donorEmail">Email Address</Label>
              <Input
                id="donorEmail"
                type="email"
                value={formData.donorEmail}
                onChange={(e) => handleInputChange('donorEmail', e.target.value)}
                className={errors.donorEmail ? 'border-red-500' : ''}
                placeholder="your.email@example.com"
              />
              {errors.donorEmail && (
                <p className="text-xs text-red-600 mt-1">{errors.donorEmail}</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Payment Method</h4>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
                { id: 'paypal', label: 'PayPal', icon: Shield },
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange('paymentMethod', id as any)}
                  className={`p-3 ${formData.paymentMethod === id ? 'bg-blue-50 border-blue-500' : ''}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Credit Card Details */}
          {formData.paymentMethod === 'credit_card' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Card Details</h4>
              
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    className={`pl-10 ${errors.cardNumber ? 'border-red-500' : ''}`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                {errors.cardNumber && (
                  <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="expiryDate">Expiry</Label>
                  <Input
                    id="expiryDate"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className={errors.expiryDate ? 'border-red-500' : ''}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  {errors.expiryDate && (
                    <p className="text-xs text-red-600 mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className={errors.cvv ? 'border-red-500' : ''}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="billingZip">ZIP Code</Label>
                  <Input
                    id="billingZip"
                    value={formData.billingZip}
                    onChange={(e) => handleInputChange('billingZip', e.target.value)}
                    className={errors.billingZip ? 'border-red-500' : ''}
                    placeholder="12345"
                    maxLength={10}
                  />
                  {errors.billingZip && (
                    <p className="text-xs text-red-600 mt-1">{errors.billingZip}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <Alert className="bg-blue-50 border-blue-200">
            <Lock className="w-4 h-4" />
            <div className="ml-2">
              <p className="text-xs text-blue-800">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </Alert>

          <Separator />

          {/* Processing Status */}
          {isProcessing && (
            <div className="text-center py-2">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-blue-600">{processingStep}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isProcessing || !formData.amount || parseFloat(formData.amount) < 1}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing
                </>
              ) : (
                `Donate $${formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}