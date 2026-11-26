export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F5EF]">
      <section className="bg-[#063B2D] px-6 py-16 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">

          {/* Hero content */}
          <div>
            <p className="mb-4 text-sm uppercase tracking-widest text-[#D6B46A]">
              Natural Spring Water from Africa
            </p>

            <h1 className="mb-6 text-4xl font-bold md:text-6xl">
              Rock-Tama Natural Spring Water
            </h1>

            <p className="text-lg">
              Pure by Nature. African at Heart.
            </p>
          </div>

          {/* Hero image placeholder */}
          <div className="mx-auto flex aspect-[4/5] w-full max-w-[360px] items-center justify-center rounded-2xl border-2 border-dashed border-[#D6B46A] bg-[#F8F5EF] p-6 text-center text-[#063B2D]">
            <p>Rock-Tama Bottle Image Placeholder</p>
          </div>

        </div>
      </section>
    </main>
  );
}
