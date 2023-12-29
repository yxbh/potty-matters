'use client';

import * as React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export const PetEventOptions = [
  { value: 'pee', label: '💦 Pee', colour: 'rgb(99, 255, 132)' },
  { value: 'poo', label: '💩 Poo', colour: 'rgb(255, 132, 99)' },
  { value: 'food', label: '🍖 Food', colour: 'rgb(132, 99, 255)' },
  { value: 'drink', label: '🍵 Drink', colour: 'rgb(255, 99, 132)' },
  { value: 'debug_a', label: '🐛 debug a', colour: 'rgb(255, 99, 132)' },
  { value: 'debug_b', label: '🐜 debug b', colour: 'rgb(255, 132, 99)' },
];

// Function that converts a pet event type value to its matching label if there exists one.
export function getPetEventLabel(type: string): string {
  const option = PetEventOptions.find((option) => option.value === type);
  return option?.label ?? type;
}

export interface EventEditFormProps {
  timestamp: Date,
  selectedEventTypes: { [key: string]: boolean },
  onEdit: (timestamp: Date, options: { [key: string]: boolean }) => void
}

///
/// A component that allows the user to edit an event with timestamp and options.
/// The user can optionally provide the default values for the options and changes are exposed via the onChange prop.
/// If timestamp not provided, default to the current datetime.
///
const EventEditForm: React.FC<EventEditFormProps> = (props) => {

  const handleTimestampChange = React.useCallback(
    (newTimestamp: any) => {

      if (props.onEdit) {
        props.onEdit(newTimestamp, props.selectedEventTypes);
      }
    },
    [
      props,
    ]);

  const handleCheckboxChange = React.useCallback(
    (event: { target: { value: any; checked: any; }; }) => {

      const newValues = {
        ...props.selectedEventTypes,
        [event.target.value]: event.target.checked
      }

      if (props.onEdit) {
        props.onEdit(props.timestamp, newValues);
      }

    }, [
    props,
  ]);

  const setTimestampToNow = React.useCallback(
    async () => {
      handleTimestampChange(new Date());
    }, [
    handleTimestampChange,
  ]);

  return (
    <div className="">
      <label>
        Timestamp:
        <DatePicker
          showTimeSelect
          dateFormat="Pp"
          selected={props.timestamp}
          onChange={handleTimestampChange}
          className='bg-slate-950'
        />
        <button
          className='bg-slate-950 border-2 border-slate-50 p-1 font-slate-50'
          onClick={setTimestampToNow}
        >
          Now
        </button>
      </label>
      <div className='grid grid-flow-row auto-rows-max'>
        {PetEventOptions.map((option, index) => (
          <label key={index}>
            <input
              type="checkbox"
              value={option.value}
              checked={!!props.selectedEventTypes[option.value]}
              onChange={handleCheckboxChange}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default EventEditForm;