'use client';

import EventCreateForm, { PetEventOptions, getPetEventLabel } from './components/EventEditForm'
import * as React from "react";

import { v4 as uuidv4 } from 'uuid';
import { PetEvent } from './models';
import { getPetEvents, savePetEvent } from './utility';
import { Line, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, ScatterController, LineController, LineElement, PointElement, Legend, Title, Tooltip, LinearScale, CategoryScale, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(ScatterController, LineController, LineElement, PointElement, Legend, Title, Tooltip, LinearScale, CategoryScale, TimeScale);

const LookBackHours = 32;

export default function Home() {

  const [eventTimestamp, setEventTimestamp] = React.useState(new Date());
  const [eventOptions, setEventOptions] = React.useState<{ [key: string]: boolean }>({});
  const [creatingEvent, setCreatingEvent] = React.useState(false);
  const [petEvents, setPetEvents] = React.useState<PetEvent[]>([]);
  const [isFetchingPetEvents, setIsFetchingPetEvents] = React.useState(false);
  const [graphData, setGraphData] = React.useState<any>({ labels: [], datasets: [] });

  const fetchPetEvents = React.useCallback(async () => {

    setIsFetchingPetEvents(true);
    const petEvents = await getPetEvents({
      filterTimestampMin: new Date(new Date().getTime() - LookBackHours * 60 * 60 * 1000),  // x hours ago.
      sortTimestampDescending: true,
    });
    setPetEvents(petEvents);

    setIsFetchingPetEvents(false);

    // map petEvents to its own dataset by its type value.
    // the dataset will have a id of type value, a label of the type value and a data array of timestamps.
    // const datasets: { id: string; label: string; data: number[]; }[] = [];
    const datasets: {}[] = []
    PetEventOptions.forEach((option, index) => {
      const dataset = {
        id: option.value,
        label: option.label,
        backgroundColor: option.colour,
        data: petEvents.filter((event: PetEvent) => event.type === option.value).map((event: PetEvent) => {
          return {
            x: event.timestamp,
            y: 0.2 * index + 1,
          }
        }),
      };
      datasets.push(dataset);
    });

    setGraphData({
      labels: petEvents.map((event: PetEvent) => event.timestamp),
      datasets: datasets,
    });
  }, [
    setPetEvents,
    setIsFetchingPetEvents,
    setGraphData,
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
        // console.log(json);
        // console.table(json.data.createPetEvent);
      }
    }

    setCreatingEvent(false);

    // reset form.
    // setEventTimestamp(new Date());
    setEventOptions({});

    // fetch events again.
    fetchPetEvents();
  }, [
    eventOptions,
    eventTimestamp,
    fetchPetEvents,
    setCreatingEvent,
    setEventOptions,
    // setEventTimestamp,
  ]);

  const [showDebugEvents, setShowDebugEvents] = React.useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-5">

      {/* Quick form to create new event entries */}
      <div className='mx-40'>
        <EventCreateForm
          timestamp={eventTimestamp}
          selectedEventTypes={eventOptions}
          onEdit={(timestamp: Date, options: { [key: string]: boolean }) => {
            setEventTimestamp(timestamp);
            setEventOptions(options);

            console.log(timestamp, options);
          }}
        />
        <br />

        {!creatingEvent &&
          <button
            className='bg-slate-950 border-2 border-slate-50 p-1 font-slate-50'
            onClick={savePetEvents}
          >
            💾 Save
          </button>
        }
        {creatingEvent && <p>Saving...</p>}
      </div>

      {petEvents.length > 0 &&
        <div className="bg-white mb-32 text-center lg:w-full">
          <Scatter
            datasetIdKey="id"
            data={graphData}
            options={{
              responsive: true,
              // maintainAspectRatio: false,
              showLine: false,
              scales: {
                x: {
                  type: 'time',
                },
                y: {
                  display: false,
                  max: 3,
                  min: 0,
                },
              },
            }}
          />
        </div>
      }

      {/* Widget that shows the events in the past x hours */}
      <div>
        <h2 className={`mb-3 text-2xl font-semibold`}>
          Past {LookBackHours} hours
          {/* Recent */}
        </h2>
        {/* show a "fetching..." message if isFetchingPetEvents is true */}

        <div>
          <button
            className='bg-slate-950 border-2 border-slate-50 p-1 font-slate-50'
            onClick={fetchPetEvents}
            disabled={isFetchingPetEvents}
          >
            {isFetchingPetEvents && <span>🔃Fetching...</span>}
            {!isFetchingPetEvents && <span>🔃Fetch</span>}
          </button>
          <label>
            <input
              type="checkbox"
              checked={showDebugEvents}
              onChange={(event) => { setShowDebugEvents(event.target.checked) }} />
            Show debug events
          </label>
        </div>

        <div hidden={petEvents.length === 0}>
          <ul>
            {petEvents.map((event: PetEvent) => (
              (showDebugEvents || !event.type.startsWith('debug')) &&
              <li key={event.id}>
                <p>{event.timestamp.toLocaleString('en-AU')}: {getPetEventLabel(event.type)}</p>
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </main>
  )
}
