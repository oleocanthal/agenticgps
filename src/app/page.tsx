export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight">AgenticGPS</h1>
        <p className="mt-3 text-lg text-gray-600">
          Assess services and talent for disruption risk from Agentic AI.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Assessment Input</h2>
            <p className="mt-2 text-sm text-gray-600">
              Add company context and paste a list of services or talents, one per line.
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Company context
              </label>
              <textarea
                className="min-h-[140px] w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
                placeholder="Example: Mid-sized life sciences consulting company with services in informatics, quality, validation, cloud, and data science."
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Services or talents
              </label>
              <textarea
                className="min-h-[220px] w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
                placeholder={`Scientific Application Managed Services
Lab Compute Services
Bioinformatics Services
Validation Consultant
Data Engineer`}
              />
            </div>

            <button className="mt-6 rounded-xl bg-black px-5 py-3 text-white transition hover:opacity-90">
              Run Assessment
            </button>
          </section>

          <section className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Results Preview</h2>
            <p className="mt-2 text-sm text-gray-600">
              Results will appear here after the backend analysis is connected.
            </p>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                No assessment run yet.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}