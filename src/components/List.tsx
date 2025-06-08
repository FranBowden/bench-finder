export default function ListSection() {
  // Just an array of 10 placeholders
  const testItems = Array(10).fill("This is a test");

  return (
    <section
      className="
        fixed top-12 left-4
        w-84 h-120
        p-4 bg-white shadow-md z-50
      "
    >
      <h2 className="text-black mb-2 font-semibold">Nearby Benches:</h2>
      <ul className="list-none text-blue-500 border border-gray-300">
        {testItems.map((text, idx) => (
          <IndividualList key={idx} text={text} />
        ))}
      </ul>
    </section>
  );
}
function IndividualList({ text }: { text: string }) {
  return (
    <li className="border-b border-gray-300 last:border-none">
      <button className="w-full text-left hover:bg-blue-200 p-2">
        {text}
      </button>
    </li>
  );
}


