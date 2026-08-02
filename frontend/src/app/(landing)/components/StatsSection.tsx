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
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div className="text-5xl sm:text-6xl font-bold text-gradient mb-3">
                {stat.value}
              </div>
              <p className="text-gray-400 text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
