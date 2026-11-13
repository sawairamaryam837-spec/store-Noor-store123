import React, { useState } from 'react';
import { Phone, Mail, Globe, MessageCircle, MapPin, CheckCircle, Send, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8 animate-fadeIn text-[#4A423D] text-xs sm:text-sm leading-relaxed">
      <div className="text-center space-y-2 border-b border-[#EADBCE] pb-6 sm:pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B88E3E]">Our Heritage & Vision</span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1C1A]">About NOOR STUDIO</h1>
        <p className="font-serif italic text-base text-[#8C827A]">
          &ldquo;Wear Your Elegance Style Of Excellence&rdquo;
        </p>
      </div>

      <div className="space-y-4">
        <p>
          Founded in Pakistan, <strong>NOOR STUDIO</strong> is a premier luxury fashion house dedicated to crafting
          extraordinary women&apos;s attire that honors our rich South Asian heritage while embracing contemporary silhouettes.
        </p>
        <p>
          From the delicate filigree of traditional zardozi, tilla, and mukesh embroideries to breezy hand-printed lawn
          and royal micro-9000 velvets, every piece in our collection tells a story of artisanal perfection. We work with
          master craftsmen and generational weavers across Lahore, Faisalabad, and Multan to bring you garments that feel
          as opulent as they look.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EADBCE] text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-[#B88E3E] mx-auto" />
          <h4 className="font-serif font-bold text-sm text-[#1F1C1A]">Authentic Fabrics</h4>
          <p className="text-xs text-[#7A7169]">100% pure Egyptian lawn, raw silk, and handloom jacquards.</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EADBCE] text-center space-y-2">
          <RefreshCw className="w-8 h-8 text-[#E89A97] mx-auto" />
          <h4 className="font-serif font-bold text-sm text-[#1F1C1A]">Impeccable Fit</h4>
          <p className="text-xs text-[#7A7169]">Tailored precisely according to Pakistani women&apos;s standard proportions.</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EADBCE] text-center space-y-2">
          <Truck className="w-8 h-8 text-[#B88E3E] mx-auto" />
          <h4 className="font-serif font-bold text-sm text-[#1F1C1A]">Doorstep Delivery</h4>
          <p className="text-xs text-[#7A7169]">Cash on Delivery across all 250+ cities and towns of Pakistan.</p>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { settings } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-10 animate-fadeIn">
      <div className="text-center space-y-2 border-b border-[#EADBCE] pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B88E3E]">Customer Care</span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1C1A]">Contact NOOR STUDIO</h1>
        <p className="text-xs text-[#7A7169] max-w-md mx-auto">
          We are here to assist you with order verification, size queries, styling advice, and delivery updates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
        {/* Contact Info (5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">Official Business Details</h3>

            <div className="space-y-4 text-[#4A423D]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EADBCE] flex items-center justify-center text-[#E89A97] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-[#1F1C1A] block">Customer Helpline (Voice)</span>
                  <a
                    href={`tel:+92${settings.helpline ? settings.helpline.replace(/^0/, '') : '3284454746'}`}
                    className="text-[#B88E3E] font-bold text-sm hover:underline"
                  >
                    {settings.helpline || '03284454746'}
                  </a>
                  <p className="text-[11px] text-[#8C827A]">Available Mon–Sat: 10:00 AM – 8:00 PM PKT</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#25D366] shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-[#1F1C1A] block">WhatsApp Support</span>
                  <a
                    href="https://wa.me/923284454746"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] font-bold text-sm hover:underline"
                  >
                    +923284454746
                  </a>
                  <p className="text-[11px] text-[#8C827A]">Direct message for quick order confirmations</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EADBCE] flex items-center justify-center text-[#B88E3E] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-[#1F1C1A] block">Business Inquiries</span>
                  <a
                    href={`mailto:${settings.email || 'support@noorstudio.pk'}`}
                    className="text-[#1F1C1A] font-medium hover:underline break-all sm:break-words"
                  >
                    {settings.email || 'support@noorstudio.pk'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EADBCE] flex items-center justify-center text-[#B88E3E] shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-[#1F1C1A] block">Official Website</span>
                  <a
                    href={settings.websiteUrl || 'https://www.noorstudio.pk'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1F1C1A] font-medium hover:underline break-all sm:break-words"
                  >
                    {settings.websiteUrl || 'https://www.noorstudio.pk'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 Cols) */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-8 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1F1C1A] mb-1">Send a Message</h3>
          <p className="text-xs text-[#7A7169] mb-4">Our dedicated concierge team will reply within 24 hours.</p>

          {submitted ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-serif font-bold text-sm text-emerald-900">Message Received!</p>
              <p className="text-xs text-emerald-700">
                Thank you for contacting NOOR STUDIO. We will reach out to you shortly via phone or email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sana Khan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sana@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Your Message or Order #</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you today?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 text-xs sm:text-sm text-[#4A423D] leading-relaxed animate-fadeIn">
      <div className="border-b border-[#EADBCE] pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">Shipping & Delivery Policy</h1>
        <p className="text-xs text-[#7A7169] mt-1">Official delivery procedures across Pakistan</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">1. Nationwide Courier Partners</h3>
        <p>
          NOOR STUDIO partners with <strong>PostEx Courier Logistics</strong> and Leopard Courier to guarantee fast,
          secure, and trackable deliveries throughout Pakistan. All orders are safely packaged in branded waterproof boxes
          to ensure your fashion ensembles arrive in pristine condition.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">2. Delivery Timelines</h3>
        <ul className="list-disc pl-5 space-y-1 text-xs text-[#6F665F]">
          <li><strong>Lahore, Karachi, Islamabad & Rawalpindi:</strong> 2 to 3 business days.</li>
          <li><strong>Other Major Cities & Towns:</strong> 3 to 4 business days.</li>
          <li><strong>Festive / Eid Seasons:</strong> 4 to 5 business days due to high courier volume.</li>
        </ul>

        <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">3. Delivery Charges</h3>
        <p>
          Standard delivery charges across Pakistan are <strong>Rs. 250</strong>. However, orders exceeding
          <strong> Rs. 5,000</strong> qualify for <strong>FREE Express Nationwide Delivery</strong>.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">4. Cash on Delivery (COD)</h3>
        <p>
          We provide Cash on Delivery (COD) services for 100% of cities in Pakistan. You only pay when the rider hands over
          your package. Please ensure exact change is available for a smooth delivery process.
        </p>
      </div>
    </div>
  );
};

