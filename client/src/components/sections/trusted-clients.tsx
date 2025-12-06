import { motion } from "framer-motion";

const clientLogos = [
  { name: "Axis Bank", logo: "/images/clients/axis_bank_logo.png" },
  { name: "BNP Paribas", logo: "/images/clients/Bnp_paribhas_logo.png" },
  { name: "HDFC Bank", logo: "/images/clients/hdfc_bank_logo.png" },
  { name: "Kotak Bank", logo: "/images/clients/kotak_bank_logo.png" },
  { name: "Standard Bank", logo: "/images/clients/standard_bank_logo.png" },
  { name: "Yes Bank", logo: "/images/clients/yes_bank_logo.png" },
];

interface TrustedClientsProps {
  variant?: "light" | "dark";
  showTitle?: boolean;
  className?: string;
}

export function TrustedClients({ 
  variant = "light", 
  showTitle = true,
  className = "" 
}: TrustedClientsProps) {
  const isDark = variant === "dark";
  
  return (
    <section 
      className={`py-16 md:py-24 relative overflow-hidden ${className}`}
      style={isDark ? {} : { backgroundColor: '#fafafa' }}
      data-testid="section-trusted-clients"
    >
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className={`h-px w-16 ${isDark ? "bg-[#d4af37]/40" : "bg-[#d4af37]/50"}`} />
              <span className={`font-medium uppercase tracking-[0.25em] text-[11px] ${isDark ? "text-[#d4af37]/80" : "text-[#d4af37]"}`}>
                Trusted Partners
              </span>
              <div className={`h-px w-16 ${isDark ? "bg-[#d4af37]/40" : "bg-[#d4af37]/50"}`} />
            </div>
            <h2 className={`text-2xl md:text-3xl font-serif font-normal tracking-wide ${isDark ? "text-white/90" : "text-gray-900"}`}>
              Preferred by Leading Organizations
            </h2>
          </motion.div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-10 items-center">
          {clientLogos.map((client, index) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.4 }}
              className="flex items-center justify-center h-16 md:h-20 px-2 transition-all duration-300 group"
              data-testid={`logo-client-${client.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <img
                src={client.logo}
                alt={`${client.name} logo`}
                className="max-h-12 md:max-h-14 max-w-[130px] md:max-w-[150px] w-auto object-contain transition-all duration-300 group-hover:scale-105"
                style={isDark ? { 
                  filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.6)) drop-shadow(0 0 4px rgba(255,255,255,0.8))'
                } : {}}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustedClientsCompact({ 
  variant = "light",
  className = "" 
}: { variant?: "light" | "dark"; className?: string }) {
  const isDark = variant === "dark";
  
  return (
    <div className={`py-10 relative ${className}`} data-testid="section-trusted-clients-compact">
      <div className="flex items-center justify-center gap-4 mb-8 relative z-10">
        <div className="h-px w-10 bg-[#d4af37]/40" />
        <p className={`text-[11px] font-medium uppercase tracking-[0.2em] ${isDark ? "text-[#d4af37]/60" : "text-gray-400"}`}>
          Trusted by
        </p>
        <div className="h-px w-10 bg-[#d4af37]/40" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 items-center max-w-5xl mx-auto px-4 relative z-10">
        {clientLogos.map((client, index) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-center h-14 md:h-16 px-2 transition-all duration-300 group"
            data-testid={`logo-compact-${client.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <img
              src={client.logo}
              alt={`${client.name} logo`}
              className="max-h-10 md:max-h-12 max-w-[110px] w-auto object-contain transition-all duration-300 group-hover:scale-105"
              style={isDark ? { 
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5)) drop-shadow(0 0 3px rgba(255,255,255,0.7))'
              } : {}}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
