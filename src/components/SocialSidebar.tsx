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
    <div className="social-sidebar">
      {socialLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          target={link.href.startsWith('http') ? '_blank' : '_self'}
          rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="social-icon group"
          title={link.label}
        >
          <link.icon className={`w-5 h-5 ${link.color} group-hover:text-primary-foreground transition-colors`} />
        </a>
      ))}
    </div>
  );
};

export default SocialSidebar;