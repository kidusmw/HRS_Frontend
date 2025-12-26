import type { AvailabilityDay, Hotel, Review } from '../types'

export const mockHotels: Hotel[] = [
  {
    id: 'h1',
    name: 'Blue Nile Grand Hotel',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    address: 'Kazanchis, Addis Ababa',
    rating: 4.6,
    priceFrom: 120,
    description:
      'Modern stay near the city center with skyline views, spa, and all-day dining.',
    images: [
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
    ],
    reviewSummary: {
      averageRating: 4.6,
      totalReviews: 214,
    },
  },
  {
    id: 'h2',
    name: 'Lalibela Heights Resort',
    city: 'Lalibela',
    country: 'Ethiopia',
    address: 'Lalibela Main Road',
    rating: 4.8,
    priceFrom: 180,
    description:
      'Hilltop resort overlooking the highlands, curated tours, and local cuisine.',
    images: [
      'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    ],
    reviewSummary: {
      averageRating: 4.8,
      totalReviews: 156,
    },
  },
  {
    id: 'h3',
    name: 'Bahir Dar Lakeside Lodge',
    city: 'Bahir Dar',
    country: 'Ethiopia',
    address: 'Lake Tana Avenue',
    rating: 4.4,
    priceFrom: 95,
    description:
      'Relaxed lakeside lodge with boat access, gardens, and sunset restaurant views.',
    images: [
      'https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    ],
    reviewSummary: {
      averageRating: 4.4,
      totalReviews: 98,
    },
  },
  {
    id: 'h4',
    name: 'Simien Peaks Camp & Lodge',
    city: 'Debark',
    country: 'Ethiopia',
    address: 'Simien Mountains Park Road',
    rating: 4.7,
    priceFrom: 140,
    description:
      'Mountain lodge with guided treks, fireplaces, and panoramic canyon views.',
    images: [
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1462536943532-57a629f6cc60?auto=format&fit=crop&w=1200&q=80',
    ],
    reviewSummary: {
      averageRating: 4.7,
      totalReviews: 132,
    },
  },
]

export const mockAvailability: Record<string, AvailabilityDay[]> = {
  h1: [
    { date: '2025-01-10', roomsAvailable: 5, price: 130 },
    { date: '2025-01-11', roomsAvailable: 3, price: 135 },
    { date: '2025-01-12', roomsAvailable: 0, price: 120 },
    { date: '2025-01-13', roomsAvailable: 4, price: 128 },
  ],
  h2: [
    { date: '2025-01-10', roomsAvailable: 2, price: 190 },
    { date: '2025-01-11', roomsAvailable: 1, price: 195 },
    { date: '2025-01-12', roomsAvailable: 0, price: 185 },
    { date: '2025-01-13', roomsAvailable: 3, price: 188 },
  ],
  h3: [
    { date: '2025-01-10', roomsAvailable: 6, price: 98 },
    { date: '2025-01-11', roomsAvailable: 4, price: 100 },
    { date: '2025-01-12', roomsAvailable: 2, price: 96 },
    { date: '2025-01-13', roomsAvailable: 5, price: 97 },
  ],
  h4: [
    { date: '2025-01-10', roomsAvailable: 2, price: 150 },
    { date: '2025-01-11', roomsAvailable: 2, price: 152 },
    { date: '2025-01-12', roomsAvailable: 1, price: 155 },
    { date: '2025-01-13', roomsAvailable: 2, price: 150 },
  ],
}

export const mockReviews: Review[] = [
  {
    id: 'r1',
    hotelId: 'h1',
    userName: 'Saron M.',
    rating: 5,
    date: '2024-12-12',
    comment: 'Fantastic service, modern rooms, and great breakfast buffet.',
  },
  {
    id: 'r2',
    hotelId: 'h1',
    userName: 'Abel K.',
    rating: 4,
    date: '2024-11-21',
    comment: 'Good location, fast Wi-Fi, and a relaxing spa.',
  },
  {
    id: 'r3',
    hotelId: 'h2',
    userName: 'Liya T.',
    rating: 5,
    date: '2024-12-01',
    comment: 'Unbeatable views and authentic local dishes.',
  },
  {
    id: 'r4',
    hotelId: 'h2',
    userName: 'Dawit A.',
    rating: 4,
    date: '2024-11-18',
    comment: 'Peaceful stay, well organized tours to the churches.',
  },
  {
    id: 'r5',
    hotelId: 'h3',
    userName: 'Selam F.',
    rating: 4,
    date: '2024-10-02',
    comment: 'Lovely lakeside sunsets and friendly staff.',
  },
  {
    id: 'r6',
    hotelId: 'h4',
    userName: 'Jonas P.',
    rating: 5,
    date: '2024-12-05',
    comment: 'Great hiking basecamp, cozy fireplace lounge.',
  },
]

