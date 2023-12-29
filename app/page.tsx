'use client';

import EventCreateForm from './components/EventEditForm'
import * as React from "react";

import { v4 as uuidv4 } from 'uuid';
import { PetEvent } from './models';
import { getPetEvents, savePetEvent } from './utility';

export default function Home() {

  const [eventTimestamp, setEventTimestamp] = React.useState(new Date());
  const [eventOptions, setEventOptions] = React.useState<{ [key: string]: boolean }>({});
  const [creatingEvent, setCreatingEvent] = React.useState(false);
  const [petEvents, setPetEvents] = React.useState<PetEvent[]>([]);
  const [isFetchingPetEvents, setIsFetchingPetEvents] = React.useState(false);

  const fetchPetEvents = React.useCallback(async () => {

    setIsFetchingPetEvents(true);
    const petEvents = await getPetEvents();
    setPetEvents(petEvents);

    setIsFetchingPetEvents(false);
  }, [
    setPetEvents,
    setIsFetchingPetEvents
  ]);

  React.useEffect(() => {

    fetchPetEvents();

  }, [
    fetchPetEvents
  ]);

  const savePetEvents = React.useCallback(async () => {

    // iterate eventOptions
    for (const eventType in eventOptions) {
      // if the value is true
      if (eventOptions[eventType]) {

        setCreatingEvent(true);

        // generate a UUID, convert it to string to use as unique ID.
        const id = uuidv4().toString();

        // create a PetEvent object with the timestamp, matching type string and an empty description.
        const newEventToSave: PetEvent = {
          id: id,
          timestamp: eventTimestamp,
          type: eventType,
          description: "",
        };

        const response = await savePetEvent(newEventToSave);
        const json = await response.json();
        console.log(json);
        console.table(json.data.createPetEvent);
      }
    }

    setCreatingEvent(false);

    // reset form.
    setEventTimestamp(new Date());
    setEventOptions({});

    // fetch events again.
    fetchPetEvents();
  }, [
    eventOptions,
    eventTimestamp,
    fetchPetEvents,
    setCreatingEvent,
    setEventOptions,
    setEventTimestamp
  ]);
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
            Fetch
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
