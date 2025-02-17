import React, { useState } from 'react';

const termsContent = [
  {
    id: 'who-we-are',
    title: 'Who Are We',
    paragraphs: [
      {
        id: 'mission',
        content: `We are a dedicated team of professionals committed to providing innovative solutions
        and services. Our platform serves as a bridge between cutting-edge technology and user-friendly
        experiences.`,
      },
      {
        id: 'vision',
        content: `Founded with the vision of making technology accessible to everyone, we continue
        to evolve and adapt to meet the changing needs of our users. Our commitment to excellence
        drives everything we do.`,
      },
      {
        id: 'values',
        content: `Our core values of innovation, integrity, and user-centricity shape our approach
        to service delivery. We believe in creating lasting relationships with our users through
        transparency and continuous improvement.`,
      },
    ],
  },
  {
    id: 'services',
    title: 'Our Services',
    paragraphs: [
      {
        id: 'services-overview',
        content: `We provide a wide range of digital services and products designed to enhance your
        online experience. Our services include but are not limited to digital content creation,
        platform hosting, and user experience optimization.`,
      },
    ],
  },
  {
    id: 'user-obligations',
    title: 'User Obligations',
    paragraphs: [
      {
        id: 'obligations-main',
        content: `As a user of our services, you agree to use our platform responsibly and in
        accordance with all applicable laws and regulations. This includes maintaining the
        confidentiality of your account information, respecting intellectual property rights,
        and engaging with our community in a respectful manner.`,
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Data',
    paragraphs: [
      {
        id: 'privacy-main',
        content: `We take your privacy seriously and are committed to protecting your personal
        information. Our data collection and processing practices comply with relevant data
        protection regulations. We implement industry-standard security measures to safeguard
        your information from unauthorized access or disclosure.`,
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    paragraphs: [
      {
        id: 'ip-main',
        content: `All content, features, and functionality of our platform, including but not
        limited to text, graphics, logos, and software, are owned by us or our licensors and
        are protected by international copyright, trademark, and other intellectual property laws.`,
      },
    ],
  },
];

export default function TermsOfUseInfo() {
  const [activeSection, setActiveSection] = useState(termsContent[0].id);

  const currentSection = termsContent.find((section) => section.id === activeSection);

  return (
    <div className="flex">
      {/* Left Menu */}
      <div className="w-1/4 p-6">
        <nav className="space-y-4">
          {termsContent.map((section) => (
            <div
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`cursor-pointer w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                activeSection === section.id ? ' text-green' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {section.title}
            </div>
          ))}
        </nav>
      </div>

      {/* Right Content */}
      <div className="w-3/4 p-8">
        <div className="max-w-3xl">
          <h1 className="custom text-2xl font-medium text-white uppercase mb-2 ">{currentSection.title}</h1>
          <div className="prose prose-invert space-y-6 mt-12">
            {currentSection.paragraphs.map((paragraph) => (
              <p key={paragraph.id} className="text-gray-300 leading-relaxed ">
                {paragraph.content}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}