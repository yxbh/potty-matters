'use client';

import Image from 'next/image'

import EventCreateForm from './components/EventEditForm'
import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

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
  const fetchPetEvents = async () => {
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
    setPetEvents(json.data.PetEvent);
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
        <button
          className='bg-slate-950 border-2 border-slate-50 font-slate-50'
          onClick={savePetEvents}
        >
          💾 Save
        </button>
      </div>

      <div>
        {/* show a "saving..." message if creatingEvent is true */}
        {creatingEvent && <p>Saving...</p>}
      </div>

      <div>
        <button
          className='bg-slate-950 border-2 border-slate-50 font-slate-50'
          onClick={fetchPetEvents}
        >
          List
        </button>
      </div>

      {/* Widget that shows the events in the past 24 hours */}
      <div>
        <h2 className={`mb-3 text-2xl font-semibold`}>
          Past 24 hours
        </h2>
        <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
          Display a time graph of events.
        </p>
      </div>
    </main>
  )
}
