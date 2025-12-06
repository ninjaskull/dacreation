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
      className={`py-20 md:py-28 ${isDark ? "bg-[#0f0f0f]" : "bg-white"} ${className}`}
      data-testid="section-trusted-clients"
    >
      <div className="container mx-auto px-6 max-w-7xl">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="h-px w-16 bg-[#d4af37]/50" />
              <span className="text-[#d4af37] font-medium uppercase tracking-[0.25em] text-[11px]">
                Trusted Partners
              </span>
              <div className="h-px w-16 bg-[#d4af37]/50" />
            </div>
            <h2 className={`text-2xl md:text-3xl font-serif font-normal tracking-wide ${isDark ? "text-white" : "text-gray-900"}`}>
              Preferred by Leading Organizations
            </h2>
          </motion.div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6 items-center">
          {clientLogos.map((client, index) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.4 }}
              className={`flex items-center justify-center h-20 md:h-24 px-4 rounded-lg transition-all duration-300 group ${
                isDark 
                  ? "bg-white" 
                  : "bg-gray-50/80 hover:bg-gray-100/80"
              }`}
              data-testid={`logo-client-${client.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <img
                src={client.logo}
                alt={`${client.name} logo`}
                className="max-h-10 md:max-h-12 max-w-[120px] md:max-w-[140px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
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
    <div className={`py-12 ${className}`} data-testid="section-trusted-clients-compact">
      <div className="flex items-center justify-center gap-4 mb-10">
        <div className="h-px w-10 bg-[#d4af37]/40" />
        <p className={`text-[11px] font-medium uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-gray-400"}`}>
          Trusted by
        </p>
        <div className="h-px w-10 bg-[#d4af37]/40" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4 items-center max-w-5xl mx-auto px-4">
        {clientLogos.map((client, index) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-center h-16 md:h-[72px] px-3 rounded transition-opacity duration-300 ${
              isDark ? "bg-white/95" : "bg-gray-50"
            }`}
            data-testid={`logo-compact-${client.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <img
              src={client.logo}
              alt={`${client.name} logo`}
              className="max-h-8 md:max-h-10 max-w-[100px] w-auto object-contain"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
