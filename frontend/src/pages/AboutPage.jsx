import React, { useState } from 'react';
import Button from '../components/ui/Button';

const AboutPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending email. This will be hooked up to the business email later.
    setIsSubmitted(true);
    setFormData({ firstName: '', lastName: '', email: '', message: '' });
    
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div className="pt-24 pb-16 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Slogan / Hero */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-premium-dark tracking-tight mb-6">
            Redefining everyday luxury.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Uncompromising quality meets minimalist design. We believe that true luxury lies in the details of the essentials you wear every single day.
          </p>
        </div>

        {/* History & Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-premium-dark">Our History</h2>
            <p className="text-gray-600 leading-relaxed">
              Born from a desire to strip away the unnecessary, OneBuy was founded with a singular vision. We noticed a distinct gap in the market for truly premium, long-lasting basics that don't compromise on aesthetic or comfort. What started as a quest for the perfect heavyweight tee has evolved into a fully curated collection of wardrobe staples.
            </p>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-premium-dark">Goals & Achievements</h2>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to create a wardrobe of essentials that you will reach for every single day, completely replacing the cycle of fast fashion. 
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Over 10,000+ satisfied customers worldwide.</li>
              <li>Ethically crafted using premium, sustainable materials.</li>
              <li>Featured in top-tier lifestyle and fashion publications.</li>
              <li>Targeting 100% carbon-neutral operations by 2030.</li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-premium-light p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-premium-dark mb-4">Get in Touch</h2>
            <p className="text-gray-500">Have a question or feedback? We'd love to hear from you.</p>
          </div>

          {isSubmitted ? (
            <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center">
              <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
              <p>Thank you for reaching out. We will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-premium-dark mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark transition-colors"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-premium-dark mb-2">
                    Last Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-premium-dark mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark transition-colors"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-premium-dark mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark transition-colors resize-none"
                  placeholder="How can we help you?"></textarea>
              </div>

              <Button type="submit" size="lg" className="w-full py-4 text-lg">
                Send Message
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
