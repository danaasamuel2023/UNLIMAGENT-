#!/bin/bash

# Test Paystack Integration
# This script helps you test your Paystack setup

echo "🧪 Testing Paystack Integration..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "📝 Please create .env file from .env.example"
    exit 1
fi

# Load environment variables
source .env

# Check if Paystack keys are set
if [ -z "$PAYSTACK_SECRET_KEY" ]; then
    echo "❌ PAYSTACK_SECRET_KEY not set in .env"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY" ]; then
    echo "❌ NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY not set in .env"
    exit 1
fi

echo "✅ Environment variables found"
echo ""

# Check if keys are test keys
if [[ $PAYSTACK_SECRET_KEY == *"test"* ]]; then
    echo "🧪 Using TEST mode (test keys detected)"
else
    echo "🚀 Using LIVE mode (live keys detected)"
    echo "⚠️  WARNING: You are using live keys!"
fi

echo ""
echo "Testing endpoints..."

# Test deposit endpoint
echo "1. Testing deposit endpoint..."
curl -s http://localhost:3000/api/customer/wallet/deposit > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Deposit endpoint accessible"
else
    echo "   ❌ Deposit endpoint not accessible"
fi

# Test balance endpoint
echo "2. Testing balance endpoint..."
curl -s http://localhost:3000/api/customer/wallet/get-balance > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Balance endpoint accessible"
else
    echo "   ❌ Balance endpoint not accessible"
fi

echo ""
echo "📋 Test Payment Information:"
echo ""
echo "💳 Test Card (Success):"
echo "   Card Number: 5060666666666666667"
echo "   CVV: 123"
echo "   Expiry: 12/25"
echo "   PIN: 0000"
echo ""
echo "💳 Test Card (Failure):"
echo "   Card Number: 5060666666666666668"
echo "   CVV: 123"
echo "   Expiry: 12/25"
echo "   PIN: 0000"
echo ""
echo "📱 Test Mobile Money:"
echo "   Use any Ghana mobile number"
echo "   PIN: 0000"
echo ""
echo "🌐 Test URLs:"
echo "   - Deposit: http://localhost:3000/payment/deposit"
echo "   - Wallet: http://localhost:3000/wallet"
echo "   - Stores: http://localhost:3000/stores"
echo ""
echo "✅ Setup complete! You can now test payments."

