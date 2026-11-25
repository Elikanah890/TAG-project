import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  label?: string;
  title: string;
  accent?: string;
  subtitle?: string;
  children?: ReactNode;
  align?: 'left' | 'center';
}

const PageHeader = ({
  label,
  title,
  accent,
  subtitle,
  children,
  align = 'left',
}: PageHeaderProps) => {
  const center = align === 'center';

  return (
    <section className="relative overflow-hidden border-b border-black/10 bg-white">
      <div
        className={`container-church relative z-10 py-14 sm:py-16 md:py-20 ${
          center ? 'text-center' : ''
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={center ? 'flex flex-col items-center' : ''}
        >
          {label && (
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/60 sm:text-xs">
              {label}
            </p>
          )}

          <h1 className="mt-4 font-serif text-4xl font-extrabold leading-[1.05] tracking-tight text-black sm:text-5xl md:text-6xl">
            {title}
            {accent && <span className="text-black"> {accent}</span>}
          </h1>

          <div
            className={`mt-5 h-1 w-16 rounded-full bg-[#FFD600] ${
              center ? 'mx-auto' : ''
            }`}
            aria-hidden="true"
          />

          {subtitle && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-black/75 sm:text-lg">
              {subtitle}
            </p>
          )}

          {children && <div className="mt-7">{children}</div>}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHeader;
