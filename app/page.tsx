'use client';

import Image from 'next/image'

import EventCreateForm from './components/EventEditForm'
import { useState } from 'react';

export default function Home() {

  const [eventTimestamp, setEventTimestamp] = useState(new Date());
  const [eventOptions, setEventOptions] = useState<{ [key: string]: boolean }>({});

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
        <br/>
        <button className='bg-slate-950 border-2 border-slate-50 font-slate-50'>💾 Save</button>
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
