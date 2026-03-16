import React, { FormEvent, useMemo, useState } from 'react';
import { askKnowItAll, KnowItAllResult, SourceLink } from './services/gemini';

const loadingTips = [
  'Kaynaklar taranıyor…',
  'Kesin cevap hazırlanıyor…',
  'Google destekli doğrulama yapılıyor…',
];

const SourceItem: React.FC<{ source: SourceLink; index: number }> = ({ source, index }) => (
  <a
    href={source.url}
    target="_blank"
    rel="noreferrer"
    className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-500 hover:bg-blue-50"
  >
    <p className="text-xs uppercase tracking-wide text-slate-500">Kaynak {index + 1}</p>
    <p className="line-clamp-1 text-sm font-semibold text-slate-900">{source.title}</p>
    <p className="line-clamp-1 text-xs text-slate-500">{source.url}</p>
  </a>
);

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<KnowItAllResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  const canSearch = query.trim().length > 2 && !loading;

  const loadingMessage = useMemo(() => loadingTips[tipIndex % loadingTips.length], [tipIndex]);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSearch) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const tipTimer = window.setInterval(() => {
      setTipIndex((current) => current + 1);
    }, 1000);

    try {
      const response = await askKnowItAll(query.trim());
      setResult(response);
    } catch (searchError) {
      console.error(searchError);
      setError('Cevap alınamadı. API anahtarını kontrol edip tekrar deneyin.');
    } finally {
      window.clearInterval(tipTimer);
      setLoading(false);
      setTipIndex(0);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900 md:py-14">
      <section className="mx-auto w-full max-w-3xl">
        <h1 className="text-center text-4xl font-bold tracking-tight text-blue-700 md:text-5xl">KnowİtALL</h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 md:text-base">
          Google destekli, tek kutuda net cevap veren arama deneyimi. Uzun sonuç listeleri yok; yalnızca
          doğrudan cevap ve güvenilir kaynaklar.
        </p>

        <form onSubmit={handleSearch} className="mt-8 rounded-2xl border border-slate-200 p-3 shadow-sm md:p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Sorunu yaz (örn. 'Ay neden parlak görünür?')"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              aria-label="Arama sorusu"
            />
            <button
              type="submit"
              disabled={!canSearch}
              className="rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Ara
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-5 text-sm text-blue-800">
            {loadingMessage}
          </div>
        )}

        {error && <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {result && (
          <section className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Kesin cevap</p>
              <p className="mt-2 text-lg leading-relaxed text-slate-900 md:text-xl">{result.answer}</p>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Kaynaklar</p>
              {result.sources.length > 0 ? (
                <div className="grid gap-2">
                  {result.sources.slice(0, 3).map((source, index) => (
                    <SourceItem key={`${source.url}-${index}`} source={source} index={index} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">Kaynak bulunamadı.</p>
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
};

export default App;
