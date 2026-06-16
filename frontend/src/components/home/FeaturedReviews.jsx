import React from 'react';
import { Star, User, MessageCircle } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

// Static fallback reviews
const FALLBACK_REVIEWS = [
  {
    _id: 'fb1',
    rating: 5,
    text: "Absolutely love this brand. The heavyweight cotton tee is incredibly soft and the fit is perfect. I've bought three already — the quality speaks for itself.",
    user: { name: 'Alex M.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
    productName: 'Heavyweight Cotton Tee',
  },
  {
    _id: 'fb2',
    rating: 5,
    text: "The chunky knit sweater is everything I wanted — warm, stylish, and incredibly well made. I get compliments every time I wear it. Premium quality at a fair price.",
    user: { name: 'Priya S.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
    productName: 'Chunky Knit Sweater',
  },
  {
    _id: 'fb3',
    rating: 5,
    text: "Fast shipping and the lounge pants exceeded my expectations. Super cozy and the fabric is so much better than other brands I've tried. Will definitely be a repeat customer.",
    user: { name: 'Jordan T.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
    productName: 'Essential Lounge Pants',
  },
];

const StarRating = ({ rating }) => (
  <div className="flex text-amber-400 mb-4">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? 'currentColor' : 'none'}
        className={i < rating ? 'text-amber-400' : 'text-gray-300'}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="bg-premium-light p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
    <div>
      <StarRating rating={review.rating} />
      <p className="text-gray-600 mb-6 italic line-clamp-4">"{review.text}"</p>
    </div>

    <div className="flex items-center gap-3 border-t border-gray-200 pt-4 mt-auto">
      <div className="w-10 h-10 rounded-full bg-premium-dark flex items-center justify-center text-white overflow-hidden flex-shrink-0">
        {review.user?.avatar ? (
          <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
        ) : (
          <User size={20} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-premium-dark truncate">
          {review.user?.name || 'Anonymous'}
        </p>
        <p className="text-xs text-premium-accent truncate">
          Purchased: {review.productName}
        </p>
      </div>
    </div>
  </div>
);

const FeaturedReviews = () => {
  const [reviews, setReviews] = React.useState(FALLBACK_REVIEWS);

  React.useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        const res = await fetch('/api/reviews/featured');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mappedReviews = data.map((r) => ({
              _id: r._id,
              rating: r.rating,
              text: r.text,
              user: r.user,
              productName: r.product?.name || 'Unknown Product',
            }));
            setReviews(mappedReviews);
          }
        }
      } catch (err) {
        // Silently fallback to static reviews if API fails
      }
    };

    fetchFeaturedReviews();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-premium-accent mb-2">
            <MessageCircle size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">Testimonials</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-premium-dark">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <ScrollReveal key={review._id} delay={idx * 150}>
              <ReviewCard review={review} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedReviews;
