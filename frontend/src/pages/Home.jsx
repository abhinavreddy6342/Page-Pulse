import { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import SearchBox from "../components/SearchBox";
import Features from "../components/Features";
import StatsGrid from "../components/StatsGrid";
import ReportSection from "../components/ReportSection";
import Footer from "../components/Footer";
import HistoryPanel from "../components/HistoryPanel";

function Home() {
  const [report, setReport] = useState(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]"></div>

      <Header />

      <main className="relative z-10 mx-auto max-w-[1280px] px-4 md:px-6">

        <Hero />

        <SearchBox setReport={setReport} />

        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Features report={report} />
            <StatsGrid report={report} />
            <ReportSection report={report} />
          </div>

          <aside className="lg:col-span-1">
            <HistoryPanel onLoad={setReport} />
          </aside>
        </div>

      </main>

      <Footer />

    </div>
  );
}

export default Home;