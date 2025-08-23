import React from 'react';
import { Linkedin, MessageCircle, Phone, Mail } from 'lucide-react';

const SocialSidebar: React.FC = () => {
  const socialLinks = [
    {
      icon: Linkedin,
      href: '#',
      label: 'LinkedIn',
      color: 'text-blue-600'
    },
    {
      icon: MessageCircle,
      href: '#',
      label: 'WhatsApp',
      color: 'text-green-600'
    },
    {
      icon: Phone,
      href: '#',
      label: 'Call Us',
      color: 'text-purple-600'
    },
    {
      icon: Mail,
      href: '#',
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