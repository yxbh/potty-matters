'use client';

import EventCreateForm from './components/EventEditForm'
import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';
import { PetEvent } from './models';

export default function Home() {

  const [eventTimestamp, setEventTimestamp] = useState(new Date());
  const [eventOptions, setEventOptions] = useState<{ [key: string]: boolean }>({});
  const [creatingEvent, setCreatingEvent] = useState(false);

  const savePetEvents = async () => {

    // iterate eventOptions
    for (const eventType in eventOptions) {
      // if the value is true
      if (eventOptions[eventType]) {

        setCreatingEvent(true);

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
          timestamp: eventTimestamp.toISOString(),
          type: eventType,
          description: "",
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
        const json = await response.json();
        console.log(json);
        console.table(json.data.createPetEvent);
      }
    }

    setCreatingEvent(false);

    // reset form.
    setEventTimestamp(new Date());
    setEventOptions({});
  }

  const [petEvents, setPetEvents] = useState([]);
  const [isFetchingPetEvents, setIsFetchingPetEvents] = useState(false);
  const fetchPetEvents = async () => {
    setIsFetchingPetEvents(true);
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
    setIsFetchingPetEvents(false);
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

    setPetEvents(json.data.petEvents.items);
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      {/* Quick form to create new event entries */}
      <div>
        <EventCreateForm
          timestamp={eventTimestamp}
          options={eventOptions}
          onChange={(timestamp: Date, options: { [key: string]: boolean }) => {
            setEventTimestamp(timestamp);
            setEventOptions(options);

            console.log(timestamp, options);
          }}
        />
        <br />

        {!creatingEvent &&
          <button
            className='bg-slate-950 border-2 border-slate-50 font-slate-50'
            onClick={savePetEvents}
          >
            💾 Save
          </button>
        }
        {creatingEvent && <p>Saving...</p>}
      </div>

      <div>
        {/* show a "fetching..." message if isFetchingPetEvents is true */}
        {isFetchingPetEvents && <p>Fetching...</p>}
        {!isFetchingPetEvents &&
          <button
            className='bg-slate-950 border-2 border-slate-50 font-slate-50'
            onClick={fetchPetEvents}
          >
            List
          </button>
        }
      </div>

      {/* Widget that shows the events in the past 24 hours */}
      <div>
        <h2 className={`mb-3 text-2xl font-semibold`}>
          {/* Past 24 hours */}
          Recent
        </h2>
        <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
          TODO: Display a time graph of events.
        </p>

        {petEvents.length > 0 &&
          <div>
            <ul>
              {petEvents.map((event: PetEvent) => (
                <li key={event.id}>
                  <p>{event.timestamp.toLocaleString('en-AU')}: {event.type}</p>
                </li>
              ))}
            </ul>
          </div>
        }
      </div>
    </main>
  )
}
