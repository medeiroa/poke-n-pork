import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { PaymentService } from './PaymentService';
import { Heart, DollarSign, ExternalLink, CreditCard, Banknote, Wallet } from 'lucide-react';
import { HUMANITARIAN_CAUSES } from './causes-constants';

interface DonationsPanelProps {
  selectedAgency: string;
}

// Map humanitarian causes to relevant donation organizations using shared constants
const getDonationOrganizations = (agency: string) => {
  // Create a mapping of our humanitarian causes to appropriate organizations
  const causeOrganizations: { [key: string]: Array<{name: string; url: string; description: string}> } = {
    'Clean Water Access': [
      { name: 'charity: water', url: 'https://www.charitywater.org/donate', description: 'Bringing clean water to people in need' },
      { name: 'Water.org', url: 'https://water.org/donate', description: 'Safe water and sanitation solutions' },
      { name: 'The Water Project', url: 'https://thewaterproject.org/donate', description: 'Reliable water projects in sub-Saharan Africa' }
    ],
    'Education Fund': [
      { name: 'DonorsChoose', url: 'https://www.donorschoose.org', description: 'Supporting classroom projects and teachers' },
      { name: 'Teach for America', url: 'https://www.teachforamerica.org/donate', description: 'Educational equity through teacher placement' },
      { name: 'Room to Read', url: 'https://www.roomtoread.org/donate', description: 'World change starts with educated children' }
    ],
    'Medical Aid': [
      { name: 'Doctors Without Borders', url: 'https://www.doctorswithoutborders.org/donate', description: 'Emergency medical aid worldwide' },
      { name: 'Partners In Health', url: 'https://www.pih.org/donate', description: 'Quality healthcare for the global poor' },
      { name: 'Direct Relief', url: 'https://www.directrelief.org/take-action/individual-giving', description: 'Medical assistance during disasters and emergencies' }
    ],
    'Food Security': [
      { name: 'World Food Programme', url: 'https://www.wfp.org/support-us/donate', description: 'Fighting hunger worldwide' },
      { name: 'Feeding America', url: 'https://www.feedingamerica.org/donate', description: 'Leading hunger-relief organization in the US' },
      { name: 'Action Against Hunger', url: 'https://www.actionagainsthunger.org/donate', description: 'Emergency response and long-term solutions to hunger' }
    ],
    'Renewable Energy': [
      { name: 'Solar Sister', url: 'https://www.solarsister.org/donate', description: 'Clean energy solutions for women entrepreneurs' },
      { name: 'Practical Action', url: 'https://practicalaction.org/donate', description: 'Technology to challenge poverty and renewable energy' },
      { name: 'GivePower', url: 'https://givepower.org/donate', description: 'Solar energy solutions for communities in need' }
    ],
    'Wildlife Conservation': [
      { name: 'World Wildlife Fund', url: 'https://www.worldwildlife.org/donate', description: 'Protecting wildlife and natural habitats' },
      { name: 'Wildlife Conservation Society', url: 'https://www.wcs.org/donate', description: 'Saving wildlife and wild places worldwide' },
      { name: 'Panthera', url: 'https://www.panthera.org/donate', description: 'Protecting wild cats and their ecosystems' }
    ],
    'Housing Assistance': [
      { name: 'Habitat for Humanity', url: 'https://www.habitat.org/donate', description: 'Building homes and communities worldwide' },
      { name: 'Coalition for the Homeless', url: 'https://www.coalitionforthehomeless.org/donate', description: 'Services and advocacy for homeless individuals' },
      { name: 'National Alliance to End Homelessness', url: 'https://endhomelessness.org/donate', description: 'Policy and research to end homelessness' }
    ],
    'Disaster Relief': [
      { name: 'American Red Cross', url: 'https://www.redcross.org/donate', description: 'Emergency assistance and disaster relief' },
      { name: 'UNICEF', url: 'https://www.unicef.org/donate', description: 'Emergency response for children worldwide' },
      { name: 'Save the Children', url: 'https://www.savethechildren.org/us/ways-to-help/ways-to-give/donate', description: 'Emergency relief and long-term assistance for children' }
    ]
  };

  // Return organizations for the specific cause, or default to general humanitarian organizations
  return causeOrganizations[agency] || [
    { name: 'United Way', url: 'https://www.unitedway.org/give', description: 'Community development and support' },
    { name: 'Oxfam America', url: 'https://www.oxfamamerica.org/donate', description: 'Fighting inequality to end poverty and injustice' },
    { name: 'International Rescue Committee', url: 'https://www.rescue.org/donate', description: 'Humanitarian aid for people affected by conflict and disaster' }
  ];
};

const donationAmounts = ['$5', '$25', '$50', '$100', '$250'];

export function DonationsPanel({ selectedAgency }: DonationsPanelProps) {
  const [selectedAmount, setSelectedAmount] = useState('$25');
  const [showPaymentService, setShowPaymentService] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<{name: string; description: string} | null>(null);
  const organizations = getDonationOrganizations(selectedAgency);

  // Get recent donations from localStorage
  const getRecentDonations = () => {
    try {
      const savedDonations = JSON.parse(localStorage.getItem('poke-n-pork-donations') || '[]');
      return savedDonations.slice(-3).reverse(); // Show last 3 donations
    } catch {
      return [];
    }
  };

  const [recentDonations, setRecentDonations] = useState(getRecentDonations());

  // Payment service handlers
  const handlePaymentSuccess = (donationData: any) => {
    console.log('Donation successful:', donationData);
    setRecentDonations(getRecentDonations()); // Refresh recent donations
    setShowPaymentService(false);
    setSelectedOrg(null);
  };

  const handlePaymentError = (error: string) => {
    console.error('Donation error:', error);
  };

  const handleClosePayment = () => {
    setShowPaymentService(false);
    setSelectedOrg(null);
  };

  // Show payment service modal
  if (showPaymentService && selectedOrg) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md">
          <PaymentService
            organizationName={selectedOrg.name}
            cause={selectedOrg.description}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onClose={handleClosePayment}
          />
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 mb-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800">Support Real Change</h2>
        </div>
        <p className="text-gray-600">
          Make a difference by donating to organizations working on causes like {selectedAgency}
        </p>
      </div>

      {/* Donation Amount Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Choose an Amount</h3>
        <div className="flex justify-center gap-2 flex-wrap">
          {donationAmounts.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAmount(amount)}
              className={`min-w-[60px] ${
                selectedAmount === amount 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'hover:bg-green-50 border-green-200'
              }`}
            >
              {amount}
            </Button>
          ))}
        </div>
      </div>

      {/* Organizations */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 text-center mb-4">Recommended Organizations</h3>
        
        {organizations.map((org, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">{org.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{org.description}</p>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Donate {selectedAmount}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedOrg({ name: org.name, description: org.description });
                    setShowPaymentService(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                >
                  <CreditCard className="w-4 h-4" />
                  Quick Donate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(org.url, '_blank', 'noopener,noreferrer')}
                  className="border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit Site
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Donations */}
      {recentDonations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 text-center mb-3">Recent Donations</h3>
          <div className="space-y-2">
            {recentDonations.map((donation: any, index: number) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">{donation.organizationName}</p>
                    <p className="text-xs text-green-600">{donation.cause}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-800">${donation.amount.toLocaleString()}</p>
                    <p className="text-xs text-green-600">
                      {new Date(donation.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 text-center">
          <strong>Disclaimer:</strong> These are independent organizations not affiliated with Poke-n-Pork. 
          All donations go directly to the selected organizations. Please review their policies before donating.
        </p>
      </div>
    </Card>
  );
}