export const ReturnsPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 text-xs sm:text-sm text-[#4A423D] leading-relaxed animate-fadeIn">
      <div className="border-b border-[#EADBCE] pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">Return & Exchange Policy</h1>
        <p className="text-xs text-[#7A7169] mt-1">Hassle-free 7-day customer satisfaction guarantee</p>
      </div>

      <div className="space-y-4">
        <p>
          At NOOR STUDIO, your satisfaction is our paramount priority. If your received item does not fit or if you wish to
          exchange for an alternative color or style, we gladly offer a convenient <strong>7-Day Exchange Window</strong>.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">Exchange Conditions</h3>
        <ul className="list-disc pl-5 space-y-1 text-xs text-[#6F665F]">
          <li>Items must be unworn, unwashed, and in original condition with all NOOR STUDIO tags intact.</li>
          <li>Unstitched items must be uncut and complete with all included patches and dupattas.</li>
          <li>Claims must be initiated within 7 calendar days of delivery confirmation.</li>
        </ul>

        <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">How to Initiate an Exchange</h3>
        <p>
          Simply message our WhatsApp Helpline at <a href="https://wa.me/923284454746" className="text-[#25D366] font-bold">+923284454746</a> with
          your Order Number and pictures of the item. Our concierge will arrange a reverse pickup or replacement shipment.
        </p>
      </div>
    </div>
  );
};

