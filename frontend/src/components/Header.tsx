import { FaGithub } from "react-icons/fa";
import benchIcon from "../../assets/bench.png";

const REPO_URL = "https://github.com/FranBowden/bench-finder";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-2.5 sm:py-4">
        <div className="flex items-center gap-3 shrink-0">
          <img
            src={benchIcon}
            alt=""
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
          />
          <div className="leading-tight">
            <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-[var(--color-text)]">
              Bench
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] bg-clip-text text-transparent">
                Finder
              </span>
            </h1>
            <p className="hidden sm:block text-xs text-[var(--color-text-muted)] font-medium">
              Find a place to sit, wherever you are
            </p>
          </div>
        </div>

        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          className="shrink-0 p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-primary-50)] transition-colors"
        >
          <FaGithub size={20} />
        </a>
      </div>
      <div className="h-[3px] w-full bg-gradient-to-r from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-primary-light)]" />
    </header>
  );
};
