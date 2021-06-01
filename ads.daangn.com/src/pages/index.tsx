import * as React from 'react';
import { styled } from 'gatsby-theme-stitches/src/stitches.config';

const Text = styled('div', {
  color: '$carrot500',
});

const IndexPage = () => {
  return <Text>Hello, World</Text>;
};

export default IndexPage;