export const FAQsPage: React.FC = () => {
  const faqs = [
    {
      q: 'Do you offer Cash on Delivery (COD) nationwide?',
      a: 'Yes! NOOR STUDIO offers Cash on Delivery across all cities, districts, and tehsils in Pakistan through PostEx courier. You only pay in cash upon receiving your order.',
    },
    {
      q: 'How do dynamic color variations work?',
      a: 'Each product on NOOR STUDIO features dedicated color variants with authentic photography of that exact shade. When you select a color on the product details page, the photo gallery instantly updates to showcase the exact color, fabric shine, and embroidery details.',
    },
    {
      q: 'What is included in an Unstitched 3-Piece suit?',
      a: 'Unstitched 3-piece suits include a generous 3-meter shirt fabric, 2.5-meter coordinated trouser fabric, and 2.5-meter dupatta along with any embroidered neckline or daman organza patches.',
    },
    {
      q: 'How can I track my parcel?',
      a: 'You can track any order by clicking "Track Order" in the website header or account section. Simply enter your Order Number (e.g. NS-2026-XXXXX) to view live PostEx dispatch milestones.',
    },
    {
      q: 'What are your helpline hours?',
      a: 'Our customer helpline 03284454746 and WhatsApp support +923284454746 are operational Monday through Saturday, from 10:00 AM to 8:00 PM PKT.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="text-center space-y-2 border-b border-[#EADBCE] pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B88E3E]">Got Questions?</span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1C1A]">Frequently Asked Questions</h1>
        <p className="text-xs text-[#7A7169]">Everything you need to know about shopping with NOOR STUDIO</p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white border border-[#EADBCE] space-y-2">
            <h4 className="font-serif font-bold text-sm text-[#1F1C1A]">{f.q}</h4>
            <p className="text-xs text-[#5A524C] leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 animate-fadeIn text-[#4A423D] text-xs sm:text-sm leading-relaxed">
      <div className="text-center space-y-2 border-b border-[#EADBCE] pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B88E3E]">Transparency & Trust</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">Privacy Policy</h1>
        <p className="text-xs text-[#7A7169]">How NOOR STUDIO protects and safeguards your personal data</p>
      </div>

      <div className="space-y-4">
        <p>
          NOOR STUDIO is firmly committed to respecting and protecting the privacy of our customers. This Privacy Policy details the types of personal data we collect, how it is utilized, and the stringent security protocols employed to maintain confidentiality.
        </p>

        <h3 className="font-serif text-base font-bold text-[#1F1C1A]">Information We Collect</h3>
        <p>
          When you place an order or create an account, we collect necessary shipping and contact details including your full name, phone number, delivery address, city, and email. This information is solely used to fulfill your purchase, process PostEx courier booking, and send tracking notifications.
        </p>

        <h3 className="font-serif text-base font-bold text-[#1F1C1A]">Data Protection & Third Parties</h3>
        <p>
          We do not sell, rent, or trade your personal information to third parties. Customer details are shared strictly with our verified delivery courier partner (PostEx) for the purpose of doorstep delivery and cash collection.
        </p>

        <h3 className="font-serif text-base font-bold text-[#1F1C1A]">Inquiries & Assistance</h3>
        <p>
          For privacy queries or data removal requests, please reach out to our team at <a href="mailto:support@noorstudio.pk" className="text-[#B88E3E] font-medium underline">support@noorstudio.pk</a> or call helpline <a href="tel:03284454746" className="text-[#1F1C1A] font-bold">03284454746</a>.
        </p>
      </div>
    </div>
  );
};

export const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 animate-fadeIn text-[#4A423D] text-xs sm:text-sm leading-relaxed">
      <div className="text-center space-y-2 border-b border-[#EADBCE] pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B88E3E]">Store Terms</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">Terms and Conditions</h1>
        <p className="text-xs text-[#7A7169]">Guidelines and agreements governing purchases on NOOR STUDIO</p>
      </div>

      <div className="space-y-4">
        <p>
          Welcome to NOOR STUDIO. By accessing our website, browsing collections, or placing an order, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <h3 className="font-serif text-base font-bold text-[#1F1C1A]">Pricing & Product Authenticity</h3>
        <p>
          All prices are quoted in Pakistani Rupees (PKR) and include all applicable taxes unless otherwise noted. We make every effort to display garment colors and embroidery textures accurately. Minor color variations may occur depending on screen calibrating devices.
        </p>

        <h3 className="font-serif text-base font-bold text-[#1F1C1A]">Order Confirmation & Verification</h3>
        <p>
          Orders placed via Cash on Delivery (COD) may require automated or manual phone/WhatsApp verification before dispatch to ensure legitimate delivery addresses across Pakistan.
        </p>

        <h3 className="font-serif text-base font-bold text-[#1F1C1A]">Exchanges & Cancellations</h3>
        <p>
          Orders may be cancelled prior to courier handover. Once dispatched via PostEx, changes fall under our standard 7-Day Exchange Policy.
        </p>
      </div>
    </div>
  );
};
