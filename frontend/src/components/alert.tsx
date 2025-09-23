import { useState } from "react";

const AlertComponent = () => {
  const [visable, setVisible] = useState(true);

  if (!visable) return null;
  return (
    <div className="pl-2 pr-2 pt-5">
      <div
        className="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
        role="alert"
      >
        <svg
          className="shrink-0 inline w-4 h-4 me-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
        </svg>
        <span className="sr-only">Info</span>
        <div>
          <span className="font-medium">Info alert!</span> It may take a short
          time for the server to update. If the data doesn’t appear immediately,
          please refresh the page.
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-auto bg-transparent text-blue-800 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-100 dark:hover:bg-gray-700 dark:text-blue-400 dark:hover:text-white"
          aria-label="Close"
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1l12 12M13 1L1 13"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AlertComponent;
