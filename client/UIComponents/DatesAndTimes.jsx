import React from 'react';
import { Box, Text, Calendar, MaskedInput } from 'grommet';
import { Icon, InputNumber } from 'antd/lib';

const segmentPad = {
  top: 'xxsmall',
  left: 'xxsmall',
  right: 'xxsmall',
  bottom: 'small'
};

const DatesAndTimes = ({
  recurrence,
  handleDateChange,
  handleStartTimeChange,
  handleFinishTimeChange,
  handleCapacityChange,
  removeRecurrence,
  isNotDeletable,
  isPublicActivity
}) => {
  const range = [recurrence.startDate, recurrence.endDate];

  if (!recurrence) {
    return null;
  }

  return (
    <Box pad="small" margin={{ bottom: 'medium' }}>
      {!isNotDeletable && (
        <Box
          pad="small"
          justify="center"
          onClick={removeRecurrence}
          hoverIndicator
        >
          <Icon style={{ fontSize: 18, cursor: 'pointer' }} type="delete" />
        </Box>
      )}
      <Box direction="row" justify="around" wrap>
        <Box pad="xsmall">
          <Calendar
            size="small"
            dates={[range]}
            onSelect={handleDateChange}
            firstDayOfWeek={1}
            range
          />
        </Box>
        <Box pad="xsmall" justify="around" flex={{ grow: 0 }} basis="180px">
          <Box pad={segmentPad}>
            <Text size="small">Start time</Text>
            <GrTimePicker
              value={recurrence.startTime}
              onChange={handleStartTimeChange}
            />
          </Box>
          <Box pad={segmentPad}>
            <Text size="small">Finish time</Text>
            <GrTimePicker
              value={recurrence.endTime}
              onChange={handleFinishTimeChange}
            />
          </Box>
          {isPublicActivity && (
            <Box pad="xxsmall">
              <Text size="small">Capacity</Text>
              <InputNumber
                min={1}
                max={90}
                placeholder={'Capacity'}
                value={recurrence.capacity}
                onChange={handleCapacityChange}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const GrTimePicker = ({ onChange, value, ...otherProps }) => (
  <MaskedInput
    size="medium"
    mask={[
      {
        length: [1, 2],
        options: Array.from(
          { length: 24 },
          (v, k) => (k < 10 ? '0' : '') + k.toString()
        ),
        regexp: /^1[0,1-2]$|^0?[1-9]$|^0$/,
        placeholder: 'hh'
      },
      { fixed: ':' },
      {
        length: 2,
        options: ['00', '15', '30', '45'],
        regexp: /^[0-5][0-9]$|^[0-9]$/,
        placeholder: 'mm'
      }
    ]}
    value={value}
    onChange={event => onChange(event.target.value)}
    {...otherProps}
  />
);

export default DatesAndTimes;
