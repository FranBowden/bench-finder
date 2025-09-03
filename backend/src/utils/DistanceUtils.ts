import "dotenv/config";
import { type DirectionResult } from "../../../shared/types/directionResult";

const MAPBOX_API_KEY = process.env.VITE_MAPBOX_API_KEY;

export async function getDirection(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  retries = 3,
  retryDelay = 1000
): Promise<DirectionResult | undefined> {
  //API Query:
  const coordinates = `${lon1},${lat1};${lon2},${lat2}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_API_KEY}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    //Try 3 times
    try {
      const res = await fetch(url); //wait for response from the API

      if (!res.ok) {
        //if response is unsuccessful
        if (res.status === 429 && attempt < retries) {
          //Too many requests
          await delay(retryDelay); //wait and retry request
          continue;
        }
        throw new Error(`Mapbox error ${res.status}: ${res.statusText}`); //if the status is any other error -> throw error
      }

      //parse the response as JSON
      const data = await res.json();

      if (
        Array.isArray(data.routes) && //checks if data.routes is an array
        data.routes.length > 0 && //checks if array has at least one route
        typeof data.routes[0].distance === "number" //checks if the first route has a distance property that is a number
      ) {
        //Convert meters to miles
        const mile = 0.000621371; //1 meter = 0.000621371 miles
        const distanceMiles = data.routes[0].distance * mile;
        const durationMinutes = data.routes[0].duration / 60;

        const geojson: DirectionResult["geojson"] = {
          type: "Feature",
          properties: {},
          geometry: data.routes[0].geometry,
        };

        return {
          distanceMiles, //returning the distance in miles
          durationMinutes, //returning the duration in minutes
          geojson,
        };
      } else {
        throw new Error("No valid route returned by Mapbox");
      }
    } catch (err) {
      if (attempt < retries) {
        await delay(retryDelay);
        continue;
      }
      return undefined;
    }
  }
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
