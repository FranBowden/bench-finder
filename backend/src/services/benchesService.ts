import { type Bench } from "../../../shared/types/bench";
//A function that takes a bench object and returns the image url or undefined if it doesnt exist
const getBenchImage = (bench: {
  image?: string;
  tag?: { image?: string };
}): string | undefined => bench.image || bench.tag?.image;

//fetching benches with overpass API
export async function fetchBenches(
  userLat: number,
  userLng: number
): Promise<Bench[]> {
  //Fetching API:
  const amount = 1000;
  const query = `
    [out:json];
    (
      node["amenity"="bench"](around:${amount},${userLat},${userLng});
      way["amenity"="bench"](around:${amount},${userLat},${userLng});
      relation["amenity"="bench"](around:${amount},${userLat},${userLng});
    );
    out center tags;
  `;

  try {
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json(); //store the response

    //assigning data
    return data.elements
      .map((bench: any, index: number) => {
        let lat = bench.lat ?? bench.center?.lat;
        let lng = bench.lon ?? bench.center?.lon;

        if (lat && lng) {
          return {
            id: index,
            lat,
            lng,
            tags: bench.tags,
            imageUrl: getBenchImage(bench.tags),
          };
        }
        return null;
      })
      .filter(Boolean) as Bench[]; //remove any undefined/null benches
  } catch (err) {
    console.error("Error fetching benches:", err); //Catch errors
    return [];
  }
}
