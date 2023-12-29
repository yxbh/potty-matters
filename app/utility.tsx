///
/// Reference for graphql queries: https://learn.microsoft.com/en-us/azure/static-web-apps/database-azure-cosmos-db?tabs=powershell
///

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

// Fetch pet event data from the database.
// @param props
// @returns Promise<PetEvent[]>
export async function getPetEvents(props?: any): Promise<PetEvent[]> {
  const {
    filterTimestampMin = undefined,
    sortTimestampAscending = false,
    sortTimestampDescending = false,
  } = props ?? {};

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

  let items = json.data.petEvents.items;
  console.table(items);

  // for each item in json.data.petEvents.items, convert the string into Date object if the timestamp property exists.
  items.forEach((item: PetEvent) => {
    if (item.timestamp) {
      item.timestamp = new Date(item.timestamp);
    }
  });

  if (filterTimestampMin !== undefined && filterTimestampMin instanceof Date) {
    // filter items by min timestamp.
    console.log("Filtering min timestamp by: " + filterTimestampMin.toString());
    items = items.filter((item: PetEvent) => {
      return item.timestamp >= filterTimestampMin;
    });
  }

  if (sortTimestampAscending) items.sort((a: PetEvent, b: PetEvent) => {
    return a.timestamp.getTime() - b.timestamp.getTime();
  });

  if (sortTimestampDescending) items.sort((a: PetEvent, b: PetEvent) => {
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return items;
}