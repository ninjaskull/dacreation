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
      className={`py-16 md:py-20 ${isDark ? "bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320]" : "bg-white"} ${className}`}
      data-testid="section-trusted-clients"
    >
      <div className="container mx-auto px-4">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">
              Our Clients
            </span>
            <h2 className={`text-3xl md:text-4xl font-bold mt-2 mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Trusted by Leading Organizations
            </h2>
            <p className={`max-w-2xl mx-auto ${isDark ? "text-white/70" : "text-gray-600"}`}>
              We are proud to have partnered with some of the most prestigious organizations in India
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 items-center">
          {clientLogos.map((client, index) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-center p-6 md:p-8 rounded-xl transition-all duration-300 group ${
                isDark 
                  ? "bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105" 
                  : "bg-gray-50 border border-gray-100 hover:shadow-lg hover:border-[#601a29]/20"
              }`}
              data-testid={`logo-client-${client.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <img
                src={client.logo}
                alt={`${client.name} logo`}
                className="max-h-12 md:max-h-14 w-auto object-contain transition-all duration-300 group-hover:scale-110"
              />
            </motion.div>
          ))}
        </div>

        {!showTitle && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`text-center mt-8 text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}
          >
            Trusted by leading financial institutions and organizations across India
          </motion.p>
        )}
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
    <div className={`py-8 ${className}`} data-testid="section-trusted-clients-compact">
      <p className={`text-center text-sm font-medium uppercase tracking-wider mb-6 ${isDark ? "text-white/60" : "text-gray-500"}`}>
        Trusted by
      </p>
      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
        {clientLogos.map((client, index) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-300 ${
              isDark 
                ? "bg-white/95 hover:bg-white shadow-md hover:shadow-lg" 
                : "bg-white hover:bg-gray-50"
            }`}
            data-testid={`logo-compact-${client.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <img
              src={client.logo}
              alt={`${client.name} logo`}
              className="h-8 md:h-10 w-auto object-contain"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
