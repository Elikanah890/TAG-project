import { motion } from 'framer-motion';
import { User } from 'lucide-react';

type Leader = {
  name: string;
  role: { en: string; sw: string };
  bio?: { en: string; sw: string };
  image: string;
};

type Language = 'en' | 'sw';

const LeaderCard = ({
  leader,
  lang,
  featured = false,
  index = 0,
}: {
  leader: Leader;
  lang: Language;
  featured?: boolean;
  index?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className={`card-church group flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left ${
      featured ? 'border-2 border-secondary md:col-span-2' : ''
    }`}
  >
    <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-secondary transition-colors group-hover:border-primary">
      {leader.image ? (
        <img
          src={leader.image}
          alt={leader.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-secondary/10">
          <User className="h-10 w-10 text-[#8A6A00]" aria-hidden="true" />
        </div>
      )}
    </div>
    <div>
      <p className="mb-2 font-medium text-[#8A6A00]">{leader.role[lang]}</p>
      <h3 className="mb-2 font-serif text-xl font-semibold text-black">
        {leader.name}
      </h3>
      {leader.bio && (
        <p className="text-sm text-black/60">{leader.bio[lang]}</p>
      )}
    </div>
  </motion.div>
);

export default LeaderCard;
