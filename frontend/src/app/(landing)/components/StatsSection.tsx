const stats = [
  {
    value: "< 5 min",
    label: "Average claim processing time",
  },
  {
    value: "100%",
    label: "On-chain transparency",
  },
  {
    value: "0",
    label: "Human intermediaries",
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 sm:p-8 rounded-2xl bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
            >
              <div className="text-4xl font-bold text-emerald-400 mb-2 sm:mb-3">
                {stat.value}
              </div>
              <p className="text-slate-400 text-sm sm:text-base lg:text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
