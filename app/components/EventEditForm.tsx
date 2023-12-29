'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const EventOptions = [
  { value: 'pee', label: '💦 Pee' },
  { value: 'poo', label: '💩 Poo' },
  { value: 'food', label: '🍖 Food' },
  { value: 'drink', label: '🍵 Drink' },
  { value: 'debug_a', label: '🐛 debug a' },
  { value: 'debug_b', label: '🐜 debug b' },
];

///
/// A component that allows the user to edit an event with timestamp and options.
/// The user can optionally provide the default values for the options and changes are exposed via the onChange prop.
/// If timestamp not provided, default to the current datetime.
///
export default function EventEditForm(props: {
  timestamp?: Date,
  options?: { [key: string]: boolean },
  onChange?: (timestamp: Date, options: { [key: string]: boolean }) => void
}) {

  const [eventTimestamp, setEventTimestamp] = useState(props.timestamp ?? new Date());

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: boolean }>(props.options ?? {});

  const handleCheckboxChange = (event: { target: { value: any; checked: any; }; }) => {

    const newValues = {
      ...selectedOptions,
      [event.target.value]: event.target.checked
    }

    setSelectedOptions(newValues);
    // console.log(newValues);

    if (props.onChange) {
      props.onChange(eventTimestamp, newValues);
    }

  };

  return (
    <div className="">
      <label>
        Timestamp:
        <DatePicker
          showTimeSelect
          dateFormat="Pp"
          selected={eventTimestamp}
          onChange={(timestamp: any) => setEventTimestamp(timestamp)}
          className='bg-slate-950'
        />
      </label>
      <div className='grid grid-flow-row auto-rows-max'>
        {EventOptions.map((option, index) => (
          <label key={index}>
            <input
              type="checkbox"
              value={option.value}
              checked={!!selectedOptions[option.value]}
              onChange={handleCheckboxChange}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}