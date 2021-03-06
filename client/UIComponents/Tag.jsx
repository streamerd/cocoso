import React from 'react';
import { Box, Button, Text } from 'grommet';
import { Close } from 'grommet-icons';

const Tag = ({
  label,
  onClick,
  removable = false,
  onRemove,
  background = 'accent-4',
  ...otherProps
}) => (
  <Box
    background={background}
    alignSelf="start"
    direction="row"
    align="center"
    round="2px"
    pad="2px 4px"
    gap="small"
    {...otherProps}
  >
    <Box onClick={onClick}>
      <Text size="12px" weight="bold" color="dark-1">
        {label && label.toUpperCase()}
      </Text>
    </Box>
    {removable && (
      <Button
        plain
        onClick={onRemove}
        icon={<Close color="dark-2" size="small" />}
      />
    )}
  </Box>
);

export default Tag;
