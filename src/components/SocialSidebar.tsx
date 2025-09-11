import React from 'react';
import { Linkedin, MessageCircle, Phone, Mail } from 'lucide-react';

const SocialSidebar: React.FC = () => {
  const socialLinks = [
    {
      icon: Linkedin,
      href: 'https://www.linkedin.com/company/your-company', // Replace with your LinkedIn
      label: 'LinkedIn',
      color: 'text-blue-600'
    },
    {
      icon: MessageCircle,
      href: 'https://wa.me/1234567890', // Replace with your WhatsApp number
      label: 'WhatsApp',
      color: 'text-green-600'
    },
    {
      icon: Phone,
      href: 'tel:+1234567890', // Replace with your phone number
      label: 'Call Us',
      color: 'text-purple-600'
    },
    {
      icon: Mail,
      href: 'mailto:contact@example.com', // Replace with your email
      label: 'Email',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 md:fixed md:left-4 md:top-1/2 md:transform md:-translate-y-1/2 md:translate-x-0">
      <div className="flex flex-row gap-3 md:flex-col md:gap-4 bg-card/80 backdrop-blur-sm rounded-full md:rounded-2xl px-4 py-2 md:px-3 md:py-4 shadow-lg border border-border/50">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : '_self'}
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/50 hover:bg-primary hover:scale-110 transition-all duration-200 group shadow-sm"
            title={link.label}
          >
            <link.icon className={`w-4 h-4 md:w-5 md:h-5 ${link.color} group-hover:text-primary-foreground transition-colors`} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialSidebar;