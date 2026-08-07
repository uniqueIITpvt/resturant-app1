'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Printer } from 'lucide-react';

export default function EventOfferGuidePage() {
  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl print:p-0">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link href="/dashboard" className="flex items-center text-amber-600 hover:text-amber-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrint}
            className="flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Guide
          </button>
          <a 
            href="/EventOffer_Email_Guide.pdf" 
            download
            className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-md text-white text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </a>
        </div>
      </div>

      <div className="prose max-w-none print:max-w-full">
        <h1 className="text-3xl font-bold text-center mb-8">Event Offers & Email Notification System Guide</h1>
        
        <p className="lead text-lg text-gray-600">
          This guide explains how to create event offers and send promotional emails to customers using the Restaurant Management System.
        </p>

        <div className="bg-amber-50 p-6 my-6 rounded-lg border border-amber-200 print:bg-white print:border-gray-300">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">Table of Contents</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li><a href="#overview" className="text-amber-600 hover:text-amber-800">Overview</a></li>
            <li><a href="#creating-event-offers" className="text-amber-600 hover:text-amber-800">Creating Event Offers</a></li>
            <li><a href="#sending-email-notifications" className="text-amber-600 hover:text-amber-800">Sending Email Notifications</a></li>
            <li><a href="#advanced-features" className="text-amber-600 hover:text-amber-800">Advanced Features</a></li>
            <li><a href="#troubleshooting" className="text-amber-600 hover:text-amber-800">Troubleshooting</a></li>
          </ol>
        </div>

        <section id="overview">
          <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Overview</h2>
          <p>
            The Event Offers system allows you to create special promotions, events, or offers for your restaurant 
            and notify customers via email. This is a powerful marketing tool to:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Announce special events (holiday meals, live music, etc.)</li>
            <li>Promote limited-time offers and discounts</li>
            <li>Inform customers about seasonal menu changes</li>
            <li>Send personalized promotional content</li>
          </ul>
        </section>

        <section id="creating-event-offers">
          <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Creating Event Offers</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-2">Step 1: Access Event Offers Dashboard</h3>
          <ol className="list-decimal pl-6 my-4">
            <li>Log in to your admin dashboard</li>
            <li>Navigate to <strong>Dashboard → Event Offers</strong></li>
            <li>Click the &quot;<strong>Add New Offer</strong>&quot; button</li>
          </ol>

          <h3 className="text-xl font-semibold mt-6 mb-2">Step 2: Fill in Offer Details</h3>
          <p>Complete the form with these details:</p>
          <ul className="my-4 space-y-2">
            <li><strong>Offer Name</strong>: A clear, attention-grabbing title (e.g., &quot;Weekend Brunch Special&quot;)</li>
            <li><strong>Description</strong>: Detailed information about the offer</li>
            <li><strong>Offer Type</strong>: Select from preset types (Discount, Special Menu, Event, etc.)</li>
            <li><strong>Start Date</strong>: When the offer becomes valid</li>
            <li><strong>End Date</strong>: When the offer expires</li>
            <li><strong>Image</strong> (optional): Upload an image for the offer</li>
            <li><strong>Terms & Conditions</strong> (optional): Any restrictions or requirements</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">Step 3: Save the Offer</h3>
          <p>Click &quot;<strong>Save Offer</strong>&quot; to create the event offer. It will now appear in your Event Offers list.</p>
          
          <div className="bg-amber-50 p-4 border-l-4 border-amber-500 my-4 print:bg-white">
            <p className="text-sm"><strong>Pro Tip:</strong> Create offers well in advance of their start date to give yourself time to promote them effectively.</p>
          </div>
        </section>

        <section id="sending-email-notifications">
          <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Sending Email Notifications</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-2">Step 1: Access Email System</h3>
          <ol className="list-decimal pl-6 my-4">
            <li>Navigate to <strong>Dashboard → Email</strong></li>
            <li>You&apos;ll see two tabs:
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Event/Offer Emails</strong>: Send notifications about existing event offers</li>
                <li><strong>Custom Message</strong>: Create a custom email message</li>
              </ul>
            </li>
          </ol>

          <h3 className="text-xl font-semibold mt-6 mb-2">Step 2: Select Recipients</h3>
          <p>In the right panel:</p>
          <ol className="list-decimal pl-6 my-4">
            <li>You&apos;ll see a list of all customers with email addresses</li>
            <li>Use the search and filtering options to find specific customers</li>
            <li>Select recipients by:
              <ul className="list-disc pl-6 mt-2">
                <li>Checking individual customers</li>
                <li>Using &quot;<strong>Select All</strong>&quot; to choose everyone</li>
                <li>Filtering by name and using bulk selection</li>
              </ul>
            </li>
          </ol>

          <h3 className="text-xl font-semibold mt-6 mb-2">Step 3: Compose the Email</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-bold">For Event/Offer Emails:</h4>
              <ol className="list-decimal pl-6 mt-2">
                <li>Select the event offer from the dropdown menu</li>
                <li>Preview the offer details that will be included in the email</li>
                <li><em>Optional</em>: Test the email by entering your email address in the &quot;Test Before Sending&quot; field and clicking &quot;Test&quot;</li>
              </ol>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-bold">For Custom Messages:</h4>
              <ol className="list-decimal pl-6 mt-2">
                <li>Enter a subject line</li>
                <li>Compose your message</li>
                <li><em>Optional</em>: Test as described above</li>
              </ol>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-2">Step 4: Send the Email</h3>
          <ol className="list-decimal pl-6 my-4">
            <li>Review your selections to confirm:
              <ul className="list-disc pl-6 mt-2">
                <li>The correct offer or message</li>
                <li>The right recipients (check count)</li>
              </ul>
            </li>
            <li>Click &quot;<strong>Send to X Selected Users</strong>&quot; button</li>
            <li>Confirm in the popup dialog</li>
            <li>A progress indicator will show the email sending status</li>
          </ol>
        </section>

        <section id="advanced-features">
          <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Advanced Features</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-2">Filtering Recipients</h3>
          <ul className="list-disc pl-6 my-4">
            <li>Use the <strong>Filters</strong> button to show search and sorting options</li>
            <li>Search by name or email</li>
            <li>Sort alphabetically (A-Z or Z-A)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">Testing Emails</h3>
          <p>Always test emails before sending to customers:</p>
          <ol className="list-decimal pl-6 my-4">
            <li>Enter a test email address</li>
            <li>Click &quot;Test&quot;</li>
            <li>Check your inbox to see exactly how the email will appear to customers</li>
          </ol>

          <h3 className="text-xl font-semibold mt-6 mb-2">Tracking Results</h3>
          <p>The system provides basic statistics after sending:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Total emails attempted</li>
            <li>Successfully delivered</li>
            <li>Failed deliveries</li>
          </ul>
        </section>

        <section id="troubleshooting">
          <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Troubleshooting</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-2">Common Issues</h3>
          
          <div className="space-y-4 my-6">
            <div className="bg-white p-4 border-l-4 border-amber-600 shadow-sm">
              <h4 className="font-bold">No users appear in the list:</h4>
              <ul className="list-disc pl-6 mt-2">
                <li>Check that customers have valid email addresses</li>
                <li>Refresh the page to reload user data</li>
                <li>Ensure you have admin privileges</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 border-l-4 border-amber-600 shadow-sm">
              <h4 className="font-bold">Test emails not arriving:</h4>
              <ul className="list-disc pl-6 mt-2">
                <li>Check spam/junk folders</li>
                <li>Verify the test email address is correct</li>
                <li>Contact system administrator if persistent</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 border-l-4 border-amber-600 shadow-sm">
              <h4 className="font-bold">Emails failing to send:</h4>
              <ul className="list-disc pl-6 mt-2">
                <li>Check internet connection</li>
                <li>Ensure email service is properly configured</li>
                <li>Try sending to fewer recipients at once</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-2">Best Practices</h3>
          <ol className="list-decimal pl-6 my-4">
            <li><strong>Timing</strong>: Send promotional emails during business hours (10am-3pm) for best open rates</li>
            <li><strong>Frequency</strong>: Limit emails to 1-2 per week to prevent customer fatigue</li>
            <li><strong>Targeting</strong>: Select specific customer segments rather than always sending to everyone</li>
            <li><strong>Testing</strong>: Always send a test email to yourself first</li>
            <li><strong>Content</strong>: Keep messages concise with clear call-to-action</li>
          </ol>
        </section>

        <div className="my-10 border-t pt-6 print:border-t-0">
          <p className="text-center text-gray-500 text-sm">
            For technical support, please contact your system administrator or IT support team.
          </p>
        </div>
      </div>
    </div>
  );
} 