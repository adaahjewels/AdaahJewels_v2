import { Heart, Globe, Truck, Headphones } from 'lucide-react';

const badges = [
  { icon: Heart,       title: 'PROUDLY MADE IN INDIA',  desc: 'Supporting local artisans' },
  { icon: Globe,       title: 'WORLDWIDE SHIPPING',      desc: 'We ship globally' },
  { icon: Truck,       title: 'NO DELIVERY CHARGE!',     desc: 'Free shipping above ₹1299' },
  { icon: Headphones,  title: 'CUSTOMER SERVICE',        desc: 'Priority support 24/7' },
];

const TrustBadges = () => (
  <section className="py-12 bg-white">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((b, i) => {
          const Icon    = b.icon;
          const isLast  = i === badges.length - 1;
          return (
            <div
              key={i}
              className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-200"
              style={{
                background: isLast ? 'var(--color-brand-50)' : 'white',
                border: `1px solid ${isLast ? 'var(--color-brand-200)' : 'var(--color-neutral-200)'}`,
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)' }}
              >
                <Icon className="w-6 h-6" style={{ color: 'var(--color-brand-500)' }} />
              </div>
              <h3 className="font-display font-bold text-sm leading-snug mb-1.5" style={{ color: 'var(--color-ink)' }}>
                {b.title}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{b.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default TrustBadges;
