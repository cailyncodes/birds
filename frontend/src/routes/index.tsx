import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";

interface Bird {
  id: number;
  name: string;
  species: string;
  color: string;
}

export const useBirds = routeLoader$(async () => {
  try {
    const response = await fetch("http://localhost:8000/api/birds");
    const data = await response.json();
    return { birds: data.birds as Bird[], error: null };
  } catch (err) {
    return { 
      birds: [], 
      error: err instanceof Error ? err.message : "Failed to fetch birds" 
    };
  }
});

export default component$(() => {
  const birdsData = useBirds();

  return (
    <>
      <h1>Birds API 🐦</h1>
      
      {birdsData.value.error && (
        <div style="color: red; padding: 10px; background: #fee;">
          Error: {birdsData.value.error}
        </div>
      )}
      
      {!birdsData.value.error && (
        <div style="margin-top: 20px;">
          <h2>Bird List ({birdsData.value.birds.length} birds)</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
            {birdsData.value.birds.map((bird) => (
              <div 
                key={bird.id}
                style="border: 1px solid #ccc; border-radius: 8px; padding: 20px; background: #f9f9f9; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
              >
                <h3 style="margin-top: 0; color: #333;">{bird.name}</h3>
                <p style="margin: 8px 0;"><strong>Species:</strong> {bird.species}</p>
                <p style="margin: 8px 0;"><strong>Color:</strong> <span style={`color: ${bird.color.toLowerCase()};`}>{bird.color}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
});

export const head: DocumentHead = {
  title: "Birds API - Qwik Frontend",
  meta: [
    {
      name: "description",
      content: "A simple bird directory powered by Sanic API and Qwik",
    },
  ],
};
