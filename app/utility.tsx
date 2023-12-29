import { PetEvent } from "./models";

import { v4 as uuidv4 } from 'uuid';


// savePetEvent
// @param petEvent
// @returns Promise<Response>
export async function savePetEvent(petEvent: PetEvent): Promise<Response> {
  // generate a UUID, convert it to string to use as unique ID.
  const id = uuidv4().toString();

  // create a PetEvent object with the timestamp, matching type string and an empty description.

  const gql = `
      mutation create($item: CreatePetEventInput!) {
        createPetEvent(item: $item) {
          id
          timestamp
          type
          description
        }
      }`;

  const data = {
    id: id,
    timestamp: petEvent.timestamp.toISOString(),
    type: petEvent.type,
    description: petEvent.description ?? "",
  };

  const query = {
    query: gql,
    variables: {
      item: data
    }
  };

  const response = await fetch('/data-api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });

  return response;
}

export async function getPetEvents(): Promise<PetEvent[]> {

  const response = await fetch('/data-api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
            {
              petEvents {
                items {
                  id
                  timestamp
                  type
                  description
                }
              }
            }
          `
    })
  });

  const json = await response.json();
  console.log(json);
  console.table(json.data.petEvents.items);

  // for each item in json.data.petEvents.items, convert the string into Date object if the timestamp property exists.
  json.data.petEvents.items.forEach((item: PetEvent) => {
    if (item.timestamp) {
      item.timestamp = new Date(item.timestamp);
    }
  });

  // sort the items by timestamp descending.
  json.data.petEvents.items.sort((a: PetEvent, b: PetEvent) => {
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return json.data.petEvents.items;
}