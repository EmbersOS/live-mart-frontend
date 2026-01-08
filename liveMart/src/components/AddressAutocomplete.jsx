import React, { useState, useEffect } from 'react';

const USER_AGENT = 'live-mart-app/1.0 (your-email@example.com)';
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

export default function AddressAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `${NOMINATIM_SEARCH_URL}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
        const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSelect = (item) => {
    onChange(item);
    setQuery(item.display_name);
    setResults([]);
  };

  return (
    <div className="address-autocomplete">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search address..."
        autoComplete="off"
      />
      {loading && <div>Loading...</div>}
      {results.length > 0 && (
        <ul className="autocomplete-results">
          {results.map((item) => (
            <li key={item.place_id} onClick={() => handleSelect(item)}>
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
