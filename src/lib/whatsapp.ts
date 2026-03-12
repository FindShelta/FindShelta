import { Property } from '../types';

const formatListingPrice = (price: number, type: Property['type']) => {
  const amount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price || 0);

  if (type === 'rent') return `${amount}/year`;
  if (type === 'shortstay') return `${amount}/night`;
  return amount;
};

export const buildListingWhatsAppUrl = (property: Property) => {
  const sanitizedNumber = (property.agentWhatsapp || '').replace(/[^0-9]/g, '');
  const imageUrl = property.images?.[0];
  const lines = [
    `Hi, I'm interested in this listing on FindShelta:`,
    `${property.title}`,
    `Price: ${formatListingPrice(property.price, property.type)}`,
    `Location: ${property.location}`,
    `Listing ID: ${property.id}`,
  ];

  if (imageUrl) {
    lines.push(`Image: ${imageUrl}`);
  }

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${sanitizedNumber}?text=${text}`;
};